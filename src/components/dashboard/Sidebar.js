'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '../../app/lib/supabase';

export default function Sidebar({ user, onLogout }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <aside style={s.sidebar}>
      <div style={s.brand}>
        <div style={s.brandIcon}><i className="ti ti-truck" /></div>
        <span style={s.brandText}>Fleet</span>
      </div>

      <nav style={s.nav}>
        <a href="/dashboard" style={s.navItemActive}>
          <i className="ti ti-layout-dashboard" style={s.navIcon} />
          <span>Dashboard</span>
        </a>
        <a href="/trucks" style={s.navItem}>
          <i className="ti ti-truck" style={s.navIcon} />
          <span>Trucks</span>
        </a>
        <a href="/drivers" style={s.navItem}>
          <i className="ti ti-id-badge-2" style={s.navIcon} />
          <span>Drivers</span>
        </a>
        <a href="/trips-management" style={s.navItem}>
          <i className="ti ti-route" style={s.navIcon} />
          <span>Trips Management</span>
        </a>
        <a href="/expenses" style={s.navItem}>
          <i className="ti ti-receipt" style={s.navIcon} />
          <span>Expenses</span>
        </a>
        <a href="/advances" style={s.navItem}>
          <i className="ti ti-wallet" style={s.navIcon} />
          <span>Advances</span>
        </a>
        <a href="/settlements" style={s.navItem}>
          <i className="ti ti-receipt" style={s.navIcon} />
          <span>Settlements</span>
        </a>
        <a href="/payments" style={s.navItem}>
          <i className="ti ti-credit-card" style={s.navIcon} />
          <span>Payments</span>
        </a>
        <a href="/reports" style={s.navItem}>
          <i className="ti ti-chart-bar" style={s.navIcon} />
          <span>Reports</span>
        </a>
        <a href="/settings" style={s.navItem}>
          <i className="ti ti-settings" style={s.navIcon} />
          <span>Settings</span>
        </a>
      </nav>

      <div style={s.sidebarFooter}>
        <button onClick={handleLogout} style={s.navItemLogout}>
          <i className="ti ti-logout" style={s.navIcon} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

const s = {
  sidebar: {
    width: 240,
    flexShrink: 0,
    background: '#fff',
    borderRight: '1px solid rgba(20,20,30,0.07)',
    padding: '24px 14px',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 0,
    height: '100vh',
    boxSizing: 'border-box',
  },
  brand: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '0 10px 22px',
  },
  brandIcon: {
    width: 32, height: 32, borderRadius: 10,
    background: 'rgba(124,99,255,0.1)',
    border: '1px solid rgba(124,99,255,0.25)',
    color: '#7C63FF',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16,
  },
  brandText: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 700, fontSize: 15, letterSpacing: -0.3,
  },
  nav: {
    display: 'flex', flexDirection: 'column', gap: 3,
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '11px 16px', borderRadius: 12,
    color: 'rgba(20,20,30,0.5)',
    fontSize: 14, fontFamily: "'Outfit', sans-serif",
    textDecoration: 'none', cursor: 'pointer',
    border: '1px solid transparent',
    transition: 'all 0.15s',
  },
  navItemActive: {
    background: 'rgba(124,99,255,0.1)',
    color: '#7C63FF',
    border: '1px solid rgba(124,99,255,0.22)',
  },
  navIcon: { fontSize: 18 },
  sidebarFooter: {
    marginTop: 'auto', paddingTop: 10,
    borderTop: '1px solid rgba(20,20,30,0.07)',
  },
  navItemLogout: {
    display: 'flex', alignItems: 'center', gap: 12,
    width: '100%', textAlign: 'left',
    padding: '11px 16px', borderRadius: 12,
    color: '#E0524A', background: 'none', border: 'none',
    fontSize: 14, fontFamily: "'Outfit', sans-serif",
    cursor: 'pointer',
  },
};