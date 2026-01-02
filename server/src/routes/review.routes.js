import express from 'express';
import { createSimpleReview, listReviews, getReviewById } from '../controllers/review.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Saare review endpoints authenticated user ke liye
router.use(requireAuth);

// List history
// GET /api/reviews?limit=20&page=1
router.get('/', listReviews);

// Get single review (request + result)
// GET /api/reviews/:id
router.get('/:id', getReviewById);

// Create new simple review
// POST /api/reviews/simple
router.post('/simple', createSimpleReview);

export default router;