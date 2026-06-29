'use client';

import { useAuth } from '../../app/lib/AuthContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV_ITEMS = [
  { id: 'dashboard',       label: 'Dashboard',    path: '/dashboard',        icon: 'ti ti-layout-dashboard' },
  { id: 'trips',           label: 'Trips',         path: '/trips',            icon: 'ti ti-route' },
  { id: 'trucks',          label: 'Trucks',        path: '/trucks',           icon: 'ti ti-truck' },
  { id: 'drivers',         label: 'Drivers',       path: '/drivers',          icon: 'ti ti-users' },
  { id: 'expenses',        label: 'Expenses',      path: '/expenses',         icon: 'ti ti-receipt' },
  { id: 'advances',        label: 'Advances',      path: '/advances',         icon: 'ti ti-wallet' },
  { id: 'settlements',     label: 'Settlements',   path: '/settlements',      icon: 'ti ti-credit-card' },
  { id: 'payments',        label: 'Payments',      path: '/payments',         icon: 'ti ti-currency-rupee' },
  { id: 'reports',         label: 'Reports',       path: '/reports',          icon: 'ti ti-chart-bar' },
  { id: 'settings',        label: 'Settings',      path: '/settings',         icon: 'ti ti-settings' },
];
const DRIVER_NAV_ITEMS = [
  {
    id: 'driver-home',
    label: 'My Trip',
    path: '/driver/home',
    icon: 'ti ti-truck',
  },
  {
    id: 'driver-expenses',
    label: 'Expenses',
    path: '/driver/expenses',
    icon: 'ti ti-receipt',
  },
  {
    id: 'driver-advances',
    label: 'Advances',
    path: '/driver/advances',
    icon: 'ti ti-wallet',
  },
  {
    id: 'driver-pay',
    label: 'Pay',
    path: '/driver/pay',
    icon: 'ti ti-currency-rupee',
  },
];
export default function ProtectedSidebar({ user, onLogout, isOpen, onClose, isMobile }) {
  const { userRole, loading, logout } = useAuth();
  const pathname = usePathname();

  const handleLogout = async () => {
    if (onLogout) onLogout();
    try { await logout(); }
    catch (e) { console.error('Logout error:', e); }
  };
const menuItems =
  userRole === 'driver'
    ? DRIVER_NAV_ITEMS
    : NAV_ITEMS;
  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
        .nav-link:hover {
          background: rgba(20,20,30,0.04) !important;
          color: rgba(20,20,30,0.8) !important;
        }
        .logout-btn:hover { background: rgba(224,82,74,0.07) !important; }
        .close-btn:hover  { background: rgba(20,20,30,0.06) !important; }
      `}</style>

      <aside style={{
        ...s.sidebar,
        ...(isMobile ? s.sidebarMobile : {}),
        ...(isMobile && isOpen  ? s.sidebarMobileOpen  : {}),
        ...(isMobile && !isOpen ? s.sidebarMobileClosed : {}),
      }}>

        {/* Close button — mobile only */}
        {isMobile && (
          <div style={s.closeRow}>
            <button
              onClick={onClose}
              style={s.closeBtn}
              className="close-btn"
              aria-label="Close menu"
            >
              <i className="ti ti-x" style={{ fontSize: 20 }} />
            </button>
          </div>
        )}

        {/* Brand */}
        <div style={s.brand}>
          <div style={s.brandIcon}><i className="ti ti-truck" /></div>
          <span style={s.brandText}>Fleet</span>
        </div>

        {/* Nav */}
        <nav style={s.nav}>
       {menuItems.map(item => {
            const active = pathname === item.path;
            return (
              <Link
                key={item.id}
                href={item.path}
                onClick={isMobile ? onClose : undefined}
                className="nav-link"
                style={{ ...s.navItem, ...(active ? s.navItemActive : {}) }}
              >
                <i className={item.icon} style={s.navIcon} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={s.footer}>
          <div style={s.userInfo}>
            <span style={s.userEmail} title={user?.email}>{user?.email}</span>
            {userRole && <span style={s.userRole}>{userRole}</span>}
          </div>
          <button
            onClick={handleLogout}
            style={s.logoutBtn}
            className="logout-btn"
            disabled={loading}
          >
            <i className="ti ti-logout" style={{ fontSize: 16 }} />
            <span>{loading ? 'Logging out…' : 'Logout'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}

const s = {
  // ── Desktop: part of normal flex flow ──────────────────
  sidebar: {
    width: 240,
    flexShrink: 0,           // never squish — this fixes the overlap bug
    background: '#fff',
    borderRight: '1px solid rgba(20,20,30,0.07)',
    padding: '24px 14px',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 0,
    height: '100vh',
    boxSizing: 'border-box',
    overflowY: 'auto',
    zIndex: 10,
  },

  // ── Mobile overrides ───────────────────────────────────
  sidebarMobile: {
    position: 'fixed',
    top: 0, left: 0,
    height: '100vh',
    zIndex: 300,
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
  },
  sidebarMobileOpen: {
    transform: 'translateX(0)',
    boxShadow: '4px 0 32px rgba(20,20,30,0.18)',
    animation: 'slideIn 0.25s ease-out',
  },
  sidebarMobileClosed: {
    transform: 'translateX(-100%)',
    boxShadow: 'none',
  },

  closeRow: {
    display: 'flex', justifyContent: 'flex-end', marginBottom: 8,
  },
  closeBtn: {
    background: 'none', border: 'none',
    color: 'rgba(20,20,30,0.5)', cursor: 'pointer',
    padding: 6, borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.15s',
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
    fontSize: 16, flexShrink: 0,
  },
  brandText: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 700, fontSize: 15, letterSpacing: -0.3,
  },

  nav: {
    display: 'flex', flexDirection: 'column', gap: 3, flex: 1,
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '11px 16px', borderRadius: 12,
    color: 'rgba(20,20,30,0.5)',
    fontSize: 14, fontFamily: "'Outfit', sans-serif",
    textDecoration: 'none',
    border: '1px solid transparent',
    transition: 'background 0.15s, color 0.15s',
  },
  navItemActive: {
    background: 'rgba(124,99,255,0.1)',
    color: '#7C63FF',
    border: '1px solid rgba(124,99,255,0.22)',
  },
  navIcon: { fontSize: 18, flexShrink: 0 },

  footer: {
    marginTop: 'auto', paddingTop: 12,
    borderTop: '1px solid rgba(20,20,30,0.07)',
  },
  userInfo: { marginBottom: 10 },
  userEmail: {
    display: 'block',
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 12, color: 'rgba(20,20,30,0.45)',
    marginBottom: 6,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    maxWidth: '100%',
  },
  userRole: {
    display: 'inline-block',
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
    color: '#7C63FF',
    padding: '3px 8px', borderRadius: 6,
    background: 'rgba(124,99,255,0.1)',
    border: '1px solid rgba(124,99,255,0.25)',
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    width: '100%',
    padding: '11px 16px', borderRadius: 12,
    color: '#E0524A', background: 'none', border: 'none',
    fontSize: 14, fontFamily: "'Outfit', sans-serif",
    cursor: 'pointer', transition: 'background 0.15s',
  },
};