'use client';

import { useAuth } from '../../app/lib/AuthContext';
import { canAccessModule } from '../../app/lib/roleGuard';

export default function ProtectedSidebar({ user, onLogout, ...props }) {
  const { userRole, loading, logout } = useAuth();

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'ti ti-layout-dashboard' },
    { id: 'trips', label: 'Trips', path: '/trips', icon: 'ti ti-truck' },
    { id: 'trips-management', label: 'Trips Management', path: '/trips-management', icon: 'ti ti-route' },
    { id: 'drivers', label: 'Drivers', path: '/drivers', icon: 'ti ti-users' },
    { id: 'expenses', label: 'Expenses', path: '/expenses', icon: 'ti ti-receipt' },
    { id: 'advances', label: 'Advances', path: '/advances', icon: 'ti ti-wallet' },
    { id: 'settlements', label: 'Settlements', path: '/settlements', icon: 'ti ti-credit-card' },
    { id: 'payments', label: 'Payments', path: '/payments', icon: 'ti ti-currency-rupee' },
    { id: 'reports', label: 'Reports', path: '/reports', icon: 'ti ti-chart-bar' },
    { id: 'settings', label: 'Settings', path: '/settings', icon: 'ti ti-settings' },
  ];

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    }
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <aside style={s.sidebar}>
      <div style={s.brand}>
        <div style={s.brandIcon}><i className="ti ti-truck" /></div>
        <span style={s.brandText}>Fleet</span>
      </div>

      <nav style={s.nav}>
        {sidebarItems.map((item) => {
          return (
            <a
              key={item.id}
              href={item.path}
              style={s.navItem}
              className={props.currentPath === item.path ? s.navItemActive : ''}
            >
              <i className={item.icon} style={s.navIcon} />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div style={s.sidebarFooter}>
        <div style={s.userInfo}>
          <span style={s.userEmail}>{user?.email}</span>
          <span style={s.userRole}>{userRole}</span>
        </div>
        <button onClick={handleLogout} style={s.logoutBtn} disabled={loading}>
          <i className="ti ti-logout" style={{ fontSize: 16 }} />
          <span>{loading ? 'Logging out...' : 'Logout'}</span>
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
    flex: 1,
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
  userInfo: {
    marginBottom: 12,
  },
  userEmail: {
    display: 'block',
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 13, color: 'rgba(20,20,30,0.5)',
    marginBottom: 4,
  },
  userRole: {
    display: 'inline-block',
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
    color: '#7C63FF',
    padding: '4px 8px',
    borderRadius: 6,
    background: 'rgba(124,99,255,0.1)',
    border: '1px solid rgba(124,99,255,0.25)',
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    width: '100%', textAlign: 'left',
    padding: '11px 16px', borderRadius: 12,
    color: '#E0524A', background: 'none', border: 'none',
    fontSize: 14, fontFamily: "'Outfit', sans-serif",
    cursor: 'pointer',
  },
};