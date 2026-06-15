'use client';

import { useState } from 'react';

export default function GeneralSettings() {
  const [formData, setFormData] = useState({
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    timezone: 'America/New_York',
    language: 'en',
    currency: 'USD',
    theme: 'light',
    compactView: false,
    emailNotifications: true,
    smsNotifications: false,
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  ];

  const themes = [
    { code: 'light', name: 'Light' },
    { code: 'dark', name: 'Dark' },
    { code: 'auto', name: 'Auto' },
  ];

  return (
    <div style={s.section}>
      <h2 style={s.sectionTitle}>General Settings</h2>
      <p style={s.sectionDescription}>Configure application-wide preferences and behavior.</p>

      <div style={s.formGrid}>
        <div style={s.formGroup}>
          <label style={s.formLabel}>Date Format</label>
          <select
            value={formData.dateFormat}
            onChange={(e) => handleChange('dateFormat', e.target.value)}
            style={s.formSelect}
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        <div style={s.formGroup}>
          <label style={s.formLabel}>Time Format</label>
          <select
            value={formData.timeFormat}
            onChange={(e) => handleChange('timeFormat', e.target.value)}
            style={s.formSelect}
          >
            <option value="12h">12 Hour (2:30 PM)</option>
            <option value="24h">24 Hour (14:30)</option>
          </select>
        </div>

        <div style={s.formGroup}>
          <label style={s.formLabel}>Timezone</label>
          <select
            value={formData.timezone}
            onChange={(e) => handleChange('timezone', e.target.value)}
            style={s.formSelect}
          >
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>

        <div style={s.formGroup}>
          <label style={s.formLabel}>Language</label>
          <select
            value={formData.language}
            onChange={(e) => handleChange('language', e.target.value)}
            style={s.formSelect}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>

        <div style={s.formGroup}>
          <label style={s.formLabel}>Currency</label>
          <select
            value={formData.currency}
            onChange={(e) => handleChange('currency', e.target.value)}
            style={s.formSelect}
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.symbol} {currency.name} ({currency.code})
              </option>
            ))}
          </select>
        </div>

        <div style={s.formGroup}>
          <label style={s.formLabel}>Theme</label>
          <select
            value={formData.theme}
            onChange={(e) => handleChange('theme', e.target.value)}
            style={s.formSelect}
          >
            {themes.map((theme) => (
              <option key={theme.code} value={theme.code}>
                {theme.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={s.toggleSection}>
        <div style={s.toggleGroup}>
          <div>
            <p style={s.toggleLabel}>Compact View</p>
            <p style={s.toggleDescription}>Use more compact layout to fit more data on screen</p>
          </div>
          <label style={s.toggleSwitch}>
            <input
              type="checkbox"
              checked={formData.compactView}
              onChange={(e) => handleChange('compactView', e.target.checked)}
              style={s.toggleInput}
            />
            <span style={s.toggleSlider}></span>
          </label>
        </div>

        <div style={s.toggleGroup}>
          <div>
            <p style={s.toggleLabel}>Email Notifications</p>
            <p style={s.toggleDescription}>Receive email notifications for system events</p>
          </div>
          <label style={s.toggleSwitch}>
            <input
              type="checkbox"
              checked={formData.emailNotifications}
              onChange={(e) => handleChange('emailNotifications', e.target.checked)}
              style={s.toggleInput}
            />
            <span style={s.toggleSlider}></span>
          </label>
        </div>

        <div style={s.toggleGroup}>
          <div>
            <p style={s.toggleLabel}>SMS Notifications</p>
            <p style={s.toggleDescription}>Receive SMS notifications for alerts</p>
          </div>
          <label style={s.toggleSwitch}>
            <input
              type="checkbox"
              checked={formData.smsNotifications}
              onChange={(e) => handleChange('smsNotifications', e.target.checked)}
              style={s.toggleInput}
            />
            <span style={s.toggleSlider}></span>
          </label>
        </div>
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
  formSelect: {
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
  toggleSection: {
    marginTop: 32, paddingTop: 32,
    borderTop: '1px solid rgba(20,20,30,0.07)',
    display: 'flex', flexDirection: 'column', gap: 20,
  },
  toggleGroup: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, background: 'rgba(124,99,255,0.05)',
    border: '1px solid rgba(124,99,255,0.1)',
    borderRadius: 12,
  },
  toggleLabel: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 15, fontWeight: 500, margin: 0,
  },
  toggleDescription: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 13, color: 'rgba(20,20,30,0.5)', margin: '4px 0 0',
  },
  toggleSwitch: {
    position: 'relative', display: 'inline-block',
    width: 48, height: 24,
  },
  toggleInput: {
    opacity: 0, width: 0, height: 0,
  },
  toggleSlider: {
    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#ccc', borderRadius: 24,
    transition: '.4s',
  },
};