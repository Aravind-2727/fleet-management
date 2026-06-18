'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/currency';
import DashboardLayout from '../../components/dashboard/layout';

export default function ExpensesPage({ user, onLogout }) {
  const [expenses, setExpenses] = useState([]);
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    tripId: '',
    driverId: '',
    category: 'Fuel',
    amount: '',
    paidBy: 'driver_paid',
    notes: '',
  });

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

  const fetchExpenses = async () => {
    try {
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
        console.error('Error fetching expenses:', error);
      } else {
        setExpenses(data || []);
        calculateSummary(data || []);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
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

    setSummary({ total, driverPaid, companyPaid, pending });
  };

  const fetchTrips = async () => {
    try {
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
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setDrivers([]);
        return;
      }

      const { data, error } = await supabase
        .from('drivers')
        .select('id, name')
        .eq('owner_id', authUser.id);

      if (error) {
        console.error('Error fetching drivers:', error);
      } else {
        setDrivers(data || []);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const saveExpense = async () => {
    if (!formData.tripId || !formData.driverId || !formData.amount) {
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
            trip_id: formData.tripId,
            driver_id: formData.driverId,
            category: formData.category,
            amount: parsedAmount,
            paid_by: formData.paidBy,
            status: 'pending',
            notes: formData.notes,
          },
        ]);

      if (error) {
        console.error('Error creating expense:', error);
        alert(error.message);
        setFormLoading(false);
        return;
      }

      setFormData({
        tripId: '',
        driverId: '',
        category: 'Fuel',
        amount: '',
        paidBy: 'driver_paid',
        notes: '',
      });
      setShowForm(false);

      fetchExpenses();
      setFormLoading(false);
      alert('Expense added successfully');
    } catch (error) {
      console.error('Error creating expense:', error);
      alert('Failed to create expense. Please try again.');
      setFormLoading(false);
    }
  };

  const updateExpenseStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('trip_expenses')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) {
        alert(error.message);
        return;
      }

      fetchExpenses();
    } catch (error) {
      console.error('Error updating expense status:', error);
      alert('Failed to update expense status. Please try again.');
    }
  };

  const deleteExpense = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        alert('Not authenticated. Please login again.');
        return;
      }

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
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense. Please try again.');
    }
  };

  const getTripCustomer = (id) => {
    const trip = trips.find(t => t.id === id);
    return trip ? trip.customer : 'Unknown';
  };

  const getDriverName = (id) => {
    const driver = drivers.find(d => d.id === id);
    return driver ? driver.name : 'Unknown';
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
      <div style={s.root}>
        <div style={s.center}>
          <div style={s.spinnerRing}><div style={s.spinner} /></div>
          <p style={s.muted}>Loading expenses...</p>
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
            <h1 style={s.headerTitle}>Expenses Management</h1>
          </div>
          <button onClick={() => setShowForm(true)} style={s.primaryBtn}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Expense
          </button>
        </div>

        {/* Summary Cards */}
        <div style={s.summaryGrid}>
          <div style={s.summaryCard}>
            <div style={s.summaryIcon}>
              <i className="ti ti-receipt" style={{ fontSize: 24, color: '#7C63FF' }} />
            </div>
            <div>
              <p style={s.summaryLabel}>Total Expenses</p>
              <h3 style={s.summaryValue}>{formatCurrency(summary.total)}</h3>
            </div>
          </div>
          <div style={s.summaryCard}>
            <div style={s.summaryIcon}>
              <i className="ti ti-wallet" style={{ fontSize: 24, color: '#22C55E' }} />
            </div>
            <div>
              <p style={s.summaryLabel}>Driver Paid</p>
              <h3 style={s.summaryValue}>{formatCurrency(summary.driverPaid)}</h3>
            </div>
          </div>
          <div style={s.summaryCard}>
            <div style={s.summaryIcon}>
              <i className="ti ti-building-bank" style={{ fontSize: 24, color: '#3B82F6' }} />
            </div>
            <div>
              <p style={s.summaryLabel}>Company Paid</p>
              <h3 style={s.summaryValue}>{formatCurrency(summary.companyPaid)}</h3>
            </div>
          </div>
          <div style={s.summaryCard}>
            <div style={s.summaryIcon}>
              <i className="ti ti-clock" style={{ fontSize: 24, color: '#FB923C' }} />
            </div>
            <div>
              <p style={s.summaryLabel}>Pending</p>
              <h3 style={s.summaryValue}>{formatCurrency(summary.pending)}</h3>
            </div>
          </div>
        </div>

        {/* Add Form */}
        {showForm && (
          <div style={s.formCard}>
            <div style={s.shimmer} />
            <h3 style={s.formTitle}>Add New Expense</h3>
            <div style={s.formGrid}>
              <div style={s.formField}>
                <label style={s.label}>Trip</label>
                <select
                  value={formData.tripId}
                  onChange={(e) => setFormData({...formData, tripId: e.target.value})}
                  style={s.input}
                >
                  <option value="">Select Trip</option>
                  {trips.map((trip) => (
                    <option key={trip.id} value={trip.id}>{trip.customer}</option>
                  ))}
                </select>
              </div>

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
                <label style={s.label}>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
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
                  placeholder="e.g. 150"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  style={s.input}
                />
              </div>

              <div style={s.formField}>
                <label style={s.label}>Paid By</label>
                <select
                  value={formData.paidBy}
                  onChange={(e) => setFormData({...formData, paidBy: e.target.value})}
                  style={s.input}
                >
                  <option value="driver_paid">Driver Paid</option>
                  <option value="company_paid">Company Paid</option>
                </select>
              </div>

              <div style={s.formField}>
                <label style={s.label}>Notes</label>
                <input
                  placeholder="e.g. Gas for trip to LA"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  style={s.input}
                />
              </div>
            </div>

            <div style={s.formActions}>
              <button onClick={saveExpense} style={s.saveBtn} disabled={formLoading}>
                {formLoading ? 'Adding...' : 'Add Expense'}
              </button>
              <button onClick={() => setShowForm(false)} style={s.cancelBtn} disabled={formLoading}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Table */}
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
                    <td style={s.td}>{formatCurrency(expense.amount || 0)}</td>
                    <td style={s.td}>
                      <span style={{
                        ...s.paidByBadge,
                        backgroundColor: expense.paid_by === 'driver_paid' ? '#22C55E15' : '#3B82F615',
                        color: expense.paid_by === 'driver_paid' ? '#16A34A' : '#2563EB',
                      }}>
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
                    <td style={s.td}>
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
    width: 48, height: 48, borderRadius: 12,
    background: 'rgba(124,99,255,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  summaryLabel: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.4)', margin: '0 0 6px',
  },
  summaryValue: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 20, fontWeight: 700, margin: 0, color: '#1A1A1F',
  },
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
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 16, marginBottom: 20,
  },
  formField: { marginBottom: 14 },
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
  formActions: { display: 'flex', gap: 10, marginTop: 6 },
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
    borderRadius: 18, overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left',
    padding: '14px 20px',
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.4)',
    borderBottom: '1px solid rgba(20,20,30,0.07)',
  },
  tr: { borderBottom: '1px solid rgba(20,20,30,0.05)' },
  td: { padding: '14px 20px', fontSize: 14, fontFamily: "'Outfit', sans-serif" },
  statusSelect: {
    border: 'none', borderRadius: 20,
    padding: '4px 12px', fontSize: 12, fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
    color: '#fff', cursor: 'pointer', appearance: 'none',
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
  paidByBadge: {
    display: 'inline-block',
    padding: '4px 12px', borderRadius: 20,
    fontSize: 12, fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
  },
};