'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../lib/currency';
import { useAuth } from '../../lib/AuthContext';
import { useRouter } from 'next/navigation';
import { withRoleProtection } from '../../lib/withRoleProtection';
import DashboardLayout from '../../dashboard/layout';

function DriverHome() {
  const { user } = useAuth();
  const [assignedTrip, setAssignedTrip] = useState(null);
  const [nextRequiredStatus, setNextRequiredStatus] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [pendingAdvance, setPendingAdvance] = useState(null);
  const [currentPayableEstimate, setCurrentPayableEstimate] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const statusOptions = ['assigned', 'loading', 'in_transit', 'unloading', 'delivered'];

  useEffect(() => {
    if (!user) return;

    const fetchDriverData = async () => {
      try {
        setLoading(true);
        
        // Get driver ID from profiles
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          return;
        }

        if (!profile) return;

        // Get driver info
        const { data: driver, error: driverError } = await supabase
          .from('drivers')
          .select('id, owner_id, pay_type, salary_amount')
          .eq('profile_id', profile.id)
       .maybeSingle();
        if (driverError) {
          console.error('Driver fetch error:', driverError);
          return;
        }

        const driverId = driver?.id;
        if (!driverId) return;

        // Active trip
        const { data: trip, error: tripError } = await supabase
          .from('trips')
          .select('id, status, origin, destination, customer, created_at, owner_id, trucks(truck_number)')
          .eq('driver_id', driverId)
          .in('status', ['assigned', 'loading', 'in_transit', 'unloading'])
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (!tripError && trip) {
          setAssignedTrip(trip);
          // Determine next required status
          const currentStatus = trip.status;
          const currentIndex = statusOptions.indexOf(currentStatus);
          const nextStatus = currentIndex >= 0 ? statusOptions[currentIndex + 1] : null;
          setNextRequiredStatus(nextStatus);
        }

        // Pending advance request
        const { data: advance, error: advanceError } = await supabase
          .from('advance_requests')
          .select('id, amount, status, reason, created_at')
          .eq('driver_id', driverId)
          .eq('status', 'pending')
          .single();

        if (!advanceError && advance) {
          setPendingAdvance(advance);
        }

        // Recent expenses
        const { data: expenses, error: expensesError } = await supabase
          .from('trip_expenses')
          .select('id, amount, category, paid_by, expense_date, status')
          .eq('driver_id', driverId)
          .order('expense_date', { ascending: false })
          .limit(5);

        if (!expensesError) {
          setRecentExpenses(expenses || []);
        }

        // Payable estimate from settlements
        const { data: settlements, error: settlementsError } = await supabase
          .from('settlements')
          .select('net_payable')
          .eq('driver_id', driverId)
          .eq('payment_status', 'pending')
          .order('created_at', { ascending: false });

        if (!settlementsError) {
          const totalPayable = settlements?.reduce((sum, item) => sum + (item.net_payable || 0), 0) || 0;
          setCurrentPayableEstimate(totalPayable);
        }

      } catch (error) {
        console.error('Error fetching driver data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, [user]);

  const getStatusColor = (status) => {
    const colors = {
      'assigned': '#3B82F6',
      'loading': '#FB923C',
      'in_transit': '#8B5CF6',
      'unloading': '#EC4899',
      'delivered': '#22C55E',
    };
    return colors[status] || '#6B7280';
  };

  const getExpenseColor = (paidBy) => {
    return paidBy === 'driver_paid' ? '#22C55E' : '#3B82F6';
  };

 if (loading) {
  return (
    <DashboardLayout>
      <div style={s.root}>
        <div style={s.center}>
          <div style={s.spinnerRing}>
            <div style={s.spinner} />
          </div>
          <p style={s.muted}>Loading driver dashboard...</p>
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
          <h1 style={s.headerTitle}>My Dashboard</h1>
        </div>
      </div>

      <div style={s.grid}>
        {/* Assigned Trip */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <div style={{ ...s.iconContainer, backgroundColor: '#3B82F615', borderColor: '#3B82F625' }}>
              <i className="ti ti-truck" style={{ fontSize: 24, color: '#3B82F6' }} />
            </div>
            <h3 style={s.cardTitle}>Assigned Trip</h3>
          </div>
          <div style={s.cardContent}>
            {assignedTrip ? (
              <div>
                <p style={s.cardText}><strong>Route:</strong> {assignedTrip.origin} → {assignedTrip.destination}</p>
                <p style={s.cardText}><strong>Customer:</strong> {assignedTrip.customer}</p>
                <p style={s.cardText}><strong>Truck:</strong> {assignedTrip.trucks?.truck_number || 'Unknown'}</p>
                <p style={s.cardText}><strong>Status:</strong> 
                  <span style={{ ...s.statusBadge, backgroundColor: `${getStatusColor(assignedTrip.status)}15`, color: getStatusColor(assignedTrip.status) }}>
                    {assignedTrip.status}
                  </span>
                </p>
                {nextRequiredStatus && (
                  <div style={{ marginTop: 16 }}>
                    <p style={s.cardText}><strong>Next Action:</strong></p>
                    <button 
                      onClick={() => router.push('/driver/mytrip')}
                      style={s.actionButton}
                    >
                      Update to {nextRequiredStatus}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p style={s.emptyText}>No assigned trip</p>
            )}
          </div>
        </div>

        {/* Pending Advance */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <div style={{ ...s.iconContainer, backgroundColor: '#FB923C15', borderColor: '#FB923C25' }}>
              <i className="ti ti-credit-card" style={{ fontSize: 24, color: '#FB923C' }} />
            </div>
            <h3 style={s.cardTitle}>Pending Advance</h3>
          </div>
          <div style={s.cardContent}>
            {pendingAdvance ? (
              <div>
                <p style={s.cardText}><strong>Amount:</strong> {formatCurrency(pendingAdvance.amount)}</p>
                <p style={s.cardText}><strong>Reason:</strong> {pendingAdvance.reason}</p>
                <p style={s.cardText}><strong>Requested:</strong> {new Date(pendingAdvance.created_at).toLocaleDateString()}</p>
                <div style={{ marginTop: 16 }}>
                  <span style={{ ...s.statusBadge, backgroundColor: '#FB923C15', color: '#FB923C' }}>
                    Pending Approval
                  </span>
                </div>
              </div>
            ) : (
              <p style={s.emptyText}>No pending advance requests</p>
            )}
          </div>
        </div>

        {/* Recent Expenses */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <div style={{ ...s.iconContainer, backgroundColor: '#22C55E15', borderColor: '#22C55E25' }}>
              <i className="ti ti-receipt" style={{ fontSize: 24, color: '#22C55E' }} />
            </div>
            <h3 style={s.cardTitle}>Recent Expenses</h3>
          </div>
          <div style={s.cardContent}>
                {recentExpenses.length > 0 ? (
                  <ul style={s.expenseList}>
                    {recentExpenses.map(expense => (
                      <li key={expense.id} style={s.expenseItem}>
                        <div>
                          <span style={s.expenseCategory}>{expense.category}</span>
                          <span style={s.expenseAmount}>{formatCurrency(expense.amount)}</span>
                        </div>
                        <div style={s.expenseMeta}>
                          <span style={{ ...s.paidByBadge, backgroundColor: `${getExpenseColor(expense.paid_by)}15`, color: getExpenseColor(expense.paid_by) }}>
                            {expense.paid_by === 'driver_paid' ? 'Driver Paid' : 'Company Paid'}
                          </span>
                          <span style={s.expenseDate}>{new Date(expense.expense_date).toLocaleDateString()}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={s.emptyText}>No recent expenses</p>
                )}
          </div>
        </div>

        {/* Current Payable Estimate */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <div style={{ ...s.iconContainer, backgroundColor: '#8B5CF615', borderColor: '#8B5CF625' }}>
              <i className="ti ti-wallet" style={{ fontSize: 24, color: '#8B5CF6' }} />
            </div>
            <h3 style={s.cardTitle}>Current Payable Estimate</h3>
          </div>
          <div style={s.cardContent}>
            {currentPayableEstimate !== null ? (
              <div>
                <div style={s.payableAmount}>{formatCurrency(currentPayableEstimate)}</div>
                <p style={s.cardText}>Amount pending for payment</p>
                <div style={{ marginTop: 16 }}>
                  <span style={{ ...s.statusBadge, backgroundColor: '#8B5CF615', color: '#8B5CF6' }}>
                    Pending Settlement
                  </span>
                </div>
              </div>
            ) : (
              <p style={s.emptyText}>No payable estimate</p>
            )}
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 16,
  },
  card: {
    background: '#fff',
    border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 16,
    padding: 20,
    boxShadow: '0 2px 8px rgba(20,20,30,0.06)',
    transition: 'all 0.2s',
  },
  cardHeader: {
    display: 'flex', alignItems: 'flex-start', gap: 14,
    marginBottom: 16,
  },
  iconContainer: {
    width: 48, height: 48, borderRadius: 12,
    border: '1px solid',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  cardTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 16, fontWeight: 600, color: '#1A1A1F', margin: 0,
  },
  cardContent: {},
  cardText: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 14, color: 'rgba(20,20,30,0.7)', margin: '8px 0',
    wordBreak: 'break-word',
  },
  emptyText: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 14, color: 'rgba(20,20,30,0.45)', fontStyle: 'italic',
    textAlign: 'center', padding: 16,
  },
  actionButton: {
    background: '#7C63FF',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: 12,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
    boxShadow: '0 4px 12px rgba(124,99,255,0.25)',
    minHeight: 44,
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
    textTransform: 'capitalize',
    whiteSpace: 'nowrap',
  },
  expenseList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  expenseItem: {
    padding: 10,
    borderBottom: '1px solid rgba(20,20,30,0.05)',
    ':last-child': {
      borderBottom: 'none',
    },
  },
  expenseCategory: {
    fontWeight: 600,
    color: '#1A1A1F',
  },
  expenseAmount: {
    fontWeight: 600,
    color: '#7C63FF',
    marginLeft: 8,
  },
  expenseMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
    gap: 4,
  },
  paidByBadge: {
    padding: '2px 8px',
    borderRadius: 16,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  expenseDate: {
    fontSize: 12,
    color: 'rgba(20,20,30,0.45)',
  },
  payableAmount: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 28,
    fontWeight: 700,
    color: '#1A1A1F',
    marginBottom: 8,
  },
};

export default withRoleProtection(DriverHome, '/driver/home');