import type {
  AuthResponse,
  AuthUser,
  LoginCredentials,
  SignupCredentials,
  AccountUpdateRequest
} from '../types/auth';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

function parseErrorMessage(errData: any, fallback: string): string {
  if (typeof errData === 'string') {
    try {
      const parsed = JSON.parse(errData);
      return parsed.error || parsed.message || fallback;
    } catch {
      return errData || fallback;
    }
  }
  return errData?.error || errData?.message || fallback;
}

export async function apiSignup(data: SignupCredentials): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(parseErrorMessage(json, 'Registration failed. Please check your details.'));
  }
  return json as AuthResponse;
}

export async function apiLogin(data: LoginCredentials): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(parseErrorMessage(json, 'Invalid email or password.'));
  }
  return json as AuthResponse;
}

export async function apiGetMe(token: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(parseErrorMessage(json, 'Session expired.'));
  }
  return (json as { user: AuthUser }).user;
}

export async function apiLogout(token: string): Promise<void> {
  await fetch(`${API_BASE}/api/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  }).catch(() => {});
}

export async function apiForgotPassword(email: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(parseErrorMessage(json, 'Failed to process request.'));
  }
  return json.message || 'If an account exists, a reset link has been dispatched.';
}

export async function apiVerifyResetToken(token: string): Promise<{ valid: boolean; email?: string }> {
  const res = await fetch(`${API_BASE}/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { valid: false };
  }
  return json;
}

export async function apiResetPassword(token: string, newPassword: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword })
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(parseErrorMessage(json, 'Failed to reset password. Link may be expired.'));
  }
  return json.message || 'Password updated successfully.';
}

export async function apiUpdateAccount(token: string, data: AccountUpdateRequest): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/api/auth/account`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(parseErrorMessage(json, 'Failed to update account.'));
  }
  return (json as { user: AuthUser }).user;
}

export async function apiDeleteAccount(token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/auth/account`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(parseErrorMessage(json, 'Failed to delete account.'));
  }
}

export async function apiGetSyncedFeeds(token: string): Promise<string[]> {
  const res = await fetch(`${API_BASE}/api/auth/sync`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(parseErrorMessage(json, 'Failed to load synced feeds.'));
  }
  return json.syncedFeeds || [];
}

export async function apiPostSyncedFeeds(token: string, feeds: string[]): Promise<string> {
  const res = await fetch(`${API_BASE}/api/auth/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ feeds })
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(parseErrorMessage(json, 'Failed to sync feeds.'));
  }
  return json.message || 'Feeds synchronized.';
}
