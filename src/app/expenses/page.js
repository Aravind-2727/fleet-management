'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../../components/dashboard/layout';

export default function ExpensesPage({ user, onLogout }) {
  const [expenses, setExpenses] = useState([]);
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [tripId, setTripId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [category, setCategory] = useState('Fuel');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('driver_paid');
  const [notes, setNotes] = useState('');

  const [summary, setSummary] = useState({
    total: 0,
    driverPaid: 0,
    companyPaid: 0,
    pending: 0
  });

  useEffect(() => {
    fetchExpenses();
    fetchTrips();
    fetchDrivers();
  }, []);

  const saveExpense = async () => {
    if (!tripId || !driverId || !amount) {
      alert('Please fill all required fields');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid positive amount');
      return;
    }

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      alert('Not authenticated. Please login again.');
      return;
    }

    setFormLoading(true);
    const { error } = await supabase
      .from('trip_expenses')
      .insert([
        {
          owner_id: authUser.id,
          trip_id: tripId,
          driver_id: driverId,
          category: category,
          amount: parsedAmount,
          paid_by: paidBy,
          status: 'pending',
          notes: notes,
        },
      ]);

    if (error) {
      console.error(error);
      alert(error.message);
      setFormLoading(false);
      return;
    }

    setTripId('');
    setDriverId('');
    setCategory('Fuel');
    setAmount('');
    setPaidBy('driver_paid');
    setNotes('');
    setShowForm(false);

    fetchExpenses();
    setFormLoading(false);

    alert('Expense added successfully');
  };

  const updateExpenseStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('trip_expenses')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchExpenses();
  };

  const deleteExpense = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      alert('Not authenticated. Please login again.');
      return;
    }

    // Verify ownership before delete
    const { data: expense, error: fetchError } = await supabase
      .from('trip_expenses')
      .select('owner_id')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !expense) {
      alert('Expense not found');
      return;
    }

    if (expense.owner_id !== authUser.id) {
      alert('Unauthorized to delete this expense');
      return;
    }

    const { error } = await supabase
      .from('trip_expenses')
      .delete()
      .eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchExpenses();
  };

  const fetchExpenses = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('trip_expenses')
      .select('*')
      .eq('owner_id', authUser.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setExpenses(data || []);
      calculateSummary(data || []);
    }

    setLoading(false);
  };

  const calculateSummary = (expensesData) => {
    const total = expensesData.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const driverPaid = expensesData
      .filter(expense => expense.paid_by === 'driver_paid')
      .reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const companyPaid = expensesData
      .filter(expense => expense.paid_by === 'company_paid')
      .reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const pending = expensesData
      .filter(expense => expense.status === 'pending')
      .reduce((sum, expense) => sum + (expense.amount || 0), 0);

    setSummary({
      total,
      driverPaid,
      companyPaid,
      pending
    });
  };

  const fetchTrips = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      setTrips([]);
      return;
    }

    const { data, error } = await supabase
      .from('trips')
      .select('id, customer')
      .eq('owner_id', authUser.id);

    if (error) {
      console.error('Error fetching trips:', error);
    } else {
      setTrips(data || []);
    }
  };

  const fetchDrivers = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      setDrivers([]);
      return;
    }

    const { data, error } = await supabase
      .from('drivers')
      .select('id, profile_id, profiles(name)')
      .eq('owner_id', authUser.id);

    if (error) {
      console.error('Error fetching drivers:', error);
    } else {
      setDrivers(data || []);
    }
  };

  if (loading) {
    return (
      <div style={s.root}>
        <div style={s.center}>
          <div style={s.spinnerRing}><div style={s.spinner} /></div>
          <p style={s.muted}>Loading expenses...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return s.statusPending.background;
      case 'paid':
        return s.statusPaid.background;
      case 'approved':
        return s.statusApproved.background;
      default:
        return s.statusDefault.background;
    }
  };

  const validateForm = () => {
    const amount = parseFloat(amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid positive amount');
      return false;
    }
    return true;
  };

  const getTripCustomer = (id) => {
    const trip = trips.find(t => t.id === id);
    return trip ? trip.customer : 'Unknown';
  };

  const getDriverName = (id) => {
    const driver = drivers.find(d => d.id === id);
    return driver ? driver.profiles?.name : 'Unknown';
  };

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div style={s.shell}>

        {/* ── HEADER ── */}
        <div style={s.header}>
          <div>
            <p style={s.headerSub}>Fleet</p>
            <h1 style={s.headerTitle}>Expenses Management</h1>
          </div>

          <button onClick={() => setShowForm(true)} style={s.primaryBtn}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Expense
          </button>
        </div>

        {/* ── SUMMARY CARDS ── */}
        <div style={s.summaryGrid}>
          <div style={s.summaryCard}>
            <div style={s.summaryIcon}>
              <i className="ti ti-receipt" style={{ fontSize: 24, color: '#7C63FF' }} />
            </div>
            <div>
              <p style={s.summaryLabel}>Total Expenses</p>
              <h3 style={s.summaryValue}>${summary.total.toLocaleString()}</h3>
            </div>
          </div>

          <div style={s.summaryCard}>
            <div style={s.summaryIcon}>
              <i className="ti ti-wallet" style={{ fontSize: 24, color: '#22C55E' }} />
            </div>
            <div>
              <p style={s.summaryLabel}>Driver Paid</p>
              <h3 style={s.summaryValue}>${summary.driverPaid.toLocaleString()}</h3>
            </div>
          </div>

          <div style={s.summaryCard}>
            <div style={s.summaryIcon}>
              <i className="ti ti-building-bank" style={{ fontSize: 24, color: '#3B82F6' }} />
            </div>
            <div>
              <p style={s.summaryLabel}>Company Paid</p>
              <h3 style={s.summaryValue}>${summary.companyPaid.toLocaleString()}</h3>
            </div>
          </div>

          <div style={s.summaryCard}>
            <div style={s.summaryIcon}>
              <i className="ti ti-clock" style={{ fontSize: 24, color: '#FB923C' }} />
            </div>
            <div>
              <p style={s.summaryLabel}>Pending</p>
              <h3 style={s.summaryValue}>${summary.pending.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* ── ADD FORM ── */}
        {showForm && (
          <div style={s.formCard}>
            <div style={s.shimmer} />
            <h3 style={s.formTitle}>Add New Expense</h3>

            <div style={s.field}>
              <label style={s.label}>Trip</label>
              <select
                value={tripId}
                onChange={(e) => setTripId(e.target.value)}
                style={s.input}
              >
                <option value="">Select Trip</option>
                {trips.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.customer}
                  </option>
                ))}
              </select>
            </div>

            <div style={s.field}>
              <label style={s.label}>Driver</label>
              <select
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                style={s.input}
              >
                <option value="">Select Driver</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.profiles?.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={s.field}>
              <label style={s.label}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
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

            <div style={s.field}>
              <label style={s.label}>Amount ($)</label>
              <input
                type="number"
                placeholder="e.g. 150"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={s.input}
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Paid By</label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                style={s.input}
              >
                <option value="driver_paid">Driver Paid</option>
                <option value="company_paid">Company Paid</option>
              </select>
            </div>

            <div style={s.field}>
              <label style={s.label}>Notes</label>
              <input
                placeholder="e.g. Gas for trip to LA"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={s.input}
              />
            </div>

            <div style={s.formActions}>
              <button onClick={saveExpense} style={s.saveBtn} disabled={formLoading}>
                {formLoading ? 'Adding...' : 'Add Expense'}
              </button>
              <button onClick={() => setShowForm(false)} style={s.cancelBtn} disabled={formLoading}>Cancel</button>
            </div>
          </div>
        )}

        {/* ── TABLE ── */}
        {expenses.length === 0 ? (
          <div style={s.empty}>No expenses found</div>
        ) : (
          <div style={s.tableCard}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Trip</th>
                  <th style={s.th}>Driver</th>
                  <th style={s.th}>Category</th>
                  <th style={s.th}>Amount</th>
                  <th style={s.th}>Paid By</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} style={s.tr}>
                    <td style={s.td}>{getTripCustomer(expense.trip_id)}</td>
                    <td style={s.td}>{getDriverName(expense.driver_id)}</td>
                    <td style={s.td}>{expense.category}</td>
                    <td style={s.td}>${(expense.amount || 0).toLocaleString()}</td>
                    <td style={s.td}>
                      <span style={expense.paid_by === 'driver_paid' ? s.paidByDriver : s.paidByCompany}>
                        {expense.paid_by === 'driver_paid' ? 'Driver' : 'Company'}
                      </span>
                    </td>
                    <td style={s.td}>
                      <select
                        value={expense.status}
                        onChange={(e) => updateExpenseStatus(expense.id, e.target.value)}
                        style={{ ...s.statusSelect, backgroundColor: getStatusColor(expense.status) }}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="approved">Approved</option>
                      </select>
                    </td>
                    <td style={{ ...s.td, textAlign: 'right' }}>
                      <button onClick={() => deleteExpense(expense.id)} style={s.deleteBtn}>
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

function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
      @keyframes spin { to { transform: rotate(360deg); } }
      input::placeholder { color: rgba(20,20,30,0.3); }
      input:focus { outline: none; border-color: rgba(124,99,255,0.4) !important; box-shadow: 0 0 0 3px rgba(124,99,255,0.1); }
      select:focus { outline: none; border-color: rgba(124,99,255,0.4) !important; box-shadow: 0 0 0 3px rgba(124,99,255,0.1); }
      ::-webkit-scrollbar { width: 8px; height: 8px; }
      ::-webkit-scrollbar-thumb { background: rgba(20,20,30,0.1); border-radius: 8px; }
      ::-webkit-scrollbar-track { background: transparent; }
    `}</style>
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
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
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

  /* ── HEADER ── */
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 24, flexWrap: 'wrap', gap: 16,
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
  },

  /* ── SUMMARY CARDS ── */
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 24,
  },
  summaryCard: {
    background: '#fff',
    border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 18,
    padding: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: 'rgba(124,99,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.4)',
    margin: '0 0 6px',
  },
  summaryValue: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 20,
    fontWeight: 700,
    margin: 0,
    color: '#1A1A1F',
  },

  /* ── FORM CARD ── */
  formCard: {
    background: '#fff',
    border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 18, padding: 24,
    marginBottom: 20, position: 'relative', overflow: 'hidden',
    boxSizing: 'border-box',
  },
  shimmer: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(124,99,255,0.4), transparent)',
  },
  formTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 16, fontWeight: 600, margin: '0 0 18px',
  },
  field: { marginBottom: 14 },
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
  formActions: {
    display: 'flex', gap: 10, marginTop: 6,
  },
  saveBtn: {
    background: '#22C55E', color: '#fff', border: 'none',
    padding: '11px 22px', borderRadius: 12,
    cursor: 'pointer', fontWeight: 600, fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
  },
  cancelBtn: {
    background: '#fff', color: 'rgba(20,20,30,0.5)',
    border: '1px solid rgba(20,20,30,0.1)',
    padding: '11px 22px', borderRadius: 12,
    cursor: 'pointer', fontWeight: 600, fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
  },

  /* ── TABLE ── */
  empty: {
    background: '#fff',
    border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 18, padding: '40px 0',
    textAlign: 'center',
    fontFamily: "'Space Grotesk', sans-serif",
    color: 'rgba(20,20,30,0.35)', fontSize: 13,
  },
  tableCard: {
    background: '#fff',
    border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 18,
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '14px 20px',
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.4)',
    borderBottom: '1px solid rgba(20,20,30,0.07)',
  },
  tr: {
    borderBottom: '1px solid rgba(20,20,30,0.05)',
  },
  td: {
    padding: '14px 20px',
    fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
  },
  statusSelect: {
    border: 'none',
    borderRadius: 20,
    padding: '4px 12px',
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
    color: '#fff',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
    paddingRight: 32,
  },
  deleteBtn: {
    background: 'rgba(224,82,74,0.1)',
    border: '1px solid rgba(224,82,74,0.25)',
    color: '#E0524A',
    padding: '7px 16px', borderRadius: 10,
    cursor: 'pointer', fontWeight: 600, fontSize: 13,
    fontFamily: "'Outfit', sans-serif",
  },

  /* ── STATUS COLORS ── */
  statusPending: {
    background: 'rgba(251,146,60,0.1)',
    border: '1px solid rgba(251,146,60,0.25)',
    color: '#FB923C',
  },
  statusPaid: {
    background: 'rgba(59,130,246,0.1)',
    border: '1px solid rgba(59,130,246,0.25)',
    color: '#3B82F6',
  },
  statusApproved: {
    background: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.25)',
    color: '#22C55E',
  },
  statusDefault: {
    background: 'rgba(107,114,128,0.1)',
    border: '1px solid rgba(107,114,128,0.25)',
    color: '#6B7280',
  },

  /* ── PAID BY BADGES ── */
  paidByDriver: {
    display: 'inline-block',
    background: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.25)',
    color: '#16A34A',
    borderRadius: 20, padding: '4px 12px',
    fontSize: 12, fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
  },
  paidByCompany: {
    display: 'inline-block',
    background: 'rgba(59,130,246,0.1)',
    border: '1px solid rgba(59,130,246,0.25)',
    color: '#2563EB',
    borderRadius: 20, padding: '4px 12px',
    fontSize: 12, fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
  },
};
