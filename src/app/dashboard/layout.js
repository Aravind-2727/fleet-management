'use client';

import ProtectedSidebar from '../../components/dashboard/ProtectedSidebar';
import Header from '../../components/dashboard/Header';
import { useAuth } from '../../app/lib/AuthContext';
import { usePathname } from 'next/navigation';
export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
const pathname = usePathname();
  if (loading) {
    return (
      <div style={s.loadingContainer}>
        <div style={s.spinnerRing}><div style={s.spinner} /></div>
        <p style={s.muted}>Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={s.root}>
      <div style={s.shell}>
       <ProtectedSidebar user={user} currentPath={pathname} />
        <main style={s.main}>
          <Header user={user} />
          {children}
        </main>
      </div>
      <Styles />
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      @keyframes spin { to { transform: rotate(360deg); } }
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
  shell: {
    display: 'flex',
    minHeight: '100vh',
  },
  main: {
    flex: 1,
    minWidth: 0,
    padding: 28,
    boxSizing: 'border-box',
    overflowX: 'hidden',
  },
  loadingContainer: {
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
};