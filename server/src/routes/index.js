import express from 'express';
import reviewRoutes from './review.routes.js';
import authRoutes from './auth.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/reviews', reviewRoutes);

export default router;