import type { Response } from 'express';
import crypto from 'node:crypto';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  deleteUser,
  createSession,
  deleteSession,
  deleteUserSessions,
  createPasswordReset,
  findPasswordReset,
  markPasswordResetUsed
} from '../services/authStore.js';
import {
  hashPassword,
  verifyPassword,
  generateRandomToken,
  sanitizeUser
} from '../utils/security.js';
import {
  validateSignupInput,
  validateLoginInput,
  validateForgotPasswordInput,
  validateResetPasswordInput,
  validatePassword
} from '../validators/auth.schema.js';

const SESSION_EXPIRY_DAYS_REMEMBER = 30;
const SESSION_EXPIRY_DAYS_NORMAL = 1;
const RESET_TOKEN_EXPIRY_HOURS = 1;

export async function handleSignup(req: AuthenticatedRequest, res: Response): Promise<void> {
  const validation = validateSignupInput(req.body);
  if (!validation.valid || !validation.data) {
    res.status(400).json({ error: validation.error || 'Invalid signup input.' });
    return;
  }

  const { email, password, name } = validation.data;

  const existing = await findUserByEmail(email);
  if (existing) {
    res.status(409).json({ error: 'An account with this email address already exists.' });
    return;
  }

  const passwordHash = await hashPassword(password);
  const now = new Date();
  const userId = crypto.randomUUID();

  const user = await createUser({
    _id: userId,
    email,
    passwordHash,
    name,
    createdAt: now,
    updatedAt: now,
    syncEnabled: false // Privacy requirement: explicit opt-in only
  });

  // Automatically sign in upon registration
  const token = generateRandomToken(32);
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS_REMEMBER * 24 * 60 * 60 * 1000);

  await createSession({
    _id: '',
    token,
    userId,
    expiresAt,
    createdAt: now
  });

  res.status(201).json({
    message: 'Account created successfully.',
    user: sanitizeUser(user),
    token
  });
}

export async function handleLogin(req: AuthenticatedRequest, res: Response): Promise<void> {
  const validation = validateLoginInput(req.body);
  if (!validation.valid || !validation.data) {
    res.status(400).json({ error: validation.error || 'Invalid login input.' });
    return;
  }

  const { email, password, rememberMe } = validation.data;
  const user = await findUserByEmail(email);

  if (!user) {
    // Generic error to prevent email enumeration
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);
  if (!isValidPassword) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const token = generateRandomToken(32);
  const days = rememberMe ? SESSION_EXPIRY_DAYS_REMEMBER : SESSION_EXPIRY_DAYS_NORMAL;
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  await createSession({
    _id: '',
    token,
    userId: user._id,
    expiresAt,
    createdAt: new Date()
  });

  res.json({
    message: 'Welcome back.',
    user: sanitizeUser(user),
    token
  });
}

export async function handleMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated.' });
    return;
  }
  res.json({ user: sanitizeUser(req.user) });
}

export async function handleLogout(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (req.sessionToken) {
    await deleteSession(req.sessionToken);
  }
  res.json({ success: true, message: 'Signed out successfully.' });
}

export async function handleForgotPassword(req: AuthenticatedRequest, res: Response): Promise<void> {
  const validation = validateForgotPasswordInput(req.body);
  if (!validation.valid || !validation.data) {
    res.status(400).json({ error: validation.error || 'Invalid email.' });
    return;
  }

  const { email } = validation.data;
  const user = await findUserByEmail(email);

  // If user exists, create secure reset token
  if (user) {
    const token = generateRandomToken(32);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await createPasswordReset({
      _id: '',
      token,
      userId: user._id,
      email: user.email,
      expiresAt,
      used: false,
      createdAt: new Date()
    });

    // In local development / testing, log the reset link for convenience
    console.log(`[AUTH] Password reset requested for ${user.email}. Token: ${token}`);
  }

  // Always return generic confirmation to protect privacy
  res.json({
    success: true,
    message: 'If an account exists with this email address, password reset instructions have been sent.'
  });
}

export async function handleVerifyResetToken(req: AuthenticatedRequest, res: Response): Promise<void> {
  const token = typeof req.query.token === 'string' ? req.query.token.trim() : '';
  if (!token) {
    res.status(400).json({ valid: false, error: 'Token is required.' });
    return;
  }

  const resetDoc = await findPasswordReset(token);
  if (!resetDoc) {
    res.status(400).json({ valid: false, error: 'Reset link has expired or already been used.' });
    return;
  }

  res.json({ valid: true, email: resetDoc.email });
}

export async function handleResetPassword(req: AuthenticatedRequest, res: Response): Promise<void> {
  const validation = validateResetPasswordInput(req.body);
  if (!validation.valid || !validation.data) {
    res.status(400).json({ error: validation.error || 'Invalid password reset input.' });
    return;
  }

  const { token, newPassword } = validation.data;
  const resetDoc = await findPasswordReset(token);
  if (!resetDoc) {
    res.status(400).json({ error: 'This password reset link is invalid or has expired.' });
    return;
  }

  const user = await findUserById(resetDoc.userId);
  if (!user) {
    res.status(400).json({ error: 'User account no longer exists.' });
    return;
  }

  const newHash = await hashPassword(newPassword);
  await updateUser(user._id, { passwordHash: newHash });
  await markPasswordResetUsed(token);

  // Invalidate any other active sessions for security
  await deleteUserSessions(user._id);

  res.json({
    success: true,
    message: 'Your password has been reset successfully. Please sign in with your new password.'
  });
}

export async function handleUpdateAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated.' });
    return;
  }

  const { name, syncEnabled, currentPassword, newPassword } = req.body || {};
  const updates: Partial<typeof req.user> = {};

  if (typeof name === 'string') {
    updates.name = name.trim().slice(0, 100);
  }

  if (typeof syncEnabled === 'boolean') {
    updates.syncEnabled = syncEnabled;
  }

  // Password change handling
  if (newPassword) {
    const passCheck = validatePassword(newPassword);
    if (!passCheck.valid) {
      res.status(400).json({ error: passCheck.error });
      return;
    }
    if (!currentPassword) {
      res.status(400).json({ error: 'Current password is required to set a new password.' });
      return;
    }
    const isCurrentCorrect = await verifyPassword(currentPassword, req.user.passwordHash);
    if (!isCurrentCorrect) {
      res.status(400).json({ error: 'Current password is incorrect.' });
      return;
    }
    updates.passwordHash = await hashPassword(newPassword);
  }

  const updated = await updateUser(req.user._id, updates);
  if (!updated) {
    res.status(500).json({ error: 'Failed to update account.' });
    return;
  }

  res.json({
    message: 'Account updated successfully.',
    user: sanitizeUser(updated)
  });
}

export async function handleDeleteAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated.' });
    return;
  }

  const userId = req.user._id;
  await deleteUser(userId);

  res.json({
    success: true,
    message: 'Your account and all associated sessions have been deleted.'
  });
}

export async function handleSyncLibrary(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated.' });
    return;
  }

  // Privacy protection: library synchronization requires explicit opt-in
  if (!req.user.syncEnabled) {
    res.status(403).json({
      error: 'Library synchronization is disabled. Enable Cloud Library Sync in Account Settings to synchronize.'
    });
    return;
  }

  if (req.method === 'POST') {
    const { feeds } = req.body || {};
    if (!Array.isArray(feeds)) {
      res.status(400).json({ error: 'feeds must be an array of feed URLs.' });
      return;
    }
    const safeFeeds = feeds.filter((f) => typeof f === 'string' && f.length < 2048).slice(0, 500);
    await updateUser(req.user._id, { syncedFeeds: safeFeeds });
    res.json({ success: true, message: `Synced ${safeFeeds.length} feeds to your account.` });
    return;
  }

  // GET
  res.json({
    syncedFeeds: req.user.syncedFeeds || []
  });
}
