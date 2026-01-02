import express from 'express';
import {
    register,
    login,
    refreshToken,
    logout,
    getMe
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/refresh
router.post('/refresh', refreshToken);

// POST /api/auth/logout
router.post('/logout', logout);

// GET /api/auth/me
router.get('/me', requireAuth, getMe);

export default router;
