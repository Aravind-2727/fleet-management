'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../../components/dashboard/layout';

export default function DriversPage({ user, onLogout }) {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [payType, setPayType] = useState('per_trip');
  const [status, setStatus] = useState('Active');

  useEffect(() => {
    fetchDrivers();
  }, []);

  const validateForm = () => {
    if (!name || name.trim().length < 2) {
      alert('Enter valid driver name (at least 2 characters)');
      return false;
    }
    if (phone && !/^[\d\s\-\+\(\)]+$/.test(phone)) {
      alert('Enter valid phone number');
      return false;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Enter valid email address');
      return false;
    }
    return true;
  };

  const saveDriver = async () => {
    if (!validateForm()) return;

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      alert('Not authenticated. Please login again.');
      return;
    }

   const { error } = await supabase
  .from('drivers')
  .insert([{
    owner_id: authUser.id,
    name: name.trim(),
    phone: phone.trim(),
    email: email.trim(),
    pay_type: payType,
    status: status,
  }]);

if (error) {
  console.error(error);
  alert(error.message);
  return;
}

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setName('');
    setPhone('');
    setEmail('');
    setPayType('per_trip');
    setStatus('Active');
    setShowForm(false);

    fetchDrivers();
    alert('Driver added successfully');
  };

  const deleteDriver = async (id) => {
    if (!confirm('Are you sure you want to delete this driver?')) return;

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      alert('Not authenticated. Please login again.');
      return;
    }

    const { data: driver, error: fetchError } = await supabase
      .from('drivers')
      .select('owner_id, profile_id')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !driver) {
      alert('Driver not found');
      return;
    }

    if (driver.owner_id !== authUser.id) {
      alert('Unauthorized to delete this driver');
      return;
    }

    const { error } = await supabase
      .from('drivers')
      .delete()
      .eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    // Optionally delete the profile too
    if (driver.profile_id) {
      await supabase.from('profiles').delete().eq('id', driver.profile_id);
    }

    fetchDrivers();
  };

  const fetchDrivers = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      setDrivers([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('drivers')
      .select('id, profile_id, pay_type, status, profiles(name, phone, email)')
      .eq('owner_id', authUser.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setDrivers(data || []);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div style={s.root}>
        <div style={s.center}>
          <div style={s.spinnerRing}><div style={s.spinner} /></div>
          <p style={s.muted}>Loading drivers...</p>
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
            <h1 style={s.headerTitle}>Drivers Management</h1>
          </div>

          <button onClick={() => setShowForm(true)} style={s.primaryBtn}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Driver
          </button>
        </div>

        {/* ── ADD FORM ── */}
        {showForm && (
          <div style={s.formCard}>
            <div style={s.shimmer} />
            <h3 style={s.formTitle}>Add New Driver</h3>

            <div style={s.field}>
              <label style={s.label}>Driver Name</label>
              <input
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={s.input}
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Phone</label>
              <input
                placeholder="e.g. +1 555-123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={s.input}
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input
                placeholder="e.g. john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={s.input}
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Pay Type</label>
              <select
                value={payType}
                onChange={(e) => setPayType(e.target.value)}
                style={s.input}
              >
                <option value="per_trip">Per Trip</option>
                <option value="monthly_salary">Monthly Salary</option>
              </select>
            </div>

            <div style={s.field}>
              <label style={s.label}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={s.input}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div style={s.formActions}>
              <button onClick={saveDriver} style={s.saveBtn}>Save Driver</button>
              <button onClick={() => setShowForm(false)} style={s.cancelBtn}>Cancel</button>
            </div>
          </div>
        )}

        {/* ── TABLE ── */}
        {drivers.length === 0 ? (
          <div style={s.empty}>No drivers found</div>
        ) : (
          <div style={s.tableCard}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Name</th>
                  <th style={s.th}>Phone</th>
                  <th style={s.th}>Email</th>
                  <th style={s.th}>Pay Type</th>
                  <th style={s.th}>Status</th>
                  <th style={{ ...s.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => (
                  <tr key={driver.id} style={s.tr}>
                    <td style={s.td}>{driver.profiles?.name || 'Unknown'}</td>
                    <td style={s.td}>{driver.profiles?.phone || '—'}</td>
                    <td style={s.td}>{driver.profiles?.email || '—'}</td>
                    <td style={s.td}>
                      <span style={driver.pay_type === 'per_trip' ? s.badgePerTrip : s.badgeMonthly}>{driver.pay_type}</span>
                    </td>
                    <td style={s.td}>
                      <span style={driver.status === 'Active' ? s.statusBadgeActive : s.statusBadgeInactive}>{driver.status}</span>
                    </td>
                    <td style={{ ...s.td, textAlign: 'right' }}>
                      <button onClick={() => deleteDriver(driver.id)} style={s.deleteBtn}>
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
  statusBadgeActive: {
    display: 'inline-block',
    background: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.25)',
    color: '#16A34A',
    borderRadius: 20, padding: '4px 12px',
    fontSize: 12, fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
  },
  statusBadgeInactive: {
    display: 'inline-block',
    background: 'rgba(107,114,128,0.1)',
    border: '1px solid rgba(107,114,128,0.25)',
    color: '#6B7280',
    borderRadius: 20, padding: '4px 12px',
    fontSize: 12, fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
  },
  badgePerTrip: {
    display: 'inline-block',
    background: 'rgba(124,99,255,0.1)',
    border: '1px solid rgba(124,99,255,0.25)',
    color: '#7C63FF',
    borderRadius: 20, padding: '4px 12px',
    fontSize: 12, fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
  },
  badgeMonthly: {
    display: 'inline-block',
    background: 'rgba(236,72,153,0.1)',
    border: '1px solid rgba(236,72,153,0.25)',
    color: '#EC4899',
    borderRadius: 20, padding: '4px 12px',
    fontSize: 12, fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
  },
  deleteBtn: {
    background: 'rgba(224,82,74,0.1)',
    border: '1px solid rgba(224,82,74,0.25)',
    color: '#E0524A',
    padding: '7px 16px', borderRadius: 10,
    cursor: 'pointer', fontWeight: 600, fontSize: 13,
    fontFamily: "'Outfit', sans-serif",
  },
};