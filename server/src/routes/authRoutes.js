import express from 'express';
import {
  signup,
  login,
  logout,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 1. Signup & Email verification
router.post('/signup', signup);
router.get('/verify-email/:token', verifyEmail);

// 2. Login & Logout
router.post('/login', login);
router.post('/logout', logout);

// 3. Auth Guard (Current Authenticated User)
router.get('/me', protect, getMe);

// 4. Forgot & Reset Password
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
