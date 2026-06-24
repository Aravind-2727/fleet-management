'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/currency';
import DashboardLayout from '../../components/dashboard/layout';
import Modal from '../../components/common/Modal';

export default function PaymentsPage({ user, onLogout }) {
  const [payments, setPayments] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    driverId: '',
    tripId: '',
    amount: '',
    mode: 'cash',
    notes: '',
  });

  const [summary, setSummary] = useState({
    totalDriverPayments: 0,
    totalCustomerReceipts: 0,
    totalPayments: 0,
  });

  useEffect(() => {
    fetchPayments();
    fetchDrivers();
    fetchTrips();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { setPayments([]); setLoading(false); return; }

      const { data, error } = await supabase
        .from('payments')
        .select('id, driver_id, trip_id, amount, mode, payment_date, notes')
        .eq('owner_id', authUser.id)
        .order('payment_date', { ascending: false });

      if (error) console.error('Error fetching payments:', error);
      else {
        setPayments(data || []);
        calculateSummary(data || []);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      const { data, error } = await supabase
        .from('drivers')
        .select('id, name')
        .eq('owner_id', authUser.id);
      if (error) console.error('Error fetching drivers:', error);
      else setDrivers(data || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchTrips = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      const { data, error } = await supabase
        .from('trips')
        .select('id, origin, destination, customer')
        .eq('owner_id', authUser.id);
      if (error) console.error('Error fetching trips:', error);
      else setTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

  const calculateSummary = (paymentsData) => {
    const totalDriverPayments = paymentsData
      .filter(p => p.driver_id)
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalCustomerReceipts = paymentsData
      .filter(p => p.trip_id)
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPayments = paymentsData
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    setSummary({ totalDriverPayments, totalCustomerReceipts, totalPayments });
  };

  const savePayment = async () => {
    if (!formData.amount) { alert('Please enter an amount'); return; }

    const parsedAmount = parseFloat(formData.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid positive amount');
      return;
    }

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { alert('Not authenticated. Please login again.'); return; }

      const paymentData = {
        owner_id: authUser.id,
        amount: parsedAmount,
        mode: formData.mode,
        payment_date: new Date().toISOString(),
        notes: formData.notes,
      };

      if (formData.driverId) paymentData.driver_id = formData.driverId;
      if (formData.tripId) paymentData.trip_id = formData.tripId;

      const { error } = await supabase.from('payments').insert([paymentData]);
      if (error) { alert(error.message); return; }

      setFormData({ driverId: '', tripId: '', amount: '', mode: 'cash', notes: '' });
      setShowForm(false);
      fetchPayments();
      alert('Payment recorded successfully');
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Failed to record payment. Please try again.');
    }
  };

  const deletePayment = async (id) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;
    try {
      const { error } = await supabase.from('payments').delete().eq('id', id);
      if (error) { alert(error.message); return; }
      fetchPayments();
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Failed to delete payment. Please try again.');
    }
  };

  const getDriverName = (id) => {
    const driver = drivers.find(d => d.id === id);
    return driver ? driver.name : 'Unknown';
  };

  const getTripInfo = (id) => {
    const trip = trips.find(t => t.id === id);
    return trip ? `${trip.origin} → ${trip.destination} (${trip.customer})` : 'Unknown';
  };

  const getModeBadge = (mode) => {
    switch (mode) {
      case 'cash':          return { text: 'Cash', color: '#16A34A', bg: '#16A34A15' };
      case 'upi':           return { text: 'UPI', color: '#3B82F6', bg: '#3B82F615' };
      case 'bank_transfer': return { text: 'Bank Transfer', color: '#8B5CF6', bg: '#8B5CF615' };
      default:              return { text: mode || 'Other', color: '#6B7280', bg: '#6B728015' };
    }
  };

  if (loading) {
    return (
      <div style={s.root}>
        <div style={s.center}>
          <div style={s.spinnerRing}><div style={s.spinner} /></div>
          <p style={s.muted}>Loading payments...</p>
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
            <h1 style={s.headerTitle}>Payments Management</h1>
          </div>
          <button onClick={() => setShowForm(true)} style={s.primaryBtn}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Record Payment
          </button>
        </div>

        {/* Summary Cards */}
        <div style={s.summaryGrid}>
          <div style={s.summaryCard}>
            <div style={s.summaryIcon}>
              <i className="ti ti-wallet" style={{ fontSize: 24, color: '#22C55E' }} />
            </div>
            <div>
              <p style={s.summaryLabel}>Total Driver Payments</p>
              <h3 style={s.summaryValue}>{formatCurrency(summary.totalDriverPayments)}</h3>
            </div>
          </div>
          <div style={s.summaryCard}>
            <div style={s.summaryIcon}>
              <i className="ti ti-building-bank" style={{ fontSize: 24, color: '#3B82F6' }} />
            </div>
            <div>
              <p style={s.summaryLabel}>Total Customer Receipts</p>
              <h3 style={s.summaryValue}>{formatCurrency(summary.totalCustomerReceipts)}</h3>
            </div>
          </div>
          <div style={s.summaryCard}>
            <div style={s.summaryIcon}>
              <i className="ti ti-money" style={{ fontSize: 24, color: '#7C63FF' }} />
            </div>
            <div>
              <p style={s.summaryLabel}>Total Payments</p>
              <h3 style={s.summaryValue}>{formatCurrency(summary.totalPayments)}</h3>
            </div>
          </div>
        </div>

        {/* Add Form */}
        <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
          <div style={s.formCard}>
            <div style={s.shimmer} />
            <h3 style={s.formTitle}>Record New Payment</h3>
            <div style={s.formGrid}>
              <div style={s.formField}>
                <label style={s.label}>Payment Mode</label>
                <select
                  value={formData.mode}
                  onChange={(e) => setFormData({...formData, mode: e.target.value})}
                  style={s.input}
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="other">Other</option>
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

              <div style={s.formField}>
                <label style={s.label}>Driver (optional)</label>
                <select
                  value={formData.driverId}
                  onChange={(e) => setFormData({...formData, driverId: e.target.value})}
                  style={s.input}
                >
                  <option value="">Select Driver</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>{driver.name}</option>
                  ))}
                </select>
              </div>

              <div style={s.formField}>
                <label style={s.label}>Trip (optional)</label>
                <select
                  value={formData.tripId}
                  onChange={(e) => setFormData({...formData, tripId: e.target.value})}
                  style={s.input}
                >
                  <option value="">Select Trip</option>
                  {trips.map(trip => (
                    <option key={trip.id} value={trip.id}>
                      {trip.origin} → {trip.destination} ({trip.customer})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ ...s.formField, gridColumn: 'span 2' }}>
                <label style={s.label}>Notes</label>
                <textarea
                  placeholder="Optional notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  style={{ ...s.input, minHeight: 80, resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={s.formActions}>
              <button onClick={savePayment} style={s.saveBtn}>Record Payment</button>
              <button onClick={() => setShowForm(false)} style={s.cancelBtn}>Cancel</button>
            </div>
          </div>
        </Modal>

        {/* Table */}
        {payments.length === 0 ? (
          <div style={s.empty}>No payments found</div>
        ) : (
          <div style={s.tableCard}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Reference</th>
                  <th style={s.th}>Amount</th>
                  <th style={s.th}>Mode</th>
                  <th style={s.th}>Date</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} style={s.tr}>
                    <td style={s.td}>
                      {payment.driver_id
                        ? getDriverName(payment.driver_id)
                        : payment.trip_id
                        ? getTripInfo(payment.trip_id)
                        : '—'}
                    </td>
                    <td style={s.td}>{formatCurrency(payment.amount || 0)}</td>
                    <td style={s.td}>
                      <span style={{
                        ...s.badge,
                        backgroundColor: getModeBadge(payment.mode).bg,
                        color: getModeBadge(payment.mode).color,
                      }}>
                        {getModeBadge(payment.mode).text}
                      </span>
                    </td>
                    <td style={s.td}>{new Date(payment.payment_date).toLocaleDateString()}</td>
                    <td style={s.td}>
                      <button onClick={() => deletePayment(payment.id)} style={s.deleteBtn}>
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
  shell: { maxWidth: 1200, margin: '0 auto', padding: 20, boxSizing: 'border-box' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  headerSub: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(20,20,30,0.4)', margin: '0 0 6px' },
  headerTitle: { fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: -0.5 },
  primaryBtn: { display: 'flex', alignItems: 'center', gap: 6, background: '#7C63FF', color: '#fff', border: 'none', padding: '11px 20px', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: "'Outfit', sans-serif", boxShadow: '0 8px 20px rgba(124,99,255,0.25)', whiteSpace: 'nowrap', minHeight: 44 },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 },
  summaryCard: { background: '#fff', border: '1px solid rgba(20,20,30,0.07)', borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 14 },
  summaryIcon: { width: 44, height: 44, borderRadius: 12, background: 'rgba(124,99,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  summaryLabel: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(20,20,30,0.4)', margin: '0 0 4px' },
  summaryValue: { fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, margin: 0, color: '#1A1A1F' },
  formCard: { background: '#fff', border: '1px solid rgba(20,20,30,0.07)', borderRadius: 18, padding: 20, marginBottom: 20, position: 'relative', overflow: 'hidden', boxSizing: 'border-box' },
  shimmer: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(124,99,255,0.4), transparent)' },
  formTitle: { fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 600, margin: '0 0 16px' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 14, marginBottom: 20 },
  formField: { marginBottom: 14 },
  label: { display: 'block', fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(20,20,30,0.4)', marginBottom: 8 },
  input: { width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(20,20,30,0.1)', background: '#F7F7FA', fontSize: 14, fontFamily: "'Outfit', sans-serif", color: '#1A1A1F', boxSizing: 'border-box', transition: 'all 0.15s', minHeight: 44 },
  formActions: { display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap' },
  saveBtn: { background: '#22C55E', color: '#fff', border: 'none', padding: '11px 22px', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: "'Outfit', sans-serif", minHeight: 44 },
  cancelBtn: { background: '#fff', color: 'rgba(20,20,30,0.5)', border: '1px solid rgba(20,20,30,0.1)', padding: '11px 22px', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: "'Outfit', sans-serif", minHeight: 44 },
  empty: { background: '#fff', border: '1px solid rgba(20,20,30,0.07)', borderRadius: 18, padding: '40px 0', textAlign: 'center', fontFamily: "'Space Grotesk', sans-serif", color: 'rgba(20,20,30,0.35)', fontSize: 13 },
  tableCard: { background: '#fff', border: '1px solid rgba(20,20,30,0.07)', borderRadius: 18, overflow: 'auto', WebkitOverflowScrolling: 'touch' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 600 },
  th: { textAlign: 'left', padding: '12px 16px', fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(20,20,30,0.4)', borderBottom: '1px solid rgba(20,20,30,0.07)', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid rgba(20,20,30,0.05)' },
  td: { padding: '12px 16px', fontSize: 14, fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap' },
  badge: { display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", whiteSpace: 'nowrap' },
  deleteBtn: { background: 'rgba(224,82,74,0.1)', border: '1px solid rgba(224,82,74,0.25)', color: '#E0524A', padding: '7px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: "'Outfit', sans-serif", minHeight: 34 },
};