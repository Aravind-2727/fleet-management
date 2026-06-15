'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../../components/dashboard/layout';
import PaymentForm from '@/components/payments/PaymentForm';
import PaymentStats from '@/components/payments/PaymentStats';
import PaymentTable from '@/components/payments/PaymentTable';

export default function PaymentsPage({ user, onLogout }) {
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [stats, setStats] = useState({
    totalReceivables: 0,
    totalReceived: 0,
    pendingAmount: 0,
    overduePayments: 0
  });

  useEffect(() => {
    fetchPayments();
    fetchCustomers();
    fetchTrips();
  }, []);

  const fetchPayments = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      setPayments([]);
      setLoading(false);
      return;
    }

    let query = supabase
      .from('customer_payments')
      .select('*')
      .eq('owner_id', authUser.id)
      .order('created_at', { ascending: false });

    if (filterCustomer) {
      query = query.eq('customer_id', filterCustomer);
    }

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
    const totalReceivables = paymentsData.reduce((sum, p) => sum + (p.freight_amount || 0), 0);
    const totalReceived = paymentsData.reduce((sum, p) => sum + (p.amount_received || 0), 0);
    const pendingAmount = paymentsData.reduce((sum, p) => sum + ((p.freight_amount || 0) - (p.amount_received || 0)), 0);

    const overduePayments = paymentsData.filter(p => {
      if (p.payment_status === 'paid') return false;
      const dueDate = new Date(p.due_date || p.created_at);
      const now = new Date();
      return dueDate < now;
    }).length;

    setStats({
      totalReceivables,
      totalReceived,
      pendingAmount,
      overduePayments
    });
  };

  const savePayment = async (customerId, tripId, freightAmount, amountReceived, paymentStatus) => {
    if (!customerId || !tripId || !freightAmount) {
      alert('Please fill all required fields');
      setFormLoading(false);
      return;
    }

    const parsedFreight = parseFloat(freightAmount);
    const parsedReceived = parseFloat(amountReceived) || 0;

    if (isNaN(parsedFreight) || parsedFreight <= 0) {
      alert('Please enter a valid freight amount');
      setFormLoading(false);
      return;
    }

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      alert('Not authenticated. Please login again.');
      setFormLoading(false);
      return;
    }

    setFormLoading(true);

    const { error } = await supabase
      .from('customer_payments')
      .insert([
        {
          owner_id: authUser.id,
          customer_id: customerId,
          trip_id: tripId,
          freight_amount: parsedFreight,
          amount_received: parsedReceived,
          payment_status: paymentStatus,
          pending_amount: parsedFreight - parsedReceived,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
    const updates = {};

    if (newStatus === 'paid') {
      updates.payment_status = 'paid';
    } else {
      updates.payment_status = newStatus;
    }

    const { error } = await supabase
      .from('customer_payments')
      .update(updates)
      .eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchPayments();
  };

  const deletePayment = async (id) => {
    if (!confirm('Are you sure you want to delete this payment?')) {
      return;
    }

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      alert('Not authenticated. Please login again.');
      return;
    }

    // Verify ownership before delete
    const { data: payment, error: fetchError } = await supabase
      .from('customer_payments')
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
      .from('customer_payments')
      .delete()
      .eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchPayments();
  };

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('id, profile_id, profiles(name)');

    if (error) {
      console.error('Error fetching customers:', error);
    } else {
      setCustomers(data || []);
    }
  };

  const fetchTrips = async () => {
    const { data, error } = await supabase
      .from('trips')
      .select('id, customer, driver_id, freight_amount');

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

  const filteredPayments = payments.filter(p => {
    if (filterCustomer && p.customer_id !== filterCustomer) return false;
    if (filterStatus && p.payment_status !== filterStatus) return false;
    return true;
  });

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div style={s.shell}>

        {/* ── HEADER ── */}
        <div style={s.header}>
          <div>
            <p style={s.headerSub}>Fleet</p>
            <h1 style={s.headerTitle}>Customer Payments</h1>
          </div>

          <button onClick={() => setShowForm(true)} style={s.primaryBtn}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Record Payment
          </button>
        </div>

        {/* ── FILTERS ── */}
        <div style={s.filters}>
          <div style={s.filterGroup}>
            <label style={s.filterLabel}>Customer</label>
            <select
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
              style={s.filterInput}
            >
              <option value="">All Customers</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.profiles?.name}
                  </option>
                ))}
            </select>
          </div>

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

        {/* ── STATS CARDS ── */}
        <PaymentStats payments={payments} />

        {/* ── ADD FORM ── */}
        {showForm && (
          <PaymentForm
            showForm={showForm}
            setShowForm={setShowForm}
            customers={customers}
            trips={trips}
            payments={payments}
            formLoading={formLoading}
            savePayment={savePayment}
          />
        )}

        {/* ── TABLE ── */}
        <PaymentTable
          payments={filteredPayments}
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

  /* ── FILTERS ── */
  filters: {
    display: 'flex', gap: 16, marginBottom: 24,
    flexWrap: 'wrap',
  },
  filterGroup: {
    display: 'flex', flexDirection: 'column', gap: 6,
  },
  filterLabel: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
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
