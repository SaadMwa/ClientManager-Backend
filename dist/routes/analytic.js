// routes/analyticsRoutes.js
import express from 'express';
import { protect } from "../middleware/authmiddleware.js";
import { GetRevenueData } from '../controllers/analyticsController.js';
const router = express.Router();
router.use(protect);
// GET /api/analytics/revenue
router.get('/revenue', GetRevenueData);
export default router;
//# sourceMappingURL=analytic.js.map