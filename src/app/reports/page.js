'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../../components/dashboard/layout';

export default function ReportsPage({ user, onLogout }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setReports([]);
        setLoading(false);
        return;
      }

      // Get financial summary
      const [
        tripsResponse,
        expensesResponse,
        advancesResponse,
        settlementsResponse,
        paymentsResponse
      ] = await Promise.all([
        supabase
          .from('trips')
          .select('id, freight_amount, status')
          .eq('owner_id', authUser.id),
        supabase
          .from('trip_expenses')
          .select('amount, paid_by')
          .eq('owner_id', authUser.id),
        supabase
          .from('advance_requests')
          .select('amount, status')
          .eq('owner_id', authUser.id),
        supabase
          .from('settlements')
          .select('net_payable, payment_status')
          .eq('owner_id', authUser.id),
        supabase
          .from('payments')
          .select('amount')
          .eq('owner_id', authUser.id)
      ]);

      const trips = tripsResponse.data || [];
      const expenses = expensesResponse.data || [];
      const advances = advancesResponse.data || [];
      const settlements = settlementsResponse.data || [];
      const payments = paymentsResponse.data || [];

      const reportData = [
        {
          title: 'Trip Summary',
          total: trips.reduce((sum, trip) => sum + (trip.freight_amount || 0), 0),
          count: trips.length,
          icon: 'ti ti-truck',
          color: '#3B82F6',
        },
        {
          title: 'Total Expenses',
          total: expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0),
          count: expenses.length,
          icon: 'ti ti-receipt',
          color: '#FB923C',
        },
        {
          title: 'Advance Requests',
          total: advances.reduce((sum, advance) => sum + (advance.amount || 0), 0),
          count: advances.length,
          icon: 'ti ti-credit-card',
          color: '#8B5CF6',
        },
        {
          title: 'Settlements',
          total: settlements.reduce((sum, settlement) => sum + (settlement.net_payable || 0), 0),
          count: settlements.length,
          icon: 'ti ti-wallet',
          color: '#22C55E',
        },
        {
          title: 'Total Payments',
          total: payments.reduce((sum, payment) => sum + (payment.amount || 0), 0),
          count: payments.length,
          icon: 'ti ti-money',
          color: '#7C63FF',
        },
      ];

      setReports(reportData);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={s.root}>
        <div style={s.center}>
          <div style={s.spinnerRing}><div style={s.spinner} /></div>
          <p style={s.muted}>Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div style={s.shell}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <p style={s.headerSub}>Fleet</p>
            <h1 style={s.headerTitle}>Reports</h1>
          </div>
        </div>

        {/* Reports Grid */}
        <div style={s.reportsGrid}>
          {reports.map((report, index) => (
            <div key={index} style={s.reportCard}>
              <div style={{ ...s.reportIconContainer, backgroundColor: `${report.color}15`, borderColor: `${report.color}25` }}>
                <i className={report.icon} style={{ fontSize: 32, color: report.color }} />
              </div>
              <div style={s.reportContent}>
                <h3 style={s.reportTitle}>{report.title}</h3>
                <div style={s.reportValue}>
  ₹{report.total.toLocaleString('en-IN')}
</div>
                <div style={s.reportCount}>{report.count} items</div>
              </div>
            </div>
          ))}
        </div>

        {/* Financial Summary */}
        <div style={s.financialSummary}>
          <h2 style={s.sectionTitle}>Financial Summary</h2>
          <div style={s.financialGrid}>
            <div style={s.financialCard}>
              <div style={s.financialHeader}>
                <i className="ti ti-arrow-up" style={{ fontSize: 24, color: '#22C55E' }} />
                <h3 style={s.financialTitle}>Total Revenue</h3>
              </div>
              <div style={s.financialValue}>
                ₹{(reports.find(r => r.title === 'Trip Summary')?.total || 0).toLocaleString('en-IN')}
              </div>
            </div>

            <div style={s.financialCard}>
              <div style={s.financialHeader}>
                <i className="ti ti-arrow-down" style={{ fontSize: 24, color: '#EF4444' }} />
                <h3 style={s.financialTitle}>Total Expenses</h3>
              </div>
              <div style={s.financialValue}>
                ₹{(reports.find(r => r.title === 'Total Expenses')?.total || 0).toLocaleString('en-IN')}
              </div>
            </div>

            <div style={s.financialCard}>
              <div style={s.financialHeader}>
                <i className="ti ti-wallet" style={{ fontSize: 24, color: '#3B82F6' }} />
                <h3 style={s.financialTitle}>Net Profit</h3>
              </div>
              <div style={s.financialValue}>
                ₹{(
  (reports.find(r => r.title === 'Trip Summary')?.total || 0) -
  (reports.find(r => r.title === 'Total Expenses')?.total || 0)
).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
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
  shell: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: 28,
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 32,
  },
  headerSub: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.4)', margin: '0 0 6px',
  },
  headerTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: -0.5,
  },
  reportsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 20,
    marginBottom: 32,
  },
  reportCard: {
    background: '#fff',
    border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 18,
    padding: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    transition: 'all 0.2s',
    ':hover': {
      boxShadow: '0 4px 16px rgba(20,20,30,0.1)',
      transform: 'translateY(-2px)',
    },
  },
  reportIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportContent: {
    flex: 1,
  },
  reportTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 16, fontWeight: 600, color: '#1A1A1F', margin: '0 0 8px',
  },
  reportValue: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 24, fontWeight: 700, color: '#1A1A1F', margin: '0 0 4px',
  },
  reportCount: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 13, color: 'rgba(20,20,30,0.45)',
  },
  financialSummary: {
    marginTop: 32,
  },
  sectionTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 20, fontWeight: 600, color: '#1A1A1F', marginBottom: 20,
  },
  financialGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 20,
  },
  financialCard: {
    background: '#fff',
    border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 18,
    padding: 24,
  },
  financialHeader: {
    display: 'flex', alignItems: 'center', gap: 12,
    marginBottom: 16,
  },
  financialTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 16, fontWeight: 600, color: '#1A1A1F', margin: 0,
  },
  financialValue: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 28, fontWeight: 700, color: '#1A1A1F',
  },
};