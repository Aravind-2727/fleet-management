'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedSidebar from '../../components/dashboard/ProtectedSidebar';
import Header from '../../components/dashboard/Header';
import { useAuth } from '../../app/lib/AuthContext';

const BREAKPOINT = 768;

export default function DashboardLayout({ children }) {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile]       = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/');
      return;
    }
  }, [user, userRole, loading, router]);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${BREAKPOINT}px)`);
    const handler = (e) => {
      setIsMobile(e.matches);
      if (!e.matches) setSidebarOpen(false);
    };
    setIsMobile(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

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

      {/* Backdrop — rendered at root level so it covers everything */}
      {isMobile && sidebarOpen && (
        <div
          style={s.backdrop}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* shell = sidebar + main as flex siblings — fixes the overlap */}
      <div style={s.shell}>

        <ProtectedSidebar
          user={user}
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
  );
}

const s = {
  root: {
    fontFamily: "'Outfit', sans-serif",
    background: '#F7F7FA',
    minHeight: '100vh',
    color: '#1A1A1F',
    position: 'relative',   // backdrop positions relative to this
  },
  shell: {
    display: 'flex',        // sidebar + main are flex siblings here
    minHeight: '100vh',
  },
  main: {
    flex: 1,
    minWidth: 0,            // prevents flex child overflow blowout
    padding: 24,
    boxSizing: 'border-box',
    overflowX: 'hidden',
    // removed maxWidth/margin:auto — conflicts with sidebar flex layout
  },
  loadingContainer: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
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
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(20,20,30,0.45)',
    zIndex: 299,            // below sidebar z-index 300, above everything else
    animation: 'fadeIn 0.2s ease-out',
  },
};