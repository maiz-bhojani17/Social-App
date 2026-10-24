import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, Upload, Lock, User, Check, AlertCircle, Eye, EyeOff, Trash2 } from 'lucide-react';

export const EditProfileModal = ({ isOpen, onClose, onProfileUpdated, defaultTab = 'info' }) => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultTab); // 'info' | 'avatar' | 'password'

  // Info state
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Avatar state (Item 7: Edit Picture / Remove Picture)
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Sync state when modal opens or user data changes
  useEffect(() => {
    if (isOpen) {
      setName(user?.name || '');
      setBio(user?.bio || '');
      setAvatarPreview(user?.avatar || '');
      setAvatarFile(null);
      setActiveTab(defaultTab);
      setStatusMsg({ type: '', text: '' });
    }
  }, [isOpen, user, defaultTab]);

  if (!isOpen) return null;

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Remove Avatar (Set profile picture to empty)
  const handleRemoveAvatar = async () => {
    // If only local preview selected without existing avatar
    if (avatarFile && !user?.avatar) {
      setAvatarFile(null);
      setAvatarPreview('');
      return;
    }

    try {
      setLoading(true);
      setStatusMsg({ type: '', text: '' });
      const res = await api.delete('/users/avatar');
      if (res.data.success) {
        setAvatarFile(null);
        setAvatarPreview('');
        updateUser({ avatar: '' });
        setStatusMsg({ type: 'success', text: 'Profile picture removed successfully!' });
        if (onProfileUpdated) onProfileUpdated();
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Error removing avatar' });
    } finally {
      setLoading(false);
    }
  };

  // Submit Profile Info (Item 5)
  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setStatusMsg({ type: '', text: '' });
      const res = await api.put('/users/profile', { name, bio });
      if (res.data.success) {
        updateUser(res.data.user);
        setStatusMsg({ type: 'success', text: 'Profile updated successfully!' });
        if (onProfileUpdated) onProfileUpdated();
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Error updating profile' });
    } finally {
      setLoading(false);
    }
  };

  // Submit Avatar (Item 7)
  const handleUpdateAvatar = async (e) => {
    e.preventDefault();
    if (!avatarFile) {
      setStatusMsg({ type: 'error', text: 'Please select an image file first' });
      return;
    }
    try {
      setLoading(true);
      setStatusMsg({ type: '', text: '' });
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const res = await api.put('/users/avatar', formData);

      if (res.data.success) {
        updateUser({ avatar: res.data.avatar });
        setStatusMsg({ type: 'success', text: 'Profile picture updated!' });
        if (onProfileUpdated) onProfileUpdated();
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Error uploading avatar' });
    } finally {
      setLoading(false);
    }
  };

  // Submit Password (Item 6)
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setStatusMsg({ type: '', text: '' });
      const res = await api.put('/users/password', { currentPassword, newPassword });
      if (res.data.success) {
        setCurrentPassword('');
        setNewPassword('');
        setStatusMsg({ type: 'success', text: 'Password updated successfully!' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Error changing password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Edit Account & Profile</h3>
          <button onClick={onClose} className="btn-icon btn-secondary" style={{ width: '32px', height: '32px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
          <button
            type="button"
            className={`btn ${activeTab === 'info' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '13px', padding: '6px 12px' }}
            onClick={() => setActiveTab('info')}
          >
            <User size={14} /> Profile Info
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'avatar' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '13px', padding: '6px 12px' }}
            onClick={() => setActiveTab('avatar')}
          >
            <Upload size={14} /> Avatar
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'password' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '13px', padding: '6px 12px' }}
            onClick={() => setActiveTab('password')}
          >
            <Lock size={14} /> Password
          </button>
        </div>

        {statusMsg.text && (
          <div style={{
            padding: '10px 14px',
            marginBottom: '14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            color: statusMsg.type === 'success' ? 'var(--accent-emerald)' : 'var(--accent-rose)'
          }}>
            {statusMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Tab 1: Edit Profile (Item 5) */}
        {activeTab === 'info' && (
          <form onSubmit={handleUpdateInfo}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Tell the world about yourself..."
                style={{ width: '100%', resize: 'none' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              Save Profile Changes
            </button>
          </form>
        )}

        {/* Tab 2: Edit Picture (Item 7: Edit Picture / Remove Picture) */}
        {activeTab === 'avatar' && (
          <form onSubmit={handleUpdateAvatar}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--bg-surface-elevated)', overflow: 'hidden', border: '2px solid var(--primary)' }}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '32px', color: 'var(--primary)', fontWeight: '700' }}>
                    {user?.name?.[0] || 'U'}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <label className="btn btn-secondary" style={{ cursor: 'pointer', fontSize: '13px' }}>
                  <Upload size={15} />
                  <span>{avatarFile ? 'Change Selection' : 'Choose New Picture'}</span>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                </label>

                {(avatarPreview || user?.avatar || avatarFile) && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={loading}
                    className="btn"
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: 'var(--accent-rose)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      fontSize: '13px'
                    }}
                    title="Remove profile picture (Keep it empty)"
                  >
                    <Trash2 size={15} />
                    <span>Remove Picture</span>
                  </button>
                )}
              </div>

              {avatarFile && (
                <span style={{ fontSize: '12px', color: 'var(--accent-cyan)' }}>
                  Selected: {avatarFile.name} (Click button below to save)
                </span>
              )}
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading || !avatarFile} style={{ width: '100%' }}>
              Upload Profile Picture
            </button>
          </form>
        )}

        {/* Tab 3: Edit Password */}
        {activeTab === 'password' && (
          <form onSubmit={handleUpdatePassword}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Current Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  style={{ width: '100%', paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>New Password (min 6 chars)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={{ width: '100%', paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
