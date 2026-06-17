'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../../components/dashboard/layout';

export default function SettingsPage({ user, onLogout }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [showProfileForm, setShowProfileForm] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
      setProfileForm({
        name: data?.name || '',
        phone: data?.phone || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!profileForm.name || profileForm.name.trim().length < 2) {
      alert('Enter valid name (at least 2 characters)');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profileForm.name.trim(),
          phone: profileForm.phone.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) {
        console.error('Error updating profile:', error);
        alert(error.message);
        return;
      }

      setProfile({
        ...profile,
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
      });
      setShowProfileForm(false);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={s.root}>
        <div style={s.center}>
          <div style={s.spinnerRing}><div style={s.spinner} /></div>
          <p style={s.muted}>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div style={s.shell}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <p style={s.headerSub}>System</p>
            <h1 style={s.headerTitle}>Settings</h1>
          </div>
        </div>

        {/* Profile Section */}
        <div style={s.sectionCard}>
          <h2 style={s.sectionTitle}>Profile Information</h2>
          <div style={s.profileInfo}>
            <div style={s.profileAvatar}>
              <i className="ti ti-user" style={{ fontSize: 32, color: '#7C63FF' }} />
            </div>
            <div style={s.profileDetails}>
              <div>
                <p style={s.detailLabel}>Name</p>
                <p style={s.detailValue}>{profile?.name || 'Not set'}</p>
              </div>
              <div>
                <p style={s.detailLabel}>Email</p>
                <p style={s.detailValue}>{profile?.email || 'Not set'}</p>
              </div>
              <div>
                <p style={s.detailLabel}>Role</p>
                <p style={s.detailValue}>{profile?.role || 'Not set'}</p>
              </div>
              <div>
                <p style={s.detailLabel}>Phone</p>
                <p style={s.detailValue}>{profile?.phone || 'Not set'}</p>
              </div>
            </div>
            <button 
              onClick={() => setShowProfileForm(true)}
              style={s.editButton}
            >
              Edit Profile
            </button>
          </div>

          {showProfileForm && (
            <div style={s.profileForm}>
              <h3 style={s.formTitle}>Edit Profile</h3>
              <div style={s.formGrid}>
                <div style={s.formField}>
                  <label style={s.label}>Name</label>
                  <input
                    placeholder="Enter your name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                    style={s.input}
                  />
                </div>
                <div style={s.formField}>
                  <label style={s.label}>Phone</label>
                  <input
                    placeholder="Enter your phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                    style={s.input}
                  />
                </div>
              </div>
              <div style={s.formActions}>
                <button onClick={saveProfile} style={s.saveBtn}>Save Changes</button>
                <button onClick={() => setShowProfileForm(false)} style={s.cancelBtn}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* Account Section */}
        <div style={s.sectionCard}>
          <h2 style={s.sectionTitle}>Account Actions</h2>
          <div style={s.actionButtons}>
            <button onClick={() => alert('Password reset functionality would go here')} style={s.actionBtn}>
              <i className="ti ti-lock" style={{ marginRight: 8 }} /> Change Password
            </button>
            <button onClick={() => alert('Email settings functionality would go here')} style={s.actionBtn}>
              <i className="ti ti-mail" style={{ marginRight: 8 }} /> Email Settings
            </button>
            <button onClick={() => alert('Notification settings functionality would go here')} style={s.actionBtn}>
              <i className="ti ti-bell" style={{ marginRight: 8 }} /> Notification Settings
            </button>
            <button onClick={() => alert('Theme settings functionality would go here')} style={s.actionBtn}>
              <i className="ti ti-palette" style={{ marginRight: 8 }} /> Theme Settings
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

const s = {
  root: {
    fontFamily: "'Outfit', sans-serif",
    background: '#F7F7FA',
    minHeight: '100vh',
    color: '#1A1A1F',
  },
  center: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', gap: 16,
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
    maxWidth: 1200,
    margin: '0 auto',
    padding: 28,
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 32,
  },
  headerSub: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.4)', margin: '0 0 6px',
  },
  headerTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: -0.5,
  },
  sectionCard: {
    background: '#fff',
    border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 18,
    padding: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 20, fontWeight: 600, color: '#1A1A1F', margin: '0 0 20px',
  },
  profileInfo: {
    display: 'flex', alignItems: 'center', gap: 24,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: 'rgba(124,99,255,0.1)',
    border: '2px solid rgba(124,99,255,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileDetails: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 20,
  },
  detailLabel: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.4)', margin: '0 0 6px',
  },
  detailValue: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 14, fontWeight: 500, color: '#1A1A1F',
  },
  editButton: {
    background: '#7C63FF',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: 12,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
    boxShadow: '0 4px 12px rgba(124,99,255,0.25)',
    alignSelf: 'flex-start',
  },
  profileForm: {
    marginTop: 24,
    padding: 24,
    background: 'rgba(124,99,255,0.05)',
    border: '1px solid rgba(124,99,255,0.1)',
    borderRadius: 12,
  },
  formTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 18, fontWeight: 600, margin: '0 0 20px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 16,
    marginBottom: 20,
  },
  formField: {
    marginBottom: 14,
  },
  label: {
    display: 'block',
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.4)', marginBottom: 8,
  },
  input: {
    width: '100%',
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
  formActions: {
    display: 'flex', gap: 10, marginTop: 20,
  },
  saveBtn: {
    background: '#22C55E', color: '#fff', border: 'none',
    padding: '11px 22px', borderRadius: 12,
    cursor: 'pointer', fontWeight: 600, fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
  },
  cancelBtn: {
    background: '#fff', color: 'rgba(20,20,30,0.5)',
    border: '1px solid rgba(20,20,30,0.1)',
    padding: '11px 22px', borderRadius: 12,
    cursor: 'pointer', fontWeight: 600, fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
  },
  actionButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
  },
  actionBtn: {
    display: 'flex', alignItems: 'center',
    background: '#fff',
    border: '1px solid rgba(20,20,30,0.07)',
    padding: '16px 20px',
    borderRadius: 14,
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
    color: '#1A1A1F',
    transition: 'all 0.2s',
    ':hover': {
      background: '#F7F7FA',
      borderColor: 'rgba(124,99,255,0.25)',
    },
  },
};