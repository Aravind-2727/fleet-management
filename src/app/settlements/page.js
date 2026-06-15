'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../../components/dashboard/layout';
import SettlementStats from '../../components/settlements/SettlementStats';
import SettlementTable from '@/components/settlements/SettlementTable';
export default function SettlementsPage({ user, onLogout }) {
  const [settlements, setSettlements] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [filterDriver, setFilterDriver] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [stats, setStats] = useState({
    totalPayable: 0,
    totalPaid: 0,
    pendingSettlements: 0,
    thisMonth: 0
  });

  useEffect(() => {
    fetchSettlements();
    fetchDrivers();
    fetchTrips();
  }, []);

  const fetchSettlements = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      setSettlements([]);
      setLoading(false);
      return;
    }

    let query = supabase
      .from('settlements')
      .select('*')
      .eq('owner_id', authUser.id)
      .order('created_at', { ascending: false });

    if (filterDriver) {
      query = query.eq('driver_id', filterDriver);
    }

    if (filterStatus) {
      query = query.eq('payment_status', filterStatus);
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
    } else {
      setSettlements(data || []);
      calculateStats(data || []);
    }

    setLoading(false);
  };

  const calculateStats = (settlementsData) => {
    const totalPayable = settlementsData.reduce((sum, s) => sum + (s.net_payable || 0), 0);
    const totalPaid = settlementsData.reduce((sum, s) => sum + (s.net_payable || 0) * (s.payment_status === 'paid' ? 1 : 0), 0);
    const pendingSettlements = settlementsData.filter(s => s.payment_status !== 'paid').length;

    const thisMonth = settlementsData.filter(s => {
      const date = new Date(s.payment_date || s.created_at);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;

    setStats({
      totalPayable,
      totalPaid,
      pendingSettlements,
      thisMonth
    });
  };

  const saveSettlement = async (driverId, tripId, paymentMode, calculation) => {
    if (!calculation) {
      alert('No calculation data available');
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
      .from('settlements')
      .insert([
        {
          owner_id: authUser.id,
          driver_id: driverId,
          trip_id: tripId,
          earnings: calculation.earnings || 0,
          reimbursable_expenses: calculation.expenses || 0,
          advances_deducted: calculation.advances || 0,
          net_payable: calculation.netPayable || 0,
          payment_mode: paymentMode,
          payment_status: 'pending',
          payment_date: null,
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
    fetchSettlements();

    alert('Settlement created successfully');
  };

  const updateSettlementStatus = async (id, newStatus) => {
    const updates = {};

    if (newStatus === 'paid') {
      updates.payment_status = 'paid';
      updates.payment_date = new Date().toISOString();
    } else {
      updates.payment_status = newStatus;
    }

    const { error } = await supabase
      .from('settlements')
      .update(updates)
      .eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchSettlements();
  };

  const deleteSettlement = async (id) => {
    if (!confirm('Are you sure you want to delete this settlement?')) {
      return;
    }

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      alert('Not authenticated. Please login again.');
      return;
    }

    // Verify ownership before delete
    const { data: settlement, error: fetchError } = await supabase
      .from('settlements')
      .select('owner_id')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !settlement) {
      alert('Settlement not found');
      return;
    }

    if (settlement.owner_id !== authUser.id) {
      alert('Unauthorized to delete this settlement');
      return;
    }

    const { error } = await supabase
      .from('settlements')
      .delete()
      .eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchSettlements();
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
          <p style={s.muted}>Loading settlements...</p>
        </div>
      </div>
    );
  }

  const filteredSettlements = settlements.filter(s => {
    if (filterDriver && s.driver_id !== filterDriver) return false;
    if (filterStatus && s.payment_status !== filterStatus) return false;
    return true;
  });

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div style={s.shell}>

        {/* ── HEADER ── */}
        <div style={s.header}>
          <div>
            <p style={s.headerSub}>Fleet</p>
            <h1 style={s.headerTitle}>Driver Settlements</h1>
          </div>

          <button onClick={() => setShowForm(true)} style={s.primaryBtn}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Create Settlement
          </button>
        </div>

        {/* ── FILTERS ── */}
        <div style={s.filters}>
          <div style={s.filterGroup}>
            <label style={s.filterLabel}>Driver</label>
            <select
              value={filterDriver}
              onChange={(e) => setFilterDriver(e.target.value)}
              style={s.filterInput}
            >
              <option value="">All Drivers</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.profiles?.name}
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
              <option value="paid">Paid</option>
              <option value="processing">Processing</option>
            </select>
          </div>
        </div>

        {/* ── STATS CARDS ── */}
        <SettlementStats settlements={settlements} />

        {/* ── ADD FORM ── */}
        {showForm && (
          <SettlementForm
            showForm={showForm}
            setShowForm={setShowForm}
            drivers={drivers}
            trips={trips}
            settlements={settlements}
            formLoading={formLoading}
            saveSettlement={saveSettlement}
          />
        )}

        {/* ── TABLE ── */}
        <SettlementTable
          settlements={filteredSettlements}
          updateSettlementStatus={updateSettlementStatus}
          deleteSettlement={deleteSettlement}
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
