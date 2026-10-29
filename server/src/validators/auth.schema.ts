const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidationResult<T> {
  valid: boolean;
  data?: T;
  error?: string;
}

export function validateEmail(email: unknown): { valid: boolean; email: string; error?: string } {
  if (typeof email !== 'string' || !email.trim()) {
    return { valid: false, email: '', error: 'Email address is required.' };
  }
  const normalized = email.trim().toLowerCase();
  if (normalized.length > 255) {
    return { valid: false, email: '', error: 'Email address cannot exceed 255 characters.' };
  }
  if (!EMAIL_REGEX.test(normalized)) {
    return { valid: false, email: '', error: 'Please provide a valid email address.' };
  }
  return { valid: true, email: normalized };
}

export function validatePassword(password: unknown): { valid: boolean; error?: string } {
  if (typeof password !== 'string' || !password) {
    return { valid: false, error: 'Password is required.' };
  }
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long.' };
  }
  if (password.length > 128) {
    return { valid: false, error: 'Password cannot exceed 128 characters.' };
  }
  return { valid: true };
}

export function validateSignupInput(body: unknown): ValidationResult<{ email: string; password: string; name?: string }> {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request payload.' };
  }
  const { email, password, name } = body as Record<string, unknown>;

  const emailRes = validateEmail(email);
  if (!emailRes.valid) return { valid: false, error: emailRes.error };

  const passRes = validatePassword(password);
  if (!passRes.valid) return { valid: false, error: passRes.error };

  let safeName: string | undefined;
  if (typeof name === 'string' && name.trim()) {
    safeName = name.trim().slice(0, 100);
  }

  return {
    valid: true,
    data: {
      email: emailRes.email,
      password: String(password),
      name: safeName
    }
  };
}

export function validateLoginInput(body: unknown): ValidationResult<{ email: string; password: string; rememberMe: boolean }> {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request payload.' };
  }
  const { email, password, rememberMe } = body as Record<string, unknown>;

  const emailRes = validateEmail(email);
  if (!emailRes.valid) return { valid: false, error: emailRes.error };

  if (typeof password !== 'string' || !password) {
    return { valid: false, error: 'Password is required.' };
  }

  return {
    valid: true,
    data: {
      email: emailRes.email,
      password: String(password),
      rememberMe: Boolean(rememberMe)
    }
  };
}

export function validateForgotPasswordInput(body: unknown): ValidationResult<{ email: string }> {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request payload.' };
  }
  const { email } = body as Record<string, unknown>;
  const emailRes = validateEmail(email);
  if (!emailRes.valid) return { valid: false, error: emailRes.error };

  return {
    valid: true,
    data: { email: emailRes.email }
  };
}

export function validateResetPasswordInput(body: unknown): ValidationResult<{ token: string; newPassword: string }> {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request payload.' };
  }
  const { token, newPassword } = body as Record<string, unknown>;

  if (typeof token !== 'string' || !token.trim()) {
    return { valid: false, error: 'Reset token is missing or invalid.' };
  }

  const passRes = validatePassword(newPassword);
  if (!passRes.valid) return { valid: false, error: passRes.error };

  return {
    valid: true,
    data: {
      token: token.trim(),
      newPassword: String(newPassword)
    }
  };
}
