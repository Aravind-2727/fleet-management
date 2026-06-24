'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../lib/currency';
import { useAuth } from '../../lib/AuthContext';
import { withRoleProtection } from '../../lib/withRoleProtection';
import DashboardLayout from '../../dashboard/layout';
function DriverExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [trips, setTrips] = useState([]);
  const [driverId, setDriverId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    tripId: '',
    category: 'Fuel',
    amount: '',
    notes: '',
  });

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

      const [expensesRes, tripsRes] = await Promise.all([
        supabase
          .from('trip_expenses')
          .select('id, trip_id, category, amount, paid_by, status, expense_date, notes, created_at')
          .eq('driver_id', driver.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('trips')
          .select('id, origin, destination, status')
          .eq('driver_id', driver.id)
          .neq('status', 'delivered')
          .neq('status', 'pending_settlement'),
      ]);

      if (!expensesRes.error) setExpenses(expensesRes.data || []);
      if (!tripsRes.error) setTrips(tripsRes.data || []);
    } catch (error) {
      console.error('Error fetching driver data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveExpense = async () => {
    if (!formData.tripId || !formData.amount) {
      alert('Please fill all required fields');
      return;
    }

    const parsedAmount = parseFloat(formData.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid positive amount');
      return;
    }

    try {
      const { error } = await supabase.from('trip_expenses').insert([{
        owner_id: user.id,
        trip_id: formData.tripId,
        driver_id: driverId,
        category: formData.category,
        amount: parsedAmount,
        paid_by: 'driver_paid',
        status: 'pending',
        notes: formData.notes,
      }]);

      if (error) {
        alert(error.message);
        return;
      }

      setFormData({ tripId: '', category: 'Fuel', amount: '', notes: '' });
      setShowForm(false);
      fetchDriverData();
    } catch (error) {
      console.error('Error creating expense:', error);
      alert('Failed to submit expense. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FB923C';
      case 'paid': return '#3B82F6';
      case 'approved': return '#22C55E';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
        <DashboardLayout>
      <div style={s.root}>
        <div style={s.center}>
          <div style={s.spinnerRing}><div style={s.spinner} /></div>
          <p style={s.muted}>Loading expenses...</p>
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
          <h1 style={s.headerTitle}>My Expenses</h1>
        </div>
        <button onClick={() => setShowForm(true)} style={s.primaryBtn}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Expense
        </button>
      </div>

      {showForm && (
        <div style={s.formCard}>
          <div style={s.shimmer} />
          <h3 style={s.formTitle}>Submit Expense</h3>

          <div style={s.formGrid}>
            <div style={s.formField}>
              <label style={s.label}>Trip</label>
              <select
                value={formData.tripId}
                onChange={(e) => setFormData({ ...formData, tripId: e.target.value })}
                style={s.input}
              >
                <option value="">Select Trip</option>
                {trips.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.origin} → {trip.destination}
                  </option>
                ))}
              </select>
            </div>

            <div style={s.formField}>
              <label style={s.label}>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={s.input}
              >
                <option value="Fuel">Fuel</option>
                <option value="Toll">Toll</option>
                <option value="Food">Food</option>
                <option value="Repair">Repair</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={s.formField}>
              <label style={s.label}>Amount (₹)</label>
              <input
                type="number"
                placeholder="e.g. 500"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                style={s.input}
              />
            </div>

            <div style={s.formField}>
              <label style={s.label}>Notes</label>
              <input
                placeholder="Optional notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                style={s.input}
              />
            </div>
          </div>

          <div style={s.formActions}>
            <button onClick={saveExpense} style={s.saveBtn}>Submit Expense</button>
            <button onClick={() => setShowForm(false)} style={s.cancelBtn}>Cancel</button>
          </div>
        </div>
      )}

      {expenses.length === 0 ? (
        <div style={s.empty}>No expenses submitted yet</div>
      ) : (
        <div style={s.tableCard}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Trip</th>
                <th style={s.th}>Category</th>
                <th style={s.th}>Amount</th>
                <th style={s.th}>Paid By</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} style={s.tr}>
                  <td style={s.td}>
                    {trips.find(t => t.id === expense.trip_id)
                      ? `${trips.find(t => t.id === expense.trip_id).origin} → ${trips.find(t => t.id === expense.trip_id).destination}`
                      : 'Unknown'}
                  </td>
                  <td style={s.td}>{expense.category}</td>
                  <td style={s.td}>{formatCurrency(expense.amount || 0)}</td>
                  <td style={s.td}>
                    <span style={{
                      ...s.paidByBadge,
                      backgroundColor: '#22C55E15',
                      color: '#16A34A',
                    }}>
                      Driver Paid
                    </span>
                  </td>
                  <td style={s.td}>
                    <span style={{
                      ...s.statusBadge,
                      backgroundColor: `${getStatusColor(expense.status)}15`,
                      color: getStatusColor(expense.status),
                    }}>
                      {expense.status}
                    </span>
                  </td>
                  <td style={s.td}>
                    {expense.expense_date
                      ? new Date(expense.expense_date).toLocaleDateString()
                      : new Date(expense.created_at).toLocaleDateString()}
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
  paidByBadge: {
    display: 'inline-block', padding: '4px 12px', borderRadius: 20,
    fontSize: 12, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif",
    whiteSpace: 'nowrap',
  },
};

export default withRoleProtection(DriverExpenses, '/driver/expenses');
