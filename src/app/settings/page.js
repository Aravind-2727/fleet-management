'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../../components/dashboard/layout';

export default function SettingsPage({ user, onLogout }) {
  const [loading, setLoading]               = useState(true);
  const [profile, setProfile]               = useState(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileForm, setProfileForm]       = useState({ name: '', phone: '' });

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

          {/* Profile card */}
          <div style={s.sectionCard}>
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
                  { label: 'Role',  value: profile?.role  },
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
                style={s.editButton}
                className="edit-btn"
              >
                {showProfileForm ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {/* Edit form */}
            {showProfileForm && (
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
            )}
          </div>

        </div>
      </DashboardLayout>
    </>
  );
}

const s = {
  center: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    minHeight: '60vh', gap: 16,           // 60vh not 100vh inside layout
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
    // removed maxWidth/margin:auto — layout handles centering
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
    borderRadius: 18, padding: 24, marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 18, fontWeight: 600, color: '#1A1A1F', margin: '0 0 20px',
  },

  // Row layout on desktop — CSS flips to column on mobile
  profileRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 24,
    flexWrap: 'wrap',
  },
  profileAvatar: {
    width: 72, height: 72, borderRadius: '50%',
    background: 'rgba(124,99,255,0.1)',
    border: '2px solid rgba(124,99,255,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  profileDetails: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 16,
    minWidth: 0,
  },
  detailLabel: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.4)', margin: '0 0 4px',
  },
  detailValue: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 14, fontWeight: 500, color: '#1A1A1F', margin: 0,
  },
  editButton: {
    background: '#7C63FF', color: '#fff', border: 'none',
    padding: '11px 22px', borderRadius: 12,
    cursor: 'pointer', fontWeight: 600, fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
    boxShadow: '0 4px 12px rgba(124,99,255,0.25)',
    minHeight: 44, whiteSpace: 'nowrap', alignSelf: 'flex-start',
  },
  profileForm: {
    marginTop: 20, padding: 20,
    background: 'rgba(124,99,255,0.05)',
    border: '1px solid rgba(124,99,255,0.1)',
    borderRadius: 12, boxSizing: 'border-box',
  },
  formTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 16, fontWeight: 600, margin: '0 0 16px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 14, marginBottom: 16,
  },
  formField: { marginBottom: 4 },
  label: {
    display: 'block',
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.4)', marginBottom: 8,
  },
  input: {
    width: '100%', padding: '12px 14px', borderRadius: 12,
    border: '1px solid rgba(20,20,30,0.1)',
    background: '#F7F7FA', fontSize: 14,
    fontFamily: "'Outfit', sans-serif", color: '#1A1A1F',
    boxSizing: 'border-box', minHeight: 44,
  },
  formActions: {
    display: 'flex', gap: 10, flexWrap: 'wrap',
  },
  saveBtn: {
    background: '#22C55E', color: '#fff', border: 'none',
    padding: '11px 22px', borderRadius: 12,
    cursor: 'pointer', fontWeight: 600, fontSize: 14,
    fontFamily: "'Outfit', sans-serif", minHeight: 44,
  },
  cancelBtn: {
    background: '#fff', color: 'rgba(20,20,30,0.5)',
    border: '1px solid rgba(20,20,30,0.1)',
    padding: '11px 22px', borderRadius: 12,
    cursor: 'pointer', fontWeight: 600, fontSize: 14,
    fontFamily: "'Outfit', sans-serif", minHeight: 44,
  },
};