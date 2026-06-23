'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../../components/dashboard/layout';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount || 0);

export default function AdvancesPage({ user, onLogout }) {
  const [advances, setAdvances] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    driverId: '',
    amount: '',
    reason: '',
  });

  const [summary, setSummary] = useState({
    totalPending: 0,
    totalApproved: 0,
    totalPaid: 0,
  });

  const fetchAdvances = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { setAdvances([]); setLoading(false); return; }

      const { data, error } = await supabase
        .from('advance_requests')
        .select('id, driver_id, amount, reason, status, requested_date, paid_date')
        .eq('owner_id', authUser.id)
        .order('created_at', { ascending: false });

      if (error) console.error('Error fetching advances:', error);
      else {
        setAdvances(data || []);
        calculateSummary(data || []);
      }
    } catch (error) {
      console.error('Error fetching advances:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDrivers = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { setDrivers([]); return; }

      const { data, error } = await supabase
        .from('drivers')
        .select('id, name')
        .eq('owner_id', authUser.id)
        .eq('status', 'Active');

      if (error) console.error('Error fetching drivers:', error);
      else setDrivers(data || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  }, []);

  useEffect(() => {
    fetchAdvances();
    fetchDrivers();
  }, [fetchAdvances, fetchDrivers]);

  const calculateSummary = (advancesData) => {
    const totalPending = advancesData.filter(a => a.status === 'pending').reduce((sum, a) => sum + (a.amount || 0), 0);
    const totalApproved = advancesData.filter(a => a.status === 'approved').reduce((sum, a) => sum + (a.amount || 0), 0);
    const totalPaid = advancesData.filter(a => a.status === 'paid').reduce((sum, a) => sum + (a.amount || 0), 0);
    setSummary({ totalPending, totalApproved, totalPaid });
  };

  const saveAdvance = async () => {
    if (!formData.driverId || !formData.amount || !formData.reason) {
      alert('Please fill all required fields');
      return;
    }

    const parsedAmount = parseFloat(formData.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid positive amount');
      return;
    }

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { alert('Not authenticated. Please login again.'); return; }

      const { error } = await supabase.from('advance_requests').insert([{
        owner_id: authUser.id,
        driver_id: formData.driverId,
        amount: parsedAmount,
        reason: formData.reason,
        status: 'pending',
      }]);

      if (error) { alert(error.message); return; }

      setFormData({ driverId: '', amount: '', reason: '' });
      setShowForm(false);
      fetchAdvances();
      alert('Advance request created successfully');
    } catch (error) {
      console.error('Error creating advance:', error);
      alert('Failed to create advance request. Please try again.');
    }
  };

  const updateAdvanceStatus = async (id, newStatus) => {
    try {
      const updateData = { status: newStatus };
      if (newStatus === 'paid') updateData.paid_date = new Date().toISOString();

      const { error } = await supabase.from('advance_requests').update(updateData).eq('id', id);
      if (error) { alert(error.message); return; }

      fetchAdvances();
    } catch (error) {
      console.error('Error updating advance status:', error);
      alert('Failed to update advance request. Please try again.');
    }
  };

  const deleteAdvance = async (id) => {
    if (!confirm('Are you sure you want to delete this advance request?')) return;

    try {
      const { error } = await supabase.from('advance_requests').delete().eq('id', id);
      if (error) { alert(error.message); return; }
      fetchAdvances();
    } catch (error) {
      console.error('Error deleting advance:', error);
      alert('Failed to delete advance request. Please try again.');
    }
  };

  const getDriverName = (id) => {
    const driver = drivers.find(d => d.id === id);
    return driver ? driver.name : 'Unknown';
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
      <div style={s.root}>
        <div style={s.center}>
          <div style={s.spinnerRing}><div style={s.spinner} /></div>
          <p style={s.muted}>Loading advances...</p>
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
            <h1 style={s.headerTitle}>Advance Requests</h1>
          </div>
          <button onClick={() => setShowForm(true)} style={s.primaryBtn}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Advance Request
          </button>
        </div>

        {/* Summary Cards */}
        <div style={s.summaryGrid}>
          <div style={s.summaryCard}>
            <div style={s.summaryIcon}>
              <i className="ti ti-clock" style={{ fontSize: 24, color: '#FB923C' }} />
            </div>
            <div>
              <p style={s.summaryLabel}>Total Pending</p>
              <h3 style={s.summaryValue}>{formatCurrency(summary.totalPending)}</h3>
            </div>
          </div>
          <div style={s.summaryCard}>
            <div style={s.summaryIcon}>
              <i className="ti ti-check" style={{ fontSize: 24, color: '#3B82F6' }} />
            </div>
            <div>
              <p style={s.summaryLabel}>Total Approved</p>
              <h3 style={s.summaryValue}>{formatCurrency(summary.totalApproved)}</h3>
            </div>
          </div>
          <div style={s.summaryCard}>
            <div style={s.summaryIcon}>
              <i className="ti ti-wallet" style={{ fontSize: 24, color: '#22C55E' }} />
            </div>
            <div>
              <p style={s.summaryLabel}>Total Paid</p>
              <h3 style={s.summaryValue}>{formatCurrency(summary.totalPaid)}</h3>
            </div>
          </div>
        </div>

        {/* Add Form */}
        {showForm && (
          <div style={s.formCard}>
            <div style={s.shimmer} />
            <h3 style={s.formTitle}>Add Advance Request</h3>
            <div style={s.formGrid}>
              <div style={s.formField}>
                <label style={s.label}>Driver</label>
                <select
                  value={formData.driverId}
                  onChange={(e) => setFormData({...formData, driverId: e.target.value})}
                  style={s.input}
                >
                  <option value="">Select Driver</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>{driver.name}</option>
                  ))}
                </select>
              </div>

              <div style={s.formField}>
                <label style={s.label}>Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 1000"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  style={s.input}
                />
              </div>

              <div style={{ ...s.formField, gridColumn: 'span 2' }}>
                <label style={s.label}>Reason</label>
                <textarea
                  placeholder="e.g. Emergency medical expense"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  style={{ ...s.input, minHeight: 80, resize: 'vertical' }}
                />
              </div>
            </div>
            <div style={s.formActions}>
              <button onClick={saveAdvance} style={s.saveBtn}>Save Advance Request</button>
              <button onClick={() => setShowForm(false)} style={s.cancelBtn}>Cancel</button>
            </div>
          </div>
        )}

        {/* Table */}
        {advances.length === 0 ? (
          <div style={s.empty}>No advance requests found</div>
        ) : (
          <div style={s.tableCard}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Driver</th>
                  <th style={s.th}>Amount</th>
                  <th style={s.th}>Reason</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Requested</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {advances.map((advance) => (
                  <tr key={advance.id} style={s.tr}>
                    <td style={s.td}>{getDriverName(advance.driver_id)}</td>
                    <td style={s.td}>{formatCurrency(advance.amount)}</td>
                    <td style={s.td}>{advance.reason}</td>
                    <td style={s.td}>
                      <select
                        value={advance.status}
                        onChange={(e) => updateAdvanceStatus(advance.id, e.target.value)}
                        style={{ ...s.statusSelect, ...getStatusStyle(advance.status) }}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="paid">Paid</option>
                      </select>
                    </td>
                    <td style={s.td}>{new Date(advance.requested_date).toLocaleDateString()}</td>
                    <td style={s.td}>
                      <button onClick={() => deleteAdvance(advance.id)} style={s.deleteBtn}>
                        Delete
                      </button>
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
  root: { fontFamily: "'Outfit', sans-serif", background: '#F7F7FA', minHeight: '100vh', color: '#1A1A1F' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16 },
  spinnerRing: { width: 56, height: 56, borderRadius: '50%', border: '1px solid rgba(124,99,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  spinner: { width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(124,99,255,0.1)', borderTop: '2px solid #7C63FF', animation: 'spin 0.8s linear infinite' },
  muted: { fontFamily: "'Space Grotesk', sans-serif", color: 'rgba(20,20,30,0.45)', fontSize: 13 },
  shell: { maxWidth: 1200, margin: '0 auto', padding: 28, boxSizing: 'border-box' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 },
  headerSub: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(20,20,30,0.4)', margin: '0 0 6px' },
  headerTitle: { fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: -0.5 },
  primaryBtn: { display: 'flex', alignItems: 'center', gap: 6, background: '#7C63FF', color: '#fff', border: 'none', padding: '11px 20px', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: "'Outfit', sans-serif", boxShadow: '0 8px 20px rgba(124,99,255,0.25)' },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 },
  summaryCard: { background: '#fff', border: '1px solid rgba(20,20,30,0.07)', borderRadius: 18, padding: 20, display: 'flex', alignItems: 'center', gap: 16 },
  summaryIcon: { width: 48, height: 48, borderRadius: 12, background: 'rgba(124,99,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  summaryLabel: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(20,20,30,0.4)', margin: '0 0 6px' },
  summaryValue: { fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 700, margin: 0, color: '#1A1A1F' },
  formCard: { background: '#fff', border: '1px solid rgba(20,20,30,0.07)', borderRadius: 18, padding: 24, marginBottom: 20, position: 'relative', overflow: 'hidden', boxSizing: 'border-box' },
  shimmer: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(124,99,255,0.4), transparent)' },
  formTitle: { fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 600, margin: '0 0 18px' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 20 },
  formField: { marginBottom: 14 },
  label: { display: 'block', fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(20,20,30,0.4)', marginBottom: 8 },
  input: { width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(20,20,30,0.1)', background: '#F7F7FA', fontSize: 14, fontFamily: "'Outfit', sans-serif", color: '#1A1A1F', boxSizing: 'border-box', transition: 'all 0.15s' },
  formActions: { display: 'flex', gap: 10, marginTop: 6 },
  saveBtn: { background: '#22C55E', color: '#fff', border: 'none', padding: '11px 22px', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: "'Outfit', sans-serif" },
  cancelBtn: { background: '#fff', color: 'rgba(20,20,30,0.5)', border: '1px solid rgba(20,20,30,0.1)', padding: '11px 22px', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: "'Outfit', sans-serif" },
  empty: { background: '#fff', border: '1px solid rgba(20,20,30,0.07)', borderRadius: 18, padding: '40px 0', textAlign: 'center', fontFamily: "'Space Grotesk', sans-serif", color: 'rgba(20,20,30,0.35)', fontSize: 13 },
  tableCard: { background: '#fff', border: '1px solid rgba(20,20,30,0.07)', borderRadius: 18, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '14px 20px', fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(20,20,30,0.4)', borderBottom: '1px solid rgba(20,20,30,0.07)' },
  tr: { borderBottom: '1px solid rgba(20,20,30,0.05)' },
  td: { padding: '14px 20px', fontSize: 14, fontFamily: "'Outfit', sans-serif" },
  statusSelect: { border: 'none', borderRadius: 20, padding: '4px 28px 4px 12px', fontSize: 12, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", cursor: 'pointer', appearance: 'none', lineHeight: '20px', textAlign: 'center', backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' },
  deleteBtn: { background: 'rgba(224,82,74,0.1)', border: '1px solid rgba(224,82,74,0.25)', color: '#E0524A', padding: '7px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: "'Outfit', sans-serif" },
};