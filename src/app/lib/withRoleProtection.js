'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import { canAccessRoute } from './roleGuard';

export const withRoleProtection = (WrappedComponent, requiredRoute) => {
  return function ProtectedComponent(props) {
    const router = useRouter();
    const { userRole, loading } = useAuth();

    if (loading) {
      return (
        <div style={s.loadingContainer}>
          <div style={s.spinnerRing}><div style={s.spinner} /></div>
          <p style={s.muted}>Loading...</p>
        </div>
      );
    }

    if (!userRole) {
      router.push('/dashboard');
      return null;
    }

    const hasAccess = canAccessRoute(requiredRoute, userRole);
    
    if (!hasAccess) {
      router.push('/dashboard');
      return null;
    }

    return <WrappedComponent {...props} userRole={userRole} />;
  };
};

const s = {
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