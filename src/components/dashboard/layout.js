'use client';
import ProtectedSidebar from './ProtectedSidebar';
import Header from './Header';
import { usePathname } from 'next/navigation';
export default function DashboardLayout({ children, user, onLogout }) {
  const pathname = usePathname();
  return (
    <div style={s.root}>
      <div style={s.shell}>
    
<ProtectedSidebar
  user={user}
  onLogout={onLogout}
  currentPath={pathname}
/>
        <main style={s.main}>
          <Header user={user} onLogout={onLogout} />
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
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
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
    padding: 28,
    boxSizing: 'border-box',
    maxWidth: 1440,
  },
};