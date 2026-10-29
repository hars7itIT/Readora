import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, generateRandomToken } from '../src/utils/security.js';
import {
  validateSignupInput,
  validateLoginInput,
  validateResetPasswordInput
} from '../src/validators/auth.schema.js';
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  createSession,
  findSessionByToken,
  deleteSession,
  createPasswordReset,
  findPasswordReset,
  markPasswordResetUsed,
  resetStoreForTests
} from '../src/services/authStore.js';

test('Password security: hashes and verifies with scrypt', async () => {
  const password = 'CorrectHorseBatteryStaple!99';
  const hash = await hashPassword(password);

  assert.ok(hash.startsWith('scrypt:'));
  assert.equal(await verifyPassword(password, hash), true);
  assert.equal(await verifyPassword('WrongPassword123', hash), false);
});

test('Auth validators: enforces strong inputs', () => {
  // Invalid signup email
  const badEmail = validateSignupInput({ email: 'not-an-email', password: 'password123' });
  assert.equal(badEmail.valid, false);

  // Short password (< 8 chars)
  const shortPass = validateSignupInput({ email: 'valid@example.com', password: '123' });
  assert.equal(shortPass.valid, false);

  // Valid signup
  const goodSignup = validateSignupInput({
    email: 'Reader@Example.COM ',
    password: 'securePassword123',
    name: 'Elena Rostova'
  });
  assert.equal(goodSignup.valid, true);
  assert.equal(goodSignup.data?.email, 'reader@example.com');
  assert.equal(goodSignup.data?.name, 'Elena Rostova');

  // Valid login
  const goodLogin = validateLoginInput({ email: 'reader@example.com', password: 'securePassword123', rememberMe: true });
  assert.equal(goodLogin.valid, true);
  assert.equal(goodLogin.data?.rememberMe, true);
});

test('Auth Store: full user registration, login session, and logout lifecycle', async () => {
  await resetStoreForTests();

  const email = 'editorial@smallreader.org';
  const passwordHash = await hashPassword('MyQuietSecret!42');
  const userId = 'usr_' + generateRandomToken(8);

  // 1. Create User
  const created = await createUser({
    _id: userId,
    email,
    passwordHash,
    name: 'Ada Lovelace',
    createdAt: new Date(),
    updatedAt: new Date(),
    syncEnabled: false
  });
  assert.equal(created.email, email);
  assert.equal(created.syncEnabled, false);

  // 2. Prevent duplicate registration
  await assert.rejects(
    async () => {
      await createUser({
        _id: 'usr_dup',
        email,
        passwordHash: 'another_hash',
        createdAt: new Date(),
        updatedAt: new Date(),
        syncEnabled: false
      });
    },
    /already exists/
  );

  // 3. Find user by email (case-insensitive)
  const found = await findUserByEmail('EDITORIAL@SmallReader.org');
  assert.ok(found);
  assert.equal(found?._id, userId);

  // 4. Session creation & authentication
  const token = generateRandomToken(32);
  await createSession({
    _id: '',
    token,
    userId,
    expiresAt: new Date(Date.now() + 86400000),
    createdAt: new Date()
  });

  const session = await findSessionByToken(token);
  assert.ok(session);
  assert.equal(session?.userId, userId);

  // 5. Session termination (logout)
  const deleted = await deleteSession(token);
  assert.equal(deleted, true);
  assert.equal(await findSessionByToken(token), null);
});

test('Auth Store: password reset flow with expiring tokens', async () => {
  await resetStoreForTests();

  const userId = 'usr_reset_test';
  const email = 'recover@reader.net';
  const initialHash = await hashPassword('OldPassword123!');

  await createUser({
    _id: userId,
    email,
    passwordHash: initialHash,
    createdAt: new Date(),
    updatedAt: new Date(),
    syncEnabled: false
  });

  // Request reset
  const resetToken = generateRandomToken(32);
  await createPasswordReset({
    _id: '',
    token: resetToken,
    userId,
    email,
    expiresAt: new Date(Date.now() + 3600000),
    used: false,
    createdAt: new Date()
  });

  // Verify token
  const resetDoc = await findPasswordReset(resetToken);
  assert.ok(resetDoc);
  assert.equal(resetDoc?.email, email);

  // Perform reset
  const newHash = await hashPassword('NewBrandNewSecret!99');
  await updateUser(userId, { passwordHash: newHash });
  await markPasswordResetUsed(resetToken);

  // Token is now used and should not be valid again
  assert.equal(await findPasswordReset(resetToken), null);

  // Verify new password works
  const updatedUser = await findUserById(userId);
  assert.ok(updatedUser);
  assert.equal(await verifyPassword('NewBrandNewSecret!99', updatedUser!.passwordHash), true);
  assert.equal(await verifyPassword('OldPassword123!', updatedUser!.passwordHash), false);
});
