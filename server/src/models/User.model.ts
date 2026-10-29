export interface User {
  _id: string;
  email: string;
  passwordHash: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
  syncEnabled: boolean;
  syncedFeeds?: string[];
}

export interface UserPublicProfile {
  id: string;
  email: string;
  name?: string;
  syncEnabled: boolean;
  createdAt: string;
}

export interface Session {
  _id: string; // Token hash
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface PasswordResetToken {
  _id: string; // Token hash
  token: string;
  userId: string;
  email: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}
