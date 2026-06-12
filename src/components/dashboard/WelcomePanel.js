'use client';

export default function WelcomePanel() {
  return (
    <div style={s.welcomePanel}>
      <div style={s.welcomeIcon}>
        <i className="ti ti-compass" style={{ fontSize: 22 }} />
      </div>
      <h2 style={s.welcomeTitle}>Welcome to fleet management dashboard</h2>
      <p style={s.welcomeText}>Select a navigation item from the sidebar to get started.</p>
    </div>
  );
}

const s = {
  welcomePanel: {
    background: '#fff',
    border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 18, padding: 24,
    textAlign: 'center',
    boxSizing: 'border-box',
  },
  welcomeIcon: {
    width: 48, height: 48, borderRadius: 14,
    background: 'rgba(124,99,255,0.1)',
    border: '1px solid rgba(124,99,255,0.25)',
    color: '#7C63FF',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 14px',
  },
  welcomeTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 16, fontWeight: 600, margin: '0 0 6px',
  },
  welcomeText: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 13, color: 'rgba(20,20,30,0.5)', margin: 0,
  },
};