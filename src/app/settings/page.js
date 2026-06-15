'use client';

import { useState } from 'react';
import GeneralSettings from '../../components/settings/GeneralSettings';
import CompanySettings from '../../components/settings/CompanySettings';
import UserSettings from '../../components/settings/UserSettings';
import DashboardLayout from '../../components/dashboard/layout';

export default function SettingsPage({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'company', label: 'Company' },
    { id: 'user', label: 'User' },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div style={s.root}>
        <div style={s.container}>
          <div style={s.header}>
            <div>
              <p style={s.headerSub}>System Configuration</p>
              <h1 style={s.headerTitle}>Settings</h1>
            </div>
            <button onClick={handleSave} disabled={saving} style={s.saveBtn}>
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

          {message.text && (
            <div style={{ ...s.message, ...(message.type === 'success' ? s.messageSuccess : s.messageError) }}>
              {message.text}
            </div>
          )}

          <div style={s.tabContainer}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{ ...s.tabBtn, ...(activeTab === tab.id ? s.tabBtnActive : {}) }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={s.content}>
            {activeTab === 'general' && <GeneralSettings />}
            {activeTab === 'company' && <CompanySettings />}
            {activeTab === 'user' && <UserSettings />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
      @keyframes spin { to { transform: rotate(360deg); } }
      input::placeholder { color: rgba(20,20,30,0.3); }
      input:focus { outline: none; border-color: rgba(124,99,255,0.4) !important; box-shadow: 0 0 0 3px rgba(124,99,255,0.1); }
      select:focus { outline: none; border-color: rgba(124,99,255,0.4) !important; box-shadow: 0 0 0 3px rgba(124,99,255,0.1); }
      textarea:focus { outline: none; border-color: rgba(124,99,255,0.4) !important; box-shadow: 0 0 0 3px rgba(124,99,255,0.1); }
      button:disabled { opacity: 0.6; cursor: not-allowed; }
      ::-webkit-scrollbar { width: 8px; height: 8px; }
      ::-webkit-scrollbar-thumb { background: rgba(20,20,30,0.1); border-radius: 8px; }
      ::-webkit-scrollbar-track { background: transparent; }
    `}</style>
  );
}

const s = {
  root: {
    fontFamily: "'Outfit', sans-serif",
    background: '#F7F7FA',
    minHeight: '100vh',
    color: '#1A1A1F',
  },
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: 28,
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 24, flexWrap: 'wrap', gap: 16,
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
  saveBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#7C63FF', color: '#fff', border: 'none',
    padding: '11px 20px', borderRadius: 12,
    cursor: 'pointer', fontWeight: 600, fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
    boxShadow: '0 8px 20px rgba(124,99,255,0.25)',
    transition: 'all 0.15s',
  },
  message: {
    padding: 12, borderRadius: 8, marginBottom: 24,
    fontSize: 14, fontFamily: "'Outfit', sans-serif",
  },
  messageSuccess: {
    background: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.25)',
    color: '#22C55E',
  },
  messageError: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.25)',
    color: '#EF4444',
  },
  tabContainer: {
    display: 'flex', gap: 12, marginBottom: 28,
    flexWrap: 'wrap',
  },
  tabBtn: {
    padding: '11px 22px', borderRadius: 12,
    border: '1px solid rgba(20,20,30,0.07)',
    background: '#fff', color: 'rgba(20,20,30,0.6)',
    cursor: 'pointer', fontWeight: 600, fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
    transition: 'all 0.15s',
  },
  tabBtnActive: {
    background: '#7C63FF', color: '#fff', border: 'none',
    boxShadow: '0 8px 20px rgba(124,99,255,0.25)',
  },
  content: {
    background: '#fff',
    border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 16, padding: 28,
    boxShadow: '0 2px 8px rgba(20,20,30,0.06)',
  },
};
