'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../../components/dashboard/layout';
import PaymentForm from '@/components/payments/PaymentForm';
import PaymentStats from '@/components/payments/PaymentStats';
import PaymentTable from '@/components/payments/PaymentTable';

export default function PaymentsPage({ user, onLogout }) {
  const [payments, setPayments] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [notes, setNotes] = useState('');

  const [stats, setStats] = useState({
    totalReceivables: 0,
    totalReceived: 0,
    pendingAmount: 0,
    overduePayments: 0,
  });

  useEffect(() => {
    fetchPayments();
    fetchTrips();
  }, [filterStatus]);

  const fetchPayments = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      setPayments([]);
      setLoading(false);
      return;
    }

    let query = supabase
      .from('payments')
      .select('*')
      .eq('owner_id', authUser.id)
      .order('created_at', { ascending: false });

    if (filterStatus) {
      query = query.eq('payment_status', filterStatus);
    }

    const { data, error } = await query;
    if (error) {
      console.error(error);
    } else {
      setPayments(data || []);
      calculateStats(data || []);
    }
    setLoading(false);
  };

  const calculateStats = (paymentsData) => {
    const totalReceivables = paymentsData.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalReceived = paymentsData.reduce((sum, p) => sum + (p.received_amount || 0), 0);
    const pendingAmount = totalReceivables - totalReceived;
    const overduePayments = paymentsData.filter(p => {
      if (p.payment_status === 'paid') return false;
      const due = p.due_date ? new Date(p.due_date) : new Date(p.created_at);
      return due < new Date();
    }).length;

    setStats({
      totalReceivables,
      totalReceived,
      pendingAmount,
      overduePayments,
    });
  };

  const savePayment = async (tripId, amount, paymentStatus) => {
    if (!tripId || !amount) {
      alert('Please fill all required fields');
      setFormLoading(false);
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount');
      setFormLoading(false);
      return;
    }
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      alert('Not authenticated. Please login again.');
      setFormLoading(false);
      return;
    }
    const selectedTrip = trips.find(t => t.id === tripId);
    const driverId = selectedTrip?.driver_id || '';
    const receivedAmount =
      paymentStatus === 'paid'
        ? parsedAmount
        : paymentStatus === 'partial'
        ? parsedAmount / 2
        : 0;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const dueDateISO = dueDate.toISOString();
    const paymentDateISO = new Date().toISOString();

    setFormLoading(true);
    const { error } = await supabase
      .from('payments')
      .insert([
        {
          owner_id: authUser.id,
          trip_id: tripId,
          driver_id: driverId,
          amount: parsedAmount,
          received_amount: receivedAmount,
          payment_status: paymentStatus,
          payment_date: paymentDateISO,
          due_date: dueDateISO,
          notes: notes,
        },
      ]);
    if (error) {
      console.error(error);
      alert(error.message);
      setFormLoading(false);
      return;
    }
    setShowForm(false);
    setFormLoading(false);
    fetchPayments();
    alert('Payment recorded successfully');
  };

  const updatePaymentStatus = async (id, newStatus) => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      alert('Not authenticated. Please login again.');
      return;
    }
    const updates = { payment_status: newStatus };
    const { error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .eq('owner_id', authUser.id);
    if (error) {
      alert(error.message);
      return;
    }
    fetchPayments();
  };

  const deletePayment = async (id) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      alert('Not authenticated. Please login again.');
      return;
    }
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('owner_id')
      .eq('id', id)
      .maybeSingle();
    if (fetchError || !payment) {
      alert('Payment not found');
      return;
    }
    if (payment.owner_id !== authUser.id) {
      alert('Unauthorized to delete this payment');
      return;
    }
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id)
      .eq('owner_id', authUser.id);
    if (error) {
      alert(error.message);
      return;
    }
    fetchPayments();
  };

  const fetchTrips = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      setTrips([]);
      return;
    }
    const { data, error } = await supabase
      .from('trips')
      .select('id, customer, driver_id, freight_amount')
      .eq('owner_id', authUser.id);
    if (error) {
      console.error('Error fetching trips:', error);
    } else {
      setTrips(data || []);
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
        <div style={s.header}>
          <div>
            <p style={s.headerSub}>Fleet</p>
            <h1 style={s.headerTitle}>Customer Payments</h1>
          </div>
          <button onClick={() => setShowForm(true)} style={s.primaryBtn}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Record Payment
          </button>
        </div>

        <div style={s.filters}>
          <div style={s.filterGroup}>
            <label style={s.filterLabel}>Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={s.filterInput}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        <PaymentStats stats={stats} />
        {showForm && (
          <PaymentForm
            showForm={showForm}
            setShowForm={setShowForm}
            trips={trips}
            payments={payments}
            formLoading={formLoading}
            savePayment={savePayment}
          />
        )}
        <PaymentTable
          payments={payments}
          updatePaymentStatus={updatePaymentStatus}
          deletePayment={deletePayment}
        />
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: 16,
  },
  spinnerRing: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    border: '1px solid rgba(124,99,255,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: '2px solid rgba(124,99,255,0.1)',
    borderTop: '2px solid #7C63FF',
    animation: 'spin 0.8s linear infinite',
  },
  muted: {
    fontFamily: "'Space Grotesk', sans-serif",
    color: 'rgba(20,20,30,0.45)',
    fontSize: 13,
  },
  shell: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: 28,
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 16,
  },
  headerSub: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.4)',
    margin: '0 0 6px',
  },
  headerTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 24,
    fontWeight: 700,
    margin: 0,
    letterSpacing: -0.5,
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: '#7C63FF',
    color: '#fff',
    border: 'none',
    padding: '11px 20px',
    borderRadius: 12,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
    boxShadow: '0 8px 20px rgba(124,99,255,0.25)',
  },
  filters: {
    display: 'flex',
    gap: 16,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  filterLabel: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.4)',
  },
  filterInput: {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid rgba(20,20,30,0.1)',
    background: '#F7F7FA',
    fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
    color: '#1A1A1F',
  },
};

