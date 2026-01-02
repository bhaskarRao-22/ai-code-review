import { User } from '../models/User.model.js';
import { grantCreditsToUser } from '../services/billingService.js';
import { PLANS } from "../config/plans.js";

export async function getMyBilling(req, res, next) {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const user = await User.findById(userId).lean();
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        return res.json({
            success: true,
            credits: user.credits || { balance: 0, totalGranted: 0, totalUsed: 0 }
        });
    } catch (err) {
        next(err);
    }
}

// simple admin guard helper (ya tumhare auth middleware ka use karo)
function isAdmin(req) {
    return req.user && req.user.role === 'admin';
}

export async function adminGrantCredits(req, res, next) {
    try {
        if (!isAdmin(req)) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const { userId, amount, reason } = req.body;
        if (!userId || typeof amount !== 'number') {
            return res.status(400).json({ success: false, message: 'userId and amount are required' });
        }

        const updatedUser = await grantCreditsToUser(userId, amount, reason || 'admin_grant');

        return res.json({
            success: true,
            message: 'Credits granted successfully',
            credits: updatedUser.credits
        });
    } catch (err) {
        next(err);
    }
}

export async function upgradePlan(req, res) {
    const { planName } = req.body;
    const userId = req.user._id;

    if (!["free", "pro", "team"].includes(planName)) {
        return res.status(400).json({ message: "Invalid plan selected" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.planName = planName;
    user.credits = PLANS[planName].monthlyCredits; // immediate top-up
    user.lastCreditReset = new Date();

    await user.save();

    res.json({
        success: true,
        message: `Upgraded to ${PLANS[planName].name}`,
        credits: user.credits
    });
}
