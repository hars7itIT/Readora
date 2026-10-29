import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  AuthUser,
  LoginCredentials,
  SignupCredentials,
  AccountUpdateRequest
} from '../types/auth';
import {
  apiLogin,
  apiSignup,
  apiGetMe,
  apiLogout,
  apiForgotPassword,
  apiResetPassword,
  apiUpdateAccount,
  apiDeleteAccount,
  apiGetSyncedFeeds,
  apiPostSyncedFeeds
} from '../services/authApi';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  signup: (credentials: SignupCredentials) => Promise<AuthUser>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (token: string, newPass: string) => Promise<string>;
  updateAccount: (updates: AccountUpdateRequest) => Promise<AuthUser>;
  deleteAccount: () => Promise<void>;
  syncFeeds: (feedUrls: string[]) => Promise<string>;
  getRemoteSyncedFeeds: () => Promise<string[]>;
}

const STORAGE_KEY_TOKEN = 'small_reader_auth_token';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_TOKEN) || sessionStorage.getItem(STORAGE_KEY_TOKEN);
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate session on mount
  useEffect(() => {
    let mounted = true;
    async function initAuth() {
      if (!token) {
        if (mounted) setIsLoading(false);
        return;
      }
      try {
        const me = await apiGetMe(token);
        if (mounted) {
          setUser(me);
        }
      } catch {
        // Token expired or invalid
        if (mounted) {
          setToken(null);
          setUser(null);
          localStorage.removeItem(STORAGE_KEY_TOKEN);
          sessionStorage.removeItem(STORAGE_KEY_TOKEN);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    void initAuth();
    return () => {
      mounted = false;
    };
  }, [token]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthUser> => {
    const res = await apiLogin(credentials);
    setUser(res.user);
    setToken(res.token);
    try {
      if (credentials.rememberMe) {
        localStorage.setItem(STORAGE_KEY_TOKEN, res.token);
        sessionStorage.removeItem(STORAGE_KEY_TOKEN);
      } else {
        sessionStorage.setItem(STORAGE_KEY_TOKEN, res.token);
        localStorage.removeItem(STORAGE_KEY_TOKEN);
      }
    } catch {
      // Ignore storage errors in private browsing
    }
    return res.user;
  }, []);

  const signup = useCallback(async (credentials: SignupCredentials): Promise<AuthUser> => {
    const res = await apiSignup(credentials);
    setUser(res.user);
    setToken(res.token);
    try {
      localStorage.setItem(STORAGE_KEY_TOKEN, res.token);
    } catch {
      // Ignore storage errors
    }
    return res.user;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    if (token) {
      await apiLogout(token).catch(() => {});
    }
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      sessionStorage.removeItem(STORAGE_KEY_TOKEN);
    } catch {
      // Ignore
    }
  }, [token]);

  const forgotPassword = useCallback(async (email: string): Promise<string> => {
    return await apiForgotPassword(email);
  }, []);

  const resetPassword = useCallback(async (resetToken: string, newPass: string): Promise<string> => {
    return await apiResetPassword(resetToken, newPass);
  }, []);

  const updateAccount = useCallback(async (updates: AccountUpdateRequest): Promise<AuthUser> => {
    if (!token) throw new Error('Not authenticated.');
    const updated = await apiUpdateAccount(token, updates);
    setUser(updated);
    return updated;
  }, [token]);

  const deleteAccount = useCallback(async (): Promise<void> => {
    if (!token) throw new Error('Not authenticated.');
    await apiDeleteAccount(token);
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      sessionStorage.removeItem(STORAGE_KEY_TOKEN);
    } catch {
      // Ignore
    }
  }, [token]);

  const syncFeeds = useCallback(async (feedUrls: string[]): Promise<string> => {
    if (!token) throw new Error('Please sign in to sync your library.');
    return await apiPostSyncedFeeds(token, feedUrls);
  }, [token]);

  const getRemoteSyncedFeeds = useCallback(async (): Promise<string[]> => {
    if (!token) throw new Error('Please sign in to view synced library.');
    return await apiGetSyncedFeeds(token);
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        login,
        signup,
        logout,
        forgotPassword,
        resetPassword,
        updateAccount,
        deleteAccount,
        syncFeeds,
        getRemoteSyncedFeeds
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
