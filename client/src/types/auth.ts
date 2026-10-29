export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  syncEnabled: boolean;
  createdAt: string;
}

export interface AuthResponse {
  message?: string;
  user: AuthUser;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface AccountUpdateRequest {
  name?: string;
  syncEnabled?: boolean;
  currentPassword?: string;
  newPassword?: string;
}
