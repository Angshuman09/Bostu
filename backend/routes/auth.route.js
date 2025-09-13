import express from 'express';
import { SignupController, LoginController, LogoutController } from '../controllers/auth.controller.js';
const router = express.Router();


router.post('/signup', SignupController);
router.post('/signup', LoginController);
router.post('/signup', LogoutController);

export default router;