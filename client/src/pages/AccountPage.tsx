import React, { useState } from 'react';
import {
  User,
  Shield,
  Cloud,
  CloudOff,
  Key,
  Trash2,
  LogOut,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Feed } from '../types/index';

interface AccountPageProps {
  onNavigate: (page: string) => void;
  feeds?: Feed[];
  onImportFeeds?: (feedUrls: string[]) => Promise<void>;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate, feeds = [] }) => {
  const { user, logout, updateAccount, deleteAccount, syncFeeds, getRemoteSyncedFeeds } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [syncEnabled, setSyncEnabled] = useState(Boolean(user?.syncEnabled));

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!user) {
    return (
      <div className="account-container">
        <div className="account-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <AlertCircle size={36} color="#20452f" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '8px' }}>
            Sign In Required
          </h2>
          <p style={{ color: 'var(--color-ink-muted)', marginBottom: '24px' }}>
            Account settings and cloud backup require an active account session.
          </p>
          <button
            type="button"
            className="auth-submit-btn"
            style={{ maxWidth: '240px', margin: '0 auto' }}
            onClick={() => onNavigate('login')}
          >
            Sign In to Readora
          </button>
        </div>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    setSavingProfile(true);
    try {
      await updateAccount({ name: name.trim() });
      setNotice({ type: 'success', text: 'Profile details updated.' });
    } catch (err: any) {
      setNotice({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleToggleSync = async (enabled: boolean) => {
    setNotice(null);
    try {
      await updateAccount({ syncEnabled: enabled });
      setSyncEnabled(enabled);
      setNotice({
        type: 'success',
        text: enabled
          ? 'Cloud Library Sync enabled. Your subscriptions can now be backed up.'
          : 'Cloud Library Sync disabled. Your data remains strictly local on this device.'
      });
    } catch (err: any) {
      setNotice({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update sync setting.' });
    }
  };

  const handleManualSync = async () => {
    if (!syncEnabled) {
      setNotice({ type: 'error', text: 'Please enable Cloud Library Sync before syncing.' });
      return;
    }
    setNotice(null);
    setSyncing(true);
    try {
      const feedUrls = feeds.map((f) => f.feedUrl);
      const msg = await syncFeeds(feedUrls);
      setNotice({ type: 'success', text: msg || `Synchronized ${feedUrls.length} feeds to your account.` });
    } catch (err: any) {
      setNotice({ type: 'error', text: err instanceof Error ? err.message : 'Sync failed.' });
    } finally {
      setSyncing(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);

    if (!currentPassword) {
      setNotice({ type: 'error', text: 'Current password is required.' });
      return;
    }
    if (newPassword.length < 8) {
      setNotice({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setNotice({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setSavingPassword(true);
    try {
      await updateAccount({ currentPassword, newPassword });
      setNotice({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setNotice({ type: 'error', text: err instanceof Error ? err.message : 'Failed to change password.' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      onNavigate('inbox');
    } catch (err: any) {
      setNotice({ type: 'error', text: err instanceof Error ? err.message : 'Failed to delete account.' });
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onNavigate('inbox');
  };

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Active';

  return (
    <div className="account-container">
      {/* Header Bar */}
      <div className="account-header">
        <button
          type="button"
          className="account-back-btn"
          onClick={() => onNavigate('inbox')}
        >
          <ArrowLeft size={16} />
          <span>Back to reading</span>
        </button>
        <button
          type="button"
          className="account-logout-btn"
          onClick={handleLogout}
        >
          <LogOut size={15} />
          <span>Sign out</span>
        </button>
      </div>

      <div className="account-title-section">
        <span className="account-eyebrow">YOUR MEMBERSHIP</span>
        <h1 className="account-headline">Account & Privacy Settings</h1>
        <p className="account-subhead">Manage your profile, password security, and optional cloud library sync.</p>
      </div>

      {notice && (
        <div className={`auth-alert ${notice.type}`} role="alert" style={{ marginBottom: '24px' }}>
          {notice.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Grid of Settings Cards */}
      <div className="account-grid">
        {/* Profile Details Card */}
        <div className="account-card">
          <div className="card-top-icon">
            <User size={20} color="#20452f" />
          </div>
          <h2 className="card-title">Profile Information</h2>
          <p className="card-desc">Your basic account details and display name.</p>

          <form onSubmit={handleUpdateProfile} className="auth-form" style={{ marginTop: '20px' }}>
            <div className="auth-field">
              <label>Email address</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="input-disabled"
                title="Email address is tied to your account"
              />
              <span className="field-hint">Member since {formattedDate}</span>
            </div>

            <div className="auth-field">
              <label htmlFor="account-name">Display Name</label>
              <input
                id="account-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Elena Rostova"
              />
            </div>

            <button type="submit" className="auth-submit-btn" disabled={savingProfile} style={{ marginTop: '12px' }}>
              {savingProfile ? 'Saving…' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Privacy & Cloud Library Sync Card */}
        <div className="account-card">
          <div className="card-top-icon">
            <Shield size={20} color="#20452f" />
          </div>
          <h2 className="card-title">Privacy & Cloud Sync</h2>
          <p className="card-desc">
            Readora is local-first by design. Subscriptions and articles stay on this device unless you choose to
            sync them.
          </p>

          <div className="sync-toggle-box" style={{ marginTop: '20px' }}>
            <div className="sync-info">
              <div className="sync-title-row">
                {syncEnabled ? <Cloud size={18} color="#20452f" /> : <CloudOff size={18} color="#778576" />}
                <strong>Cloud Library Sync</strong>
              </div>
              <p className="sync-desc">
                {syncEnabled
                  ? 'Your subscription list is securely synchronized to your account across browsers.'
                  : 'Zero cloud synchronization. Everything is stored purely in your local browser storage.'}
              </p>
            </div>
            <label className="switch-toggle" aria-label="Toggle cloud library sync">
              <input
                type="checkbox"
                checked={syncEnabled}
                onChange={(e) => handleToggleSync(e.target.checked)}
              />
              <span className="slider" />
            </label>
          </div>

          {syncEnabled && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#556658' }}>Local Subscriptions: <strong>{feeds.length}</strong></span>
              </div>
              <button
                type="button"
                className="auth-oauth-btn"
                onClick={handleManualSync}
                disabled={syncing}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <RefreshCw size={15} className={syncing ? 'spin-icon' : ''} />
                <span>{syncing ? 'Synchronizing…' : 'Sync Library Now'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Password Security Card */}
        <div className="account-card">
          <div className="card-top-icon">
            <Key size={20} color="#20452f" />
          </div>
          <h2 className="card-title">Change Password</h2>
          <p className="card-desc">Update your password to keep your account protected.</p>

          <form onSubmit={handleChangePassword} className="auth-form" style={{ marginTop: '20px' }}>
            <div className="auth-field">
              <label htmlFor="curr-pass">Current Password</label>
              <input
                id="curr-pass"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="change-new-pass">New Password</label>
              <input
                id="change-new-pass"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="change-confirm-pass">Confirm New Password</label>
              <input
                id="change-confirm-pass"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
              />
            </div>

            <button type="submit" className="auth-submit-btn" disabled={savingPassword} style={{ marginTop: '12px' }}>
              {savingPassword ? 'Updating Password…' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Danger Zone Card */}
        <div className="account-card danger-card">
          <div className="card-top-icon">
            <Trash2 size={20} color="#b33939" />
          </div>
          <h2 className="card-title" style={{ color: '#b33939' }}>Delete Account</h2>
          <p className="card-desc">
            Permanently delete your account, session tokens, and cloud backup. Your local articles will remain on this
            device.
          </p>

          <div style={{ marginTop: '24px' }}>
            <button
              type="button"
              className="delete-account-btn"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete My Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#b33939', margin: '0 0 12px' }}>
              Are you absolutely sure?
            </h3>
            <p style={{ fontSize: '14px', color: '#556658', lineHeight: 1.5, margin: '0 0 24px' }}>
              This will permanently delete your account registration and revoke all sign-in tokens. This action cannot be
              undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-account-btn"
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Yes, Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
