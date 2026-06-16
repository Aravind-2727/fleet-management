'use client';

export default function Header({ user, onLogout }) {
  return (
    <div style={s.header}>
      <div>
        <p style={s.headerSub}>Overview</p>
        <h1 style={s.headerTitle}>Dashboard</h1>
      </div>
      <div style={s.headerRight}>
        <span style={s.userEmail}>{user?.email}</span>

      </div>
    </div>
  );
}

const s = {
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
  headerRight: {
    display: 'flex', alignItems: 'center', gap: 12,
  },
  userEmail: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 13, color: 'rgba(20,20,30,0.5)',
  },
  logoutBtn: {
    background: '#E0524A', color: '#fff', border: 'none',
    borderRadius: 20, padding: '7px 16px',
    fontSize: 13, fontWeight: 600,
    fontFamily: "'Outfit', sans-serif", cursor: 'pointer',
  },
};