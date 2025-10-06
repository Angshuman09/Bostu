import express from 'express';
import { isAuthenticated } from '../middleware/auth.middleware.js';
import { getCouponController, validateCouponController } from '../controllers/coupon.controller.js';

const router = express.Router();

router.get('/', isAuthenticated, getCouponController);
router.get('/validate', isAuthenticated, validateCouponController);

export default router;