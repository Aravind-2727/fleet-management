'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../../components/dashboard/layout';

export default function SettingsPage({ user, onLogout }) {
  const [loading, setLoading]               = useState(true);
  const [profile, setProfile]               = useState(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileForm, setProfileForm]       = useState({ name: '', phone: '' });
  const [newPassword, setNewPassword]       = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordMessageType, setPasswordMessageType] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { setLoading(false); return; }

      const { data, error } = await supabase
        .from('profiles').select('*')
        .eq('id', authUser.id).single();

      if (error) { console.error(error); return; }

      setProfile(data);
      setProfileForm({ name: data?.name || '', phone: data?.phone || '' });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const saveProfile = async () => {
    if (!profileForm.name || profileForm.name.trim().length < 2) {
      alert('Enter a valid name (at least 2 characters)'); return;
    }
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { alert('Not authenticated'); return; }

      const { error } = await supabase
        .from('profiles')
        .update({
          name: profileForm.name.trim(),
          phone: profileForm.phone.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', authUser.id);

      if (error) { alert(error.message); return; }

      setProfile(prev => ({ ...prev, name: profileForm.name.trim(), phone: profileForm.phone.trim() }));
      setShowProfileForm(false);
    } catch (e) { console.error(e); alert('Failed to update profile.'); }
  };

  const changePassword = async () => {
    setPasswordMessage('');
    setPasswordMessageType('');

    if (!newPassword || !confirmPassword) {
      setPasswordMessage('Both fields are required.');
      setPasswordMessageType('error');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage('Password must be at least 8 characters.');
      setPasswordMessageType('error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage('Passwords do not match.');
      setPasswordMessageType('error');
      return;
    }

    setChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        setPasswordMessage(error.message);
        setPasswordMessageType('error');
        return;
      }

      setPasswordMessage('Password updated successfully.');
      setPasswordMessageType('success');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      setPasswordMessage('An unexpected error occurred.');
      setPasswordMessageType('error');
    } finally {
      setChangingPassword(false);
    }
  };

  // Loading INSIDE layout so sidebar stays visible
  if (loading) {
    return (
      <DashboardLayout user={user} onLogout={onLogout}>
        <div style={s.center}>
          <div style={s.spinnerRing}><div style={s.spinner} /></div>
          <p style={s.muted}>Loading settings...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .profile-row    { flex-direction: column !important; align-items: center !important; text-align: center !important; }
          .edit-btn       { width: 100% !important; max-width: 100% !important; }
          .form-actions button { width: 100% !important; }
          .settings-shell { padding: 16px !important; }
          .header-title   { font-size: 20px !important; }
        }
      `}</style>

      <DashboardLayout user={user} onLogout={onLogout}>
        <div style={s.shell} className="settings-shell">

          {/* Header */}
          <div style={s.header}>
            <div>
              <p style={s.headerSub}>System</p>
              <h1 style={s.headerTitle} className="header-title">Settings</h1>
            </div>
          </div>

          {/* Unified Settings card — Profile + Password in one shell, separated by a divider */}
          <div style={s.sectionCard}>

            {/* Profile Information block */}
            <h2 style={s.sectionTitle}>Profile Information</h2>

            {/* Row on desktop, column on mobile */}
            <div style={s.profileRow} className="profile-row">
              <div style={s.profileAvatar}>
                <i className="ti ti-user" style={{ fontSize: 32, color: '#7C63FF' }} />
              </div>

              <div style={s.profileDetails}>
                {[
                  { label: 'Name',  value: profile?.name  },
                  { label: 'Email', value: profile?.email },
                  { label: 'Phone', value: profile?.phone },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p style={s.detailLabel}>{label}</p>
                    <p style={s.detailValue}>{value || 'Not set'}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowProfileForm(v => !v)}
                style={showProfileForm ? s.editButtonCancel : s.editButton}
                className="edit-btn"
              >
                {showProfileForm ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {/* Edit form + Password change — both appear only after clicking Edit Profile */}
            {showProfileForm && (
              <>
                <div style={s.profileForm}>
                  <h3 style={s.formTitle}>Edit Profile</h3>
                  <div style={s.formGrid}>
                    <div style={s.formField}>
                      <label style={s.label}>Name</label>
                      <input
                        placeholder="Enter your name"
                        value={profileForm.name}
                        onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                        style={s.input}
                      />
                    </div>
                    <div style={s.formField}>
                      <label style={s.label}>Phone</label>
                      <input
                        placeholder="Enter your phone"
                        value={profileForm.phone}
                        onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                        style={s.input}
                      />
                    </div>
                  </div>
                  <div style={s.formActions} className="form-actions">
                    <button onClick={saveProfile} style={s.saveBtn}>Save Changes</button>
                    <button onClick={() => setShowProfileForm(false)} style={s.cancelBtn}>Cancel</button>
                  </div>
                </div>

                <div style={s.sectionDivider} />

                <h2 style={s.sectionTitle}>Change Password</h2>

                <div style={s.passwordFormGrid}>
                  <div style={s.formField}>
                    <label style={s.label}>New Password</label>
                    <div style={s.passwordFieldWrap}>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        style={s.inputWithIcon}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(v => !v)}
                        style={s.eyeToggle}
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      >
                        <EyeIcon open={showNewPassword} />
                      </button>
                    </div>
                  </div>
                  <div style={s.formField}>
                    <label style={s.label}>Confirm New Password</label>
                    <div style={s.passwordFieldWrap}>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        style={s.inputWithIcon}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(v => !v)}
                        style={s.eyeToggle}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        <EyeIcon open={showConfirmPassword} />
                      </button>
                    </div>
                  </div>
                </div>

                {passwordMessage && (
                  <p style={passwordMessageType === 'success' ? s.successMessage : s.errorMessage}>
                    {passwordMessage}
                  </p>
                )}

                <div style={s.formActions} className="form-actions">
                  <button
                    onClick={changePassword}
                    style={s.changePasswordBtn}
                    disabled={changingPassword}
                  >
                    {changingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </>
            )}

          </div>

        </div>
      </DashboardLayout>
    </>
  );
}

// Simple eye / eye-off icon, inherits currentColor
function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.6 21.6 0 0 1 5.06-5.94M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 7 11 7a21.6 21.6 0 0 1-2.34 3.31M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

const s = {
  center: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    minHeight: '60vh', gap: 16,
  },
  spinnerRing: {
    width: 56, height: 56, borderRadius: '50%',
    border: '1px solid rgba(124,99,255,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  spinner: {
    width: 36, height: 36, borderRadius: '50%',
    border: '2px solid rgba(124,99,255,0.1)',
    borderTop: '2px solid #7C63FF',
    animation: 'spin 0.8s linear infinite',
  },
  muted: {
    fontFamily: "'Space Grotesk', sans-serif",
    color: 'rgba(20,20,30,0.45)', fontSize: 13,
  },
  shell: {
    width: '100%',
    padding: 24,
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 24, flexWrap: 'wrap', gap: 12,
  },
  headerSub: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.4)', margin: '0 0 6px',
  },
  headerTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: -0.5,
  },
  sectionCard: {
    background: '#fff',
    border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 16, padding: 20, marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 16, fontWeight: 600, color: '#1A1A1F', margin: '0 0 16px',
  },
  sectionDivider: {
    height: 1,
    background: 'rgba(20,20,30,0.07)',
    margin: '20px 0',
  },

  // Row layout on desktop — CSS flips to column on mobile
  profileRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    flexWrap: 'wrap',
  },
  profileAvatar: {
    width: 56, height: 56, borderRadius: '50%',
    background: 'rgba(124,99,255,0.1)',
    border: '2px solid rgba(124,99,255,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  profileDetails: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: 14,
    minWidth: 0,
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.4)', margin: '0 0 3px',
  },
  detailValue: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 13, fontWeight: 500, color: '#1A1A1F', margin: 0,
  },
  editButton: {
    background: '#7C63FF', color: '#fff', border: '1px solid #7C63FF',
    padding: '9px 18px', borderRadius: 10,
    cursor: 'pointer', fontWeight: 600, fontSize: 13,
    fontFamily: "'Outfit', sans-serif",
    boxShadow: '0 4px 12px rgba(124,99,255,0.25)',
    minHeight: 38, whiteSpace: 'nowrap', alignSelf: 'center',
  },
  editButtonCancel: {
    background: '#fff', color: 'rgba(20,20,30,0.5)',
    border: '1px solid rgba(20,20,30,0.1)',
    padding: '9px 18px', borderRadius: 10,
    cursor: 'pointer', fontWeight: 600, fontSize: 13,
    fontFamily: "'Outfit', sans-serif",
    boxShadow: 'none',
    minHeight: 38, whiteSpace: 'nowrap', alignSelf: 'center',
  },
  profileForm: {
    marginTop: 16, padding: 16,
    background: 'rgba(124,99,255,0.05)',
    border: '1px solid rgba(124,99,255,0.1)',
    borderRadius: 12, boxSizing: 'border-box',
  },
  formTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 14, fontWeight: 600, margin: '0 0 12px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 12, marginBottom: 12,
  },
  formField: { marginBottom: 4 },
  label: {
    display: 'block',
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.4)', marginBottom: 6,
  },
  input: {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    border: '1px solid rgba(20,20,30,0.1)',
    background: '#F7F7FA', fontSize: 13,
    fontFamily: "'Outfit', sans-serif", color: '#1A1A1F',
    boxSizing: 'border-box', minHeight: 38,
  },
  passwordFieldWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputWithIcon: {
    width: '100%', padding: '10px 38px 10px 12px', borderRadius: 10,
    border: '1px solid rgba(20,20,30,0.1)',
    background: '#F7F7FA', fontSize: 13,
    fontFamily: "'Outfit', sans-serif", color: '#1A1A1F',
    boxSizing: 'border-box', minHeight: 38,
  },
  eyeToggle: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    padding: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'rgba(20,20,30,0.4)',
  },
  formActions: {
    display: 'flex', gap: 8, flexWrap: 'wrap',
  },
  saveBtn: {
    background: '#22C55E', color: '#fff', border: 'none',
    padding: '9px 18px', borderRadius: 10,
    cursor: 'pointer', fontWeight: 600, fontSize: 13,
    fontFamily: "'Outfit', sans-serif", minHeight: 38,
  },
  cancelBtn: {
    background: '#fff', color: 'rgba(20,20,30,0.5)',
    border: '1px solid rgba(20,20,30,0.1)',
    padding: '9px 18px', borderRadius: 10,
    cursor: 'pointer', fontWeight: 600, fontSize: 13,
    fontFamily: "'Outfit', sans-serif", minHeight: 38,
  },
  passwordFormGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 12, marginBottom: 12,
  },
  changePasswordBtn: {
    background: '#7C63FF', color: '#fff', border: 'none',
    padding: '9px 18px', borderRadius: 10,
    cursor: 'pointer', fontWeight: 600, fontSize: 13,
    fontFamily: "'Outfit', sans-serif", minHeight: 38,
    boxShadow: '0 4px 12px rgba(124,99,255,0.25)',
  },
  successMessage: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 12, color: '#22C55E', margin: '0 0 10px',
  },
  errorMessage: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 12, color: '#EF4444', margin: '0 0 10px',
  },
};