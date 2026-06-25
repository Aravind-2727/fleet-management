'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';
import { withRoleProtection } from '../../lib/withRoleProtection';
import DashboardLayout from '../../dashboard/layout';
import AdvanceRequestModal from '../../../components/driver/AdvanceRequestModal';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount || 0);

function DriverAdvances() {
  const { user } = useAuth();
  const [advances, setAdvances] = useState([]);
  const [driverId, setDriverId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchDriverData();
  }, [user]);

  const fetchDriverData = async () => {
    try {
      setLoading(true);

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      const { data: driver } = await supabase
        .from('drivers')
        .select('id')
        .eq('profile_id', profile.id)
        .single();

      if (!driver) return;

      setDriverId(driver.id);

      const { data, error } = await supabase
        .from('advance_requests')
        .select('id, amount, reason, status, requested_date, created_at')
        .eq('driver_id', driver.id)
        .order('created_at', { ascending: false });

      if (!error) setAdvances(data || []);
    } catch (error) {
      console.error('Error fetching advances:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':  return { backgroundColor: '#FB923C15', color: '#FB923C' };
      case 'approved': return { backgroundColor: '#3B82F615', color: '#3B82F6' };
      case 'rejected': return { backgroundColor: '#6B728015', color: '#6B7280' };
      case 'paid':     return { backgroundColor: '#22C55E15', color: '#22C55E' };
      default:         return { backgroundColor: '#6B728015', color: '#6B7280' };
    }
  };

if (loading) {
  return (
    <DashboardLayout>
      <div style={s.root}>
        <div style={s.center}>
          <div style={s.spinnerRing}><div style={s.spinner} /></div>
          <p style={s.muted}>Loading advances...</p>
        </div>
           </div>
    </DashboardLayout>
  );
}

return (
  <DashboardLayout>
    <div style={s.root}>
      <div style={s.header}>
        <div>
          <p style={s.headerSub}>Driver</p>
          <h1 style={s.headerTitle}>My Advances</h1>
        </div>
        <button onClick={() => setShowForm(true)} style={s.primaryBtn}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Request Advance
        </button>
      </div>

      <AdvanceRequestModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={fetchDriverData}
        driverId={driverId}
        userId={user.id}
      />

      {advances.length === 0 ? (
        <div style={s.empty}>No advance requests</div>
      ) : (
        <div style={s.tableCard}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Amount</th>
                <th style={s.th}>Reason</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Requested</th>
              </tr>
            </thead>
            <tbody>
              {advances.map((advance) => (
                <tr key={advance.id} style={s.tr}>
                  <td style={s.td}>{formatCurrency(advance.amount)}</td>
                  <td style={s.td}>{advance.reason}</td>
                  <td style={s.td}>
                    <span style={{
                      ...s.statusBadge,
                      ...getStatusStyle(advance.status),
                    }}>
                      {advance.status}
                    </span>
                  </td>
                  <td style={s.td}>
                    {advance.requested_date
                      ? new Date(advance.requested_date).toLocaleDateString()
                      : new Date(advance.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
       </div>
  </DashboardLayout>
  );
}
const s = {
  root: {
    fontFamily: "'Outfit', sans-serif",
    background: '#F7F7FA',
    minHeight: '100vh',
    color: '#1A1A1F',
    padding: 16,
    boxSizing: 'border-box',
  },
  center: {
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
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20, flexWrap: 'wrap', gap: 12,
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
  primaryBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#7C63FF', color: '#fff', border: 'none',
    padding: '11px 20px', borderRadius: 12,
    cursor: 'pointer', fontWeight: 600, fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
    boxShadow: '0 8px 20px rgba(124,99,255,0.25)',
    whiteSpace: 'nowrap', minHeight: 44,
  },
  formCard: {
    background: '#fff', border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 18, padding: 20, marginBottom: 20,
    position: 'relative', overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(124,99,255,0.4), transparent)',
  },
  formTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 16, fontWeight: 600, margin: '0 0 16px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 14, marginBottom: 20,
  },
  formField: { marginBottom: 14 },
  label: {
    display: 'block', fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.4)', marginBottom: 8,
  },
  input: {
    width: '100%', padding: '12px 14px', borderRadius: 12,
    border: '1px solid rgba(20,20,30,0.1)', background: '#F7F7FA',
    fontSize: 14, fontFamily: "'Outfit', sans-serif",
    color: '#1A1A1F', boxSizing: 'border-box', transition: 'all 0.15s',
    minHeight: 44,
  },
  formActions: { display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap' },
  saveBtn: {
    background: '#22C55E', color: '#fff', border: 'none',
    padding: '11px 22px', borderRadius: 12,
    cursor: 'pointer', fontWeight: 600, fontSize: 14,
    fontFamily: "'Outfit', sans-serif", minHeight: 44,
  },
  cancelBtn: {
    background: '#fff', color: 'rgba(20,20,30,0.5)',
    border: '1px solid rgba(20,20,30,0.1)',
    padding: '11px 22px', borderRadius: 12,
    cursor: 'pointer', fontWeight: 600, fontSize: 14,
    fontFamily: "'Outfit', sans-serif", minHeight: 44,
  },
  empty: {
    background: '#fff', border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 18, padding: '40px 0', textAlign: 'center',
    fontFamily: "'Space Grotesk', sans-serif",
    color: 'rgba(20,20,30,0.35)', fontSize: 13,
  },
  tableCard: {
    background: '#fff', border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 18, overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 500 },
  th: {
    textAlign: 'left', padding: '12px 16px',
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.4)',
    borderBottom: '1px solid rgba(20,20,30,0.07)',
    whiteSpace: 'nowrap',
  },
  tr: { borderBottom: '1px solid rgba(20,20,30,0.05)' },
  td: { padding: '12px 16px', fontSize: 14, fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap' },
  statusBadge: {
    display: 'inline-block', padding: '4px 12px', borderRadius: 20,
    fontSize: 12, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif",
    textTransform: 'capitalize', whiteSpace: 'nowrap',
  },
};

export default withRoleProtection(DriverAdvances, '/driver/advances');
