import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export function signAccessToken(payload) {
    return jwt.sign(payload, config.jwtAccessSecret, {
        expiresIn: config.jwtAccessExpiresIn
    });
}

export function signRefreshToken(payload) {
    return jwt.sign(payload, config.jwtRefreshSecret, {
        expiresIn: config.jwtRefreshExpiresIn
    });
}

export function verifyAccessToken(token) {
    return jwt.verify(token, config.jwtAccessSecret);
}

export function verifyRefreshToken(token) {
    return jwt.verify(token, config.jwtRefreshSecret);
}

