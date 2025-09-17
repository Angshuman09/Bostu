import express from 'express';
import { SignupController, LoginController, LogoutController, refreshToken } from '../controllers/auth.controller.js';
const router = express.Router();


router.post('/signup', SignupController);
router.post('/login', LoginController);
router.post('/logout', LogoutController);
router.post('/refreshToken', refreshToken);

export default router;