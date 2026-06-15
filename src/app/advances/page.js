'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../../components/dashboard/layout';
import AdvanceStats from '../../components/advances/AdvanceStats';
import AdvanceForm from '../../components/advances/AdvanceForm';
import AdvanceTable from '../../components/advances/AdvanceTable';

export default function AdvancesPage({ user, onLogout }) {
  const [advances, setAdvances] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [driverId, setDriverId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const [summary, setSummary] = useState({
    pendingCount: 0,
    approvedAmount: 0,
    paidAmount: 0,
    rejectedCount: 0
  });

  useEffect(() => {
    fetchAdvances();
    fetchDrivers();
  }, []);

  const saveAdvance = async () => {
  if (!driverId || !amount || !reason) {
    alert('Please fill all required fields');
    return;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    alert('User not authenticated');
    return;
  }

  setFormLoading(true);

  const { error } = await supabase
    .from('advance_requests')
    .insert([
      {
        owner_id: user.id,
        driver_id: driverId,
        amount: parseFloat(amount),
        reason: reason,
        status: 'pending',
        requested_date: new Date().toISOString(),
      },
    ]);
    if (error) {
      console.error(error);
      alert(error.message);
      setFormLoading(false);
      return;
    }

    setDriverId('');
    setAmount('');
    setReason('');
    setShowForm(false);

    fetchAdvances();
    setFormLoading(false);

    alert('Advance request created successfully');
  };

  const updateAdvanceStatus = async (id, newStatus) => {
    const advance = advances.find(a => a.id === id);
    
    if (advance.status === 'pending' && (newStatus === 'approved' || newStatus === 'rejected')) {
      const { error } = await supabase
        .from('advance_requests')
        .update({ 
          status: newStatus,
          ...(newStatus === 'approved' ? { approved_date: new Date().toISOString() } : { rejected_date: new Date().toISOString() })
        })
        .eq('id', id);

      if (error) {
        alert(error.message);
        return;
      }
    } else if (advance.status === 'approved' && newStatus === 'paid') {
      const { error } = await supabase
        .from('advance_requests')
        .update({ 
          status: 'paid',
          paid_date: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        alert(error.message);
        return;
      }
    }

    fetchAdvances();
  };

  const deleteAdvance = async (id) => {
    if (!confirm('Are you sure you want to delete this advance request?')) {
      return;
    }

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      alert('Not authenticated. Please login again.');
      return;
    }

    // Verify ownership before delete
    const { data: advance, error: fetchError } = await supabase
      .from('advance_requests')
      .select('owner_id')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !advance) {
      alert('Advance request not found');
      return;
    }

    if (advance.owner_id !== authUser.id) {
      alert('Unauthorized to delete this advance request');
      return;
    }

    const { error } = await supabase
      .from('advance_requests')
      .delete()
      .eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchAdvances();
  };

const fetchAdvances = async () => {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    setLoading(false);
    return;
  }

  const { data, error } = await supabase
    .from('advance_requests')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

    console.log('Advances data:', data);
    console.log('Advances error:', error);

    if (error) {
      console.error(error);
    } else {
      setAdvances(data || []);
      calculateSummary(data || []);
    }

    setLoading(false);
  };

  const calculateSummary = (advancesData) => {
    const pendingCount = advancesData.filter(a => a.status === 'pending').length;
    const approvedAmount = advancesData
      .filter(a => a.status === 'approved')
      .reduce((sum, advance) => sum + (advance.amount || 0), 0);
    const paidAmount = advancesData
      .filter(a => a.status === 'paid')
      .reduce((sum, advance) => sum + (advance.amount || 0), 0);
    const rejectedCount = advancesData.filter(a => a.status === 'rejected').length;

    setSummary({
      pendingCount,
      approvedAmount,
      paidAmount,
      rejectedCount
    });
  };

 const fetchDrivers = async () => {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .eq('owner_id', user.id);

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
          <p style={s.muted}>Loading advances...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div style={s.shell}>

        {/* ── HEADER ── */}
        <div style={s.header}>
          <div>
            <p style={s.headerSub}>Fleet</p>
            <h1 style={s.headerTitle}>Advance Requests Management</h1>
          </div>

          <button onClick={() => setShowForm(true)} style={s.primaryBtn}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Create Advance Request
          </button>
        </div>

        {/* ── STATS CARDS ── */}
        <AdvanceStats summary={summary} />

        {/* ── ADD FORM ── */}
        {showForm && (
          <AdvanceForm
            showForm={showForm}
            setShowForm={setShowForm}
            driverId={driverId}
            setDriverId={setDriverId}
            amount={amount}
            setAmount={setAmount}
            reason={reason}
            setReason={setReason}
            drivers={drivers}
            formLoading={formLoading}
            saveAdvance={saveAdvance}
          />
        )}

        {/* ── TABLE ── */}
        <AdvanceTable
          advances={advances}
          updateAdvanceStatus={updateAdvanceStatus}
          deleteAdvance={deleteAdvance}
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
};
