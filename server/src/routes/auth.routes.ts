import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  handleSignup,
  handleLogin,
  handleMe,
  handleLogout,
  handleForgotPassword,
  handleVerifyResetToken,
  handleResetPassword,
  handleUpdateAccount,
  handleDeleteAccount,
  handleSyncLibrary
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

// Strict rate limiting on authentication routes to mitigate brute-force attempts
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again later.' }
});

const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many password reset requests. Please try again later.' }
});

authRouter.post('/signup', authRateLimit, handleSignup);
authRouter.post('/login', authRateLimit, handleLogin);
authRouter.get('/me', requireAuth, handleMe);
authRouter.post('/logout', requireAuth, handleLogout);

authRouter.post('/forgot-password', passwordResetRateLimit, handleForgotPassword);
authRouter.get('/verify-reset-token', handleVerifyResetToken);
authRouter.post('/reset-password', passwordResetRateLimit, handleResetPassword);

authRouter.put('/account', requireAuth, handleUpdateAccount);
authRouter.delete('/account', requireAuth, handleDeleteAccount);

authRouter.get('/sync', requireAuth, handleSyncLibrary);
authRouter.post('/sync', requireAuth, handleSyncLibrary);
