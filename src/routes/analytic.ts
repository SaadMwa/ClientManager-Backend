// routes/analyticsRoutes.js
import express from 'express';
import { protect } from "../middleware/authmiddleware.js";
import { GetRevenueData} from '../controllers/analyticsController.js';
import { getinsights } from '../controllers/insightController.js';

const router = express.Router();


router.use(protect);

// GET /api/analytics/revenue
router.get('/revenue',GetRevenueData);
router.get('/insights', getinsights);

export default router;