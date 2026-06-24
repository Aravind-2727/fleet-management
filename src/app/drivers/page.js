'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../../components/dashboard/layout';
import Modal from '../../components/common/Modal';

export default function DriversPage({ user, onLogout }) {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    payType: 'per_trip',
    status: 'Active',
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setDrivers([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('drivers')
        .select(`
          id,
          name,
          phone,
          email,
          pay_type,
          status,
          salary_amount
        `)
        .eq('owner_id', authUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching drivers:', error);
      } else {
        console.log('Drivers API Response:', data);
        setDrivers(data || []);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.name || formData.name.trim().length < 2) {
      alert('Enter valid driver name (at least 2 characters)');
      return false;
    }
    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      alert('Enter valid phone number');
      return false;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert('Enter valid email address');
      return false;
    }
    return true;
  };

  const saveDriver = async () => {
    if (!validateForm()) return;

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        alert('Not authenticated. Please login again.');
        return;
      }

      // Create driver directly (new API route architecture)
      const { error } = await supabase
        .from('drivers')
        .insert([
          {
            owner_id: authUser.id,
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim(),
            pay_type: formData.payType,
            salary_amount: formData.payType === 'monthly_salary' ? 0 : null,
            status: formData.status,
          },
        ]);

      if (error) {
        console.error('Error creating driver:', error);
        alert(error.message);
        return;
      }

      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        payType: 'per_trip',
        status: 'Active',
      });
      setShowForm(false);

      // Refresh data
      fetchDrivers();

      alert('Driver added successfully');
    } catch (error) {
      console.error('Error creating driver:', error);
      alert('Failed to create driver. Please try again.');
    }
  };

  const deleteDriver = async (id) => {
    if (!confirm('Are you sure you want to delete this driver?')) return;

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        alert('Not authenticated. Please login again.');
        return;
      }

      // Verify ownership before delete
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
      alert('Driver deleted successfully');
    } catch (error) {
      console.error('Error deleting driver:', error);
      alert('Failed to delete driver. Please try again.');
    }
  };

  const getPayTypeBadge = (payType) => {
    return payType === 'per_trip' ? 
      { text: 'Per Trip', color: '#7C63FF', bg: '#7C63FF15' } :
      { text: 'Monthly Salary', color: '#EC4899', bg: '#EC489915' };
  };

  const getStatusBadge = (status) => {
    return status === 'Active' ?
      { text: 'Active', color: '#16A34A', bg: '#16A34A15' } :
      { text: 'Inactive', color: '#6B7280', bg: '#6B728015' };
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
        {/* Header */}
        <div style={s.header}>
          <div>
            <p style={s.headerSub}>Fleet</p>
            <h1 style={s.headerTitle}>Drivers Management</h1>
          </div>

          <button onClick={() => setShowForm(true)} style={s.primaryBtn}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Driver
          </button>
        </div>

        {/* Add Form */}
        <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
          <div style={s.formCard}>
            <div style={s.shimmer} />
            <h3 style={s.formTitle}>Add New Driver</h3>

            <div style={s.formGrid}>
              <div style={s.formField}>
                <label style={s.label}>Driver Name</label>
                <input
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={s.input}
                />
              </div>

              <div style={s.formField}>
                <label style={s.label}>Phone</label>
                <input
                  placeholder="e.g. +1 555-123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  style={s.input}
                />
              </div>

              <div style={s.formField}>
                <label style={s.label}>Email</label>
                <input
                  placeholder="e.g. john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={s.input}
                />
              </div>

              <div style={s.formField}>
                <label style={s.label}>Pay Type</label>
                <select
                  value={formData.payType}
                  onChange={(e) => setFormData({...formData, payType: e.target.value})}
                  style={s.input}
                >
                  <option value="per_trip">Per Trip</option>
                  <option value="monthly_salary">Monthly Salary</option>
                </select>
              </div>

              <div style={s.formField}>
                <label style={s.label}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  style={s.input}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div style={s.formActions}>
              <button onClick={saveDriver} style={s.saveBtn}>Save Driver</button>
              <button onClick={() => setShowForm(false)} style={s.cancelBtn}>Cancel</button>
            </div>
          </div>
        </Modal>

        {/* Table */}
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
                    <td style={s.td}>{driver.name || 'Unknown'}</td>
                    <td style={s.td}>{driver.phone || '—'}</td>
                    <td style={s.td}>{driver.email || '—'}</td>
                    <td style={s.td}>
                      <span style={{ ...s.badge, backgroundColor: getPayTypeBadge(driver.pay_type).bg, color: getPayTypeBadge(driver.pay_type).color }}>
                        {getPayTypeBadge(driver.pay_type).text}
                      </span>
                    </td>
                    <td style={s.td}>
                      <span style={{ ...s.statusBadge, backgroundColor: getStatusBadge(driver.status).bg, color: getStatusBadge(driver.status).color }}>
                        {getStatusBadge(driver.status).text}
                      </span>
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
    padding: 20,
    boxSizing: 'border-box',
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
    background: '#fff',
    border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 18, padding: 20,
    marginBottom: 20, position: 'relative', overflow: 'hidden',
    boxSizing: 'border-box',
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
    gap: 14,
    marginBottom: 20,
  },
  formField: {
    marginBottom: 14,
  },
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
    minHeight: 44,
  },
  formActions: {
    display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap',
  },
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
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: 650,
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.4)',
    borderBottom: '1px solid rgba(20,20,30,0.07)',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid rgba(20,20,30,0.05)',
  },
  td: {
    padding: '12px 16px',
    fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
    whiteSpace: 'nowrap',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
    whiteSpace: 'nowrap',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
    whiteSpace: 'nowrap',
  },
  deleteBtn: {
    background: 'rgba(224,82,74,0.1)',
    border: '1px solid rgba(224,82,74,0.25)',
    color: '#E0524A',
    padding: '7px 16px', borderRadius: 10,
    cursor: 'pointer', fontWeight: 600, fontSize: 13,
    fontFamily: "'Outfit', sans-serif", minHeight: 34,
  },
};