'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../app/lib/AuthContext';
import ProtectedSidebar from './ProtectedSidebar';
import Header from './Header';

const MOBILE_BREAKPOINT = 768;

export default function DashboardLayout({ children, user, onLogout }) {
  const { role, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile]       = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!role) {
      router.push('/');
      return;
    }
    if (role !== 'owner') {
      router.push('/driver/home');
    }
  }, [role, loading, router]);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const handler = (e) => {
      setIsMobile(e.matches);
      if (!e.matches) setSidebarOpen(false); // auto-close when going desktop
    };
    setIsMobile(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <>
      <Styles />

      <div style={s.root}>
        {/* Backdrop — mobile only, behind sidebar */}
        {isMobile && sidebarOpen && (
          <div
            style={s.backdrop}
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar + main are flex siblings — this is what fixes the overlap */}
        <div style={s.shell}>
          <ProtectedSidebar
            user={user}
            onLogout={onLogout}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            isMobile={isMobile}
          />

          <main style={s.main}>
            <Header
              user={user}
              onMenuClick={() => setSidebarOpen(o => !o)}
              isMobile={isMobile}
            />
            {children}
          </main>
        </div>
      </div>
    </>
  );
}

function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

      *, *::before, *::after { box-sizing: border-box; }

      @keyframes spin    { to { transform: rotate(360deg); } }
      @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }

      ::-webkit-scrollbar       { width: 8px; height: 8px; }
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
    display: 'flex',      // sidebar + main are SIBLINGS here
    minHeight: '100vh',
  },
  main: {
    flex: 1,
    minWidth: 0,          // prevents flex child blowout
    padding: 24,
    boxSizing: 'border-box',
    overflowX: 'hidden',
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(20,20,30,0.45)',
    zIndex: 299,          // below sidebar (300) but above everything else
    animation: 'fadeIn 0.2s ease-out',
  },
};