'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';
import { withRoleProtection } from '../../lib/withRoleProtection';
import DashboardLayout from '../../dashboard/layout';
const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount || 0);

function DriverPay() {
  const { user } = useAuth();
  const [driverId, setDriverId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({
    totalEarnings: 0,
    totalAdvances: 0,
    totalPaid: 0,
    netPayable: 0,
  });
  const [settlements, setSettlements] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetchPayData();
  }, [user]);

  const fetchPayData = async () => {
    try {
      setLoading(true);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) return;

      const { data: driver, error: driverError } = await supabase
        .from('drivers')
        .select('id')
        .eq('profile_id', profile.id)
        .single();

      if (driverError || !driver) return;

      setDriverId(driver.id);

      const [settlementsRes, advancesRes] = await Promise.all([
        supabase
          .from('settlements')
          .select('id, earnings, reimbursable_expenses, advances_deducted, net_payable, payment_status, payment_date, created_at')
          .eq('driver_id', driver.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('advance_requests')
          .select('amount, status')
          .eq('driver_id', driver.id),
      ]);

      const settlementsData = settlementsRes.data || [];
      const advancesData = advancesRes.data || [];

      const totalEarnings = settlementsData.reduce((sum, s) => sum + (s.earnings || 0), 0);
      const totalAdvances = advancesData
        .filter(a => a.status === 'paid' || a.status === 'approved')
        .reduce((sum, a) => sum + (a.amount || 0), 0);
      const totalPaid = settlementsData
        .filter(s => s.payment_status === 'paid')
        .reduce((sum, s) => sum + (s.net_payable || 0), 0);
      const totalPending = settlementsData
        .filter(s => s.payment_status === 'pending' || s.payment_status === 'partial')
        .reduce((sum, s) => sum + (s.net_payable || 0), 0);

      setSettlements(settlementsData);
      setSummary({
        totalEarnings,
        totalAdvances,
        totalPaid,
        netPayable: totalPending,
      });
    } catch (err) {
      console.error('Error fetching pay data:', err);
      setError('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusStyle = (status) => {
    switch (status) {
      case 'pending': return { backgroundColor: '#FB923C15', color: '#FB923C' };
      case 'paid':    return { backgroundColor: '#22C55E15', color: '#22C55E' };
      case 'partial': return { backgroundColor: '#3B82F615', color: '#3B82F6' };
      default:        return { backgroundColor: '#6B728015', color: '#6B7280' };
    }
  };

  if (loading) {
   return (
  <DashboardLayout>
    <div style={s.root}>
        <div style={s.center}>
          <div style={s.spinnerRing}><div style={s.spinner} /></div>
          <p style={s.muted}>Loading payment data...</p>
        </div>
          </div>
  </DashboardLayout>
  );
}

  if (error) {
   return (
  <DashboardLayout>
    <div style={s.root}>
        <div style={s.center}>
          <p style={s.muted}>{error}</p>
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
          <h1 style={s.headerTitle}>My Pay</h1>
        </div>
      </div>

      <div style={s.summaryGrid}>
        <div style={s.summaryCard}>
          <div style={{ ...s.summaryIcon, background: '#22C55E15', color: '#22C55E' }}>
            <i className="ti ti-wallet" style={{ fontSize: 24 }} />
          </div>
          <div>
            <p style={s.summaryLabel}>Total Earnings</p>
            <h3 style={s.summaryValue}>{formatCurrency(summary.totalEarnings)}</h3>
          </div>
        </div>

        <div style={s.summaryCard}>
          <div style={{ ...s.summaryIcon, background: '#FB923C15', color: '#FB923C' }}>
            <i className="ti ti-credit-card" style={{ fontSize: 24 }} />
          </div>
          <div>
            <p style={s.summaryLabel}>Advances Taken</p>
            <h3 style={s.summaryValue}>{formatCurrency(summary.totalAdvances)}</h3>
          </div>
        </div>

        <div style={s.summaryCard}>
          <div style={{ ...s.summaryIcon, background: '#3B82F615', color: '#3B82F6' }}>
            <i className="ti ti-check" style={{ fontSize: 24 }} />
          </div>
          <div>
            <p style={s.summaryLabel}>Total Paid</p>
            <h3 style={s.summaryValue}>{formatCurrency(summary.totalPaid)}</h3>
          </div>
        </div>

        <div style={s.summaryCardAccent}>
          <div style={{ ...s.summaryIcon, background: '#7C63FF15', color: '#7C63FF' }}>
            <i className="ti ti-currency-rupee" style={{ fontSize: 24 }} />
          </div>
          <div>
            <p style={{ ...s.summaryLabel, color: '#7C63FF' }}>Net Payable</p>
            <h3 style={{ ...s.summaryValue, color: '#7C63FF' }}>{formatCurrency(summary.netPayable)}</h3>
          </div>
        </div>
      </div>

      <h2 style={s.sectionTitle}>Settlement History</h2>

      {settlements.length === 0 ? (
        <div style={s.empty}>No settlements yet</div>
      ) : (
        <div style={s.tableCard}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Earnings</th>
                <th style={s.th}>Reimbursable</th>
                <th style={s.th}>Advances Deducted</th>
                <th style={s.th}>Net Payable</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {settlements.map((settlement) => (
                <tr key={settlement.id} style={s.tr}>
                  <td style={s.td}>{formatCurrency(settlement.earnings || 0)}</td>
                  <td style={s.td}>{formatCurrency(settlement.reimbursable_expenses || 0)}</td>
                  <td style={s.td}>{formatCurrency(settlement.advances_deducted || 0)}</td>
                  <td style={s.td}>{formatCurrency(settlement.net_payable || 0)}</td>
                  <td style={s.td}>
                    <span style={{
                      ...s.statusBadge,
                      ...getPaymentStatusStyle(settlement.payment_status),
                    }}>
                      {settlement.payment_status}
                    </span>
                  </td>
                  <td style={s.td}>
                    {settlement.payment_date
                      ? new Date(settlement.payment_date).toLocaleDateString()
                      : new Date(settlement.created_at).toLocaleDateString()}
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
    marginBottom: 24,
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
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 14,
    marginBottom: 28,
  },
  summaryCard: {
    background: '#fff', border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 16, padding: 16,
    display: 'flex', alignItems: 'center', gap: 14,
  },
  summaryCardAccent: {
    background: 'linear-gradient(135deg, #F2EEFF, #fff)',
    border: '1px solid rgba(124,99,255,0.2)',
    borderRadius: 16, padding: 16,
    display: 'flex', alignItems: 'center', gap: 14,
  },
  summaryIcon: {
    width: 44, height: 44, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  summaryLabel: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.4)', margin: '0 0 4px',
  },
  summaryValue: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 18, fontWeight: 700, margin: 0, color: '#1A1A1F',
  },
  sectionTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 18, fontWeight: 600, color: '#1A1A1F', margin: '0 0 14px',
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
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 600 },
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

export default withRoleProtection(DriverPay, '/driver/pay');
