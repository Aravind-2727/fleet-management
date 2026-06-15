'use client';

import { supabase } from '../../app/lib/supabase';

import { useState } from 'react';

export default function UserSettings() {
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@fleet-management.com',
    phone: '+1 (555) 987-6543',
    avatar: null,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileUpdated, setProfileUpdated] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileUpdate = async () => {
    setProfileUpdated(true);
    setTimeout(() => setProfileUpdated(false), 3000);
  };

  const handlePasswordChange = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    setPasswordChanged(true);
    setTimeout(() => setPasswordChanged(false), 3000);
    setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, avatar: file }));
    }
  };

  return (
    <div style={s.section}>
      <h2 style={s.sectionTitle}>User Settings</h2>
      <p style={s.sectionDescription}>Manage your personal profile and account security.</p>

      <div style={s.formGrid}>
        <div style={s.formGroup}>
          <label style={s.formLabel}>First Name</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            style={s.formInput}
            placeholder="Enter first name"
          />
        </div>

        <div style={s.formGroup}>
          <label style={s.formLabel}>Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            style={s.formInput}
            placeholder="Enter last name"
          />
        </div>

        <div style={s.formGroup}>
          <label style={s.formLabel}>Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            style={s.formInput}
            placeholder="Enter email address"
          />
        </div>

        <div style={s.formGroup}>
          <label style={s.formLabel}>Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            style={s.formInput}
            placeholder="+1 (555) 987-6543"
          />
        </div>

        <div style={s.formGroup}>
          <label style={s.formLabel}>Profile Picture</label>
          <div style={s.avatarUploadContainer}>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              style={s.avatarInput}
            />
            <div style={s.avatarPreview}>
              {formData.avatar ? (
                <img
                  src={URL.createObjectURL(formData.avatar)}
                  alt="Profile Avatar"
                  style={s.avatarImage}
                />
              ) : (
                <div style={s.avatarPlaceholder}>
                  <i className="ti ti-user" style={{ fontSize: 32, color: 'rgba(20,20,30,0.3)' }} />
                  <p style={s.avatarPlaceholderText}>Upload photo</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={s.passwordSection}>
        <h3 style={s.passwordTitle}>Change Password</h3>
        <p style={s.passwordDescription}>Update your account password for security.</p>

        <div style={s.passwordGrid}>
          <div style={s.formGroup}>
            <label style={s.formLabel}>Current Password</label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => handleChange('currentPassword', e.target.value)}
              style={s.formInput}
              placeholder="Enter current password"
            />
          </div>

          <div style={s.formGroup}>
            <label style={s.formLabel}>New Password</label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => handleChange('newPassword', e.target.value)}
              style={s.formInput}
              placeholder="Enter new password"
            />
          </div>

          <div style={s.formGroup}>
            <label style={s.formLabel}>Confirm New Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              style={s.formInput}
              placeholder="Confirm new password"
            />
          </div>
        </div>

        <button
          onClick={handlePasswordChange}
          disabled={!formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
          style={s.passwordBtn}
        >
          Change Password
        </button>

        {passwordChanged && (
          <div style={s.successMessage}>
            Password changed successfully!
          </div>
        )}
      </div>

      <div style={s.actionButtons}>
        <button onClick={handleProfileUpdate} style={s.updateBtn}>
          Update Profile
        </button>

        {profileUpdated && (
          <div style={s.successMessage}>
            Profile updated successfully!
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  section: { marginBottom: 40 },
  sectionTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 20, fontWeight: 600, margin: '0 0 8px',
  },
  sectionDescription: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 14, color: 'rgba(20,20,30,0.6)', margin: 0,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 20, marginTop: 24,
  },
  formGroup: {
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  formLabel: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.5)',
  },
  formInput: {
    padding: '12px 14px',
    borderRadius: 12,
    border: '1px solid rgba(20,20,30,0.1)',
    background: '#F7F7FA',
    fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
    color: '#1A1A1F',
    boxSizing: 'border-box',
    transition: 'all 0.15s',
  },
  passwordSection: {
    marginTop: 40, paddingTop: 32,
    borderTop: '1px solid rgba(20,20,30,0.07)',
  },
  passwordTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 18, fontWeight: 600, margin: '0 0 8px',
  },
  passwordDescription: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 14, color: 'rgba(20,20,30,0.6)', margin: 0,
  },
  passwordGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 20, marginTop: 24,
  },
  passwordBtn: {
    background: '#7C63FF', color: '#fff', border: 'none',
    padding: '12px 24px', borderRadius: 12,
    cursor: 'pointer', fontWeight: 600, fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
    marginTop: 24,
    transition: 'all 0.15s',
  },
  actionButtons: {
    display: 'flex', gap: 16, marginTop: 32,
  },
  updateBtn: {
    background: '#22C55E', color: '#fff', border: 'none',
    padding: '12px 24px', borderRadius: 12,
    cursor: 'pointer', fontWeight: 600, fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
    transition: 'all 0.15s',
  },
  successMessage: {
    background: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.25)',
    color: '#22C55E',
    padding: 12, borderRadius: 8,
    fontSize: 14, fontFamily: "'Outfit', sans-serif",
    marginTop: 16,
  },
  avatarUploadContainer: {
    position: 'relative',
  },
  avatarInput: {
    opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer',
  },
  avatarPreview: {
    border: '2px dashed rgba(20,20,30,0.2)',
    borderRadius: 12, padding: 24,
    background: 'rgba(124,99,255,0.05)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: 120,
  },
  avatarImage: {
    width: 80, height: 80, borderRadius: '50%',
    objectFit: 'cover',
  },
  avatarPlaceholder: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
  },
  avatarPlaceholderText: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 14, color: 'rgba(20,20,30,0.5)', margin: 0,
  },
};