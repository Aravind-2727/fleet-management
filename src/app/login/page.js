'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginRole, setLoginRole] = useState('owner');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const { user, userRole, login: authLogin, resetPassword, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const success = searchParams.get('success');
    if (success) setSuccessMsg(success);
  }, [searchParams]);

  useEffect(() => {
    if (!user) {
      setEmail('');
      setPassword('');
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (user && userRole) {
      if (userRole === 'driver') {
        router.push('/driver/home');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, userRole, authLoading, router]);

  const handleResetPassword = async () => {
    if (!email.trim()) { alert('Please enter your email address first'); return; }
    if (authLoading) return;
    try {
      await resetPassword(email.trim());
      alert('Password reset link sent to your email');
    } catch (error) { alert(error.message); }
  };

  const login = async () => {
    if (authLoading) return;
    setLoginError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      await authLogin(email, password, loginRole);
    } catch (error) {
      setLoginError(error.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={s.root}>
      <div style={s.glowTop} />
      <div style={s.glowBottom} />
      <div style={s.card}>
        <div style={s.shimmer} />
        <div style={s.brand}>
          <div style={s.brandIcon}><i className="ti ti-truck" /></div>
          <span style={s.brandText}>Fleet</span>
        </div>
        <h1 style={s.title}>Welcome back</h1>
        <p style={s.subtitle}>Sign in to your account</p>

        {successMsg && (
          <div style={{
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 16,
            color: '#22C55E',
            fontSize: 13,
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            {successMsg}
          </div>
        )}

        {loginError && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 16,
            color: '#F87171',
            fontSize: 13,
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            {loginError}
          </div>
        )}

        <div style={s.field}>
          <label style={s.label}>Email</label>
          <input type="email" name="fleet_email" autoComplete="off"
            placeholder="you@example.com" value={email}
            onChange={(e) => setEmail(e.target.value)} style={s.input} />
        </div>

        <div style={s.field}>
          <label style={s.label}>Password</label>
          <input type="password" name="fleet_password" autoComplete="new-password"
            placeholder="••••••••" value={password}
            onChange={(e) => setPassword(e.target.value)} style={s.input} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
            <button onClick={handleResetPassword} style={{
              background: 'none', border: 'none', color: '#7C63FF',
              cursor: 'pointer', fontSize: 12, fontFamily: "'Space Grotesk', sans-serif", padding: 0,
            }}>Forgot password?</button>
          </div>
        </div>

        <div style={s.field}>
          <label style={s.label}>Login as</label>
          <select value={loginRole} onChange={(e) => setLoginRole(e.target.value)} style={s.input}>
            <option value="owner">Owner</option>
            <option value="driver">Driver</option>
          </select>
        </div>

        <button onClick={login} disabled={loading || authLoading} style={s.primaryBtn}>
          {loading ? 'Please wait...' : 'Login'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 13, color: 'rgba(20,20,30,0.45)',
          }}>
            Don&apos;t have an account?{' '}
          </span>
          <Link href="/signup" style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 13, color: '#7C63FF',
            textDecoration: 'none', fontWeight: 600,
          }}>Create Account</Link>
        </div>
      </div>
      <Styles />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={s.root}><div style={{ ...s.card, textAlign: 'center', padding: 48 }}><p style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'rgba(20,20,30,0.45)' }}>Loading...</p></div><Styles /></div>}>
      <LoginForm />
    </Suspense>
  );
}

function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
      @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css');
      input::placeholder { color: rgba(20,20,30,0.3); }
      input:focus { outline: none; border-color: rgba(124,99,255,0.4) !important; box-shadow: 0 0 0 3px rgba(124,99,255,0.1); }
      button:disabled { opacity: 0.6; cursor: not-allowed; }
      a:hover { text-decoration: underline !important; }
    `}</style>
  );
}

const s = {
  root: {
    fontFamily: "'Outfit', sans-serif",
    background: '#F7F7FA',
    minHeight: '100vh',
    color: '#1A1A1F',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    padding: 24,
    boxSizing: 'border-box',
  },
  glowTop: {
    position: 'fixed', width: 320, height: 320, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,99,255,0.08) 0%, transparent 70%)',
    top: -100, right: -80, pointerEvents: 'none',
  },
  glowBottom: {
    position: 'fixed', width: 260, height: 260, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,99,255,0.06) 0%, transparent 70%)',
    bottom: 60, left: -80, pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    zIndex: 2,
    width: '100%',
    maxWidth: 400,
    background: '#fff',
    borderRadius: 24,
    border: '1px solid rgba(20,20,30,0.07)',
    padding: 24,
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(124,99,255,0.4), transparent)',
  },
  brand: {
    display: 'flex', alignItems: 'center', gap: 10,
    marginBottom: 28,
  },
  brandIcon: {
    width: 36, height: 36, borderRadius: 10,
    background: 'rgba(124,99,255,0.1)',
    border: '1px solid rgba(124,99,255,0.25)',
    color: '#7C63FF',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18,
  },
  brandText: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 700, fontSize: 17, letterSpacing: -0.3,
  },
  title: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 24, fontWeight: 700, margin: '0 0 6px',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 13, color: 'rgba(20,20,30,0.45)',
    margin: '0 0 28px',
  },
  field: {
    marginBottom: 18,
  },
  label: {
    display: 'block',
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.4)', marginBottom: 8,
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 12,
    border: '1px solid rgba(20,20,30,0.1)',
    background: '#F7F7FA',
    fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
    color: '#1A1A1F',
    boxSizing: 'border-box',
    transition: 'all 0.15s',
  },
  primaryBtn: {
    width: '100%',
    marginTop: 8,
    padding: '13px 0',
    borderRadius: 14,
    border: 'none',
    background: '#7C63FF',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "'Outfit', sans-serif",
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(124,99,255,0.25)',
  },
};
