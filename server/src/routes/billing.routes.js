import express from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js'; // jo bhi tum use kar rahe ho
import { getMyBilling, adminGrantCredits, upgradePlan } from '../controllers/billing.controller.js';

const router = express.Router();

router.use(requireAuth);     // saare billing routes ke liye login required

router.get('/me', getMyBilling);
router.post('/admin/grant', adminGrantCredits);
router.post("/upgrade", upgradePlan);

export default router;
