import { User } from '../models/User.model.js';
import { config } from '../config/env.js';
import {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken
} from '../utils/jwt.js';
import { PLANS } from "../config/plans.js";

function setRefreshTokenCookie(res, token) {
    const isProduction = config.nodeEnv === 'production';
    res.cookie('refreshToken', token, {
        httpOnly: true,
        // secure: false, // prod me true + https
        secure: isProduction, // prod me true + https
        sameSite: isProduction ? 'strict' : 'lax',
        path: '/api/auth/refresh'
    });
}

function refreshMonthlyCredits(user) {
    const now = new Date();

    const last = user.lastCreditReset ? new Date(user.lastCreditReset) : null;

    const isFirstTime = !last;
    const isNewMonth =
        last &&
        (last.getMonth() !== now.getMonth() ||
            last.getFullYear() !== now.getFullYear());

    if (isFirstTime || isNewMonth) {
        const plan = PLANS[user.planName] || PLANS.free;

        // IMPORTANT: credits must be an object (NOT a number)
        user.credits = {
            balance: plan.monthlyCredits,
            totalGranted: plan.monthlyCredits,
            totalUsed: 0
        };

        user.lastCreditReset = now;
    }
}


export async function register(req, res, next) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: 'Email already in use' });
        }

        const user = await User.create({ name, email, password });

        const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
        const refreshToken = signRefreshToken({ sub: user._id.toString() });

        setRefreshTokenCookie(res, refreshToken);

        return res.status(201).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            accessToken
        });
    } catch (err) {
        next(err);
    }
}

export async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // ---- REFRESH MONTHLY CREDITS ----
        refreshMonthlyCredits(user);
        await user.save();

        // ---- TOKENS ----
        const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
        const refreshToken = signRefreshToken({ sub: user._id.toString() });

        setRefreshTokenCookie(res, refreshToken);

        return res.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                credits: user.credits,
                planName: user.planName
            },
            accessToken
        });
    } catch (err) {
        next(err);
    }
}

export async function refreshToken(req, res, next) {
    try {
        const token = req.cookies?.refreshToken;
        if (!token) {
            return res.status(401).json({ message: 'No refresh token' });
        }

        let decoded;
        try {
            decoded = verifyRefreshToken(token);
        } catch (err) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        const userId = decoded.sub;
        const accessToken = signAccessToken({ sub: userId });

        return res.json({
            success: true,
            accessToken
        });
    } catch (err) {
        next(err);
    }
}

export async function logout(req, res, next) {
    try {
        res.clearCookie('refreshToken', {
            path: '/api/auth/refresh'
        });

        return res.json({ success: true, message: 'Logged out' });
    } catch (err) {
        next(err);
    }
}

export async function getMe(req, res, next) {
    try {
        // requireAuth middleware se req.user aa chuka hoga
        return res.json({
            success: true,
            user: req.user
        });
    } catch (err) {
        next(err);
    }
}
