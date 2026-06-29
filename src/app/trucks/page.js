'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../../components/dashboard/layout';
import Modal from '../../components/common/Modal';

export default function TrucksPage({ user, onLogout }) {
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    truckNumber: '',
    status: 'Active',

    notes: '',
  });

  useEffect(() => {
    fetchTrucks();
    fetchDrivers();
  }, []);

  const fetchTrucks = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setTrucks([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('trucks')
        .select('*')
        .eq('owner_id', authUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching trucks:', error);
        setTrucks([]);
      } else {
        // Active trips determine which driver is assigned to each truck
        const { data: activeTrips } = await supabase
          .from('trips')
          .select(`
            truck_id,
            drivers(id, name)
          `)
          .eq('owner_id', authUser.id)
          .not('status', 'in', '("delivered","pending_settlement")');

        const driverMap = {};
        if (activeTrips) {
          activeTrips.forEach(trip => {
            if (trip.truck_id && trip.drivers?.name) {
              driverMap[trip.truck_id] = trip.drivers.name;
            }
          });
        }

        const enriched = (data || []).map(truck => ({
          ...truck,
          assignedDriverName: driverMap[truck.id] || null,
        }));

        setTrucks(enriched);
      }
    } catch (error) {
      console.error('Error fetching trucks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { setDrivers([]); return; }

      const { data, error } = await supabase
        .from('drivers')
        .select('id, name, phone, status')
        .eq('owner_id', authUser.id)
        .order('name', { ascending: true });

      if (error) console.error('Error fetching drivers:', error);
      else setDrivers(data || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const saveTruck = async () => {
    if (!formData.truckNumber || formData.truckNumber.trim().length < 2) {
      alert('Enter valid truck number (at least 2 characters)');
      return;
    }

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        alert('Not authenticated. Please login again.');
        return;
      }

      const { error } = await supabase
        .from('trucks')
        .insert([
          {
            owner_id: authUser.id,
            truck_number: formData.truckNumber.trim(),
            status: formData.status,
          
            notes: formData.notes.trim(),
          },
        ]);

      if (error) {
        console.error('Error creating truck:', error);
        alert(error.message);
        return;
      }

      setFormData({ truckNumber: '', status:
         'Active',  notes: '' });
      setShowForm(false);
      fetchTrucks();
      alert('Truck added successfully');
    } catch (error) {
      console.error('Error creating truck:', error);
      alert('Failed to create truck. Please try again.');
    }
  };

  const deleteTruck = async (id) => {
    if (!confirm('Are you sure you want to delete this truck?')) return;

    try {
      const { error } = await supabase
        .from('trucks')
        .delete()
        .eq('id', id);

      if (error) {
        alert(error.message);
        return;
      }

      fetchTrucks();
      alert('Truck deleted successfully');
    } catch (error) {
      console.error('Error deleting truck:', error);
      alert('Failed to delete truck. Please try again.');
    }
  };

  if (loading) {
    return (
      <DashboardLayout user={user} onLogout={onLogout}>
        <div style={s.center}>
          <div style={s.spinnerRing}><div style={s.spinner} /></div>
          <p style={s.muted}>Loading trucks...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div style={s.shell}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <p style={s.headerSub}>Fleet</p>
            <h1 style={s.headerTitle}>Trucks Management</h1>
          </div>

          <button onClick={() => setShowForm(true)} style={s.primaryBtn}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Truck
          </button>
        </div>

        {/* Add Form */}
        <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
          <div style={s.formCard}>
            <div style={s.shimmer} />
            <h3 style={s.formTitle}>Add New Truck</h3>

            <div style={s.formGrid}>
              <div style={s.formField}>
                <label style={s.label}>Truck Number</label>
                <input
                  placeholder="e.g. TS09 AB 1234"
                  value={formData.truckNumber}
                  onChange={(e) => setFormData({...formData, truckNumber: e.target.value})}
                  style={s.input}
                />
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
                  <option value="Under Maintenance">Under Maintenance</option>
                </select>
              </div>

            

              <div style={s.formField}>
                <label style={s.label}>Notes</label>
                <input
                  placeholder="Optional notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  style={s.input}
                />
              </div>
            </div>

            <div style={s.formActions}>
              <button onClick={saveTruck} style={s.saveBtn}>Save Truck</button>
              <button onClick={() => setShowForm(false)} style={s.cancelBtn}>Cancel</button>
            </div>
          </div>
        </Modal>

        {/* Table */}
        {trucks.length === 0 ? (
          <div style={s.empty}>No trucks found</div>
        ) : (
          <div style={s.tableCard}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Truck Number</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Assigned Driver</th>
                  <th style={s.th}>Notes</th>
                  <th style={{ ...s.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trucks.map((truck) => (
                  <tr key={truck.id} style={s.tr}>
                    <td style={s.td}>{truck.truck_number}</td>
                    <td style={s.td}>
                      <span style={{ ...s.statusBadge, backgroundColor: truck.status === 'Active' ? '#22C55E15' : '#6B728015', color: truck.status === 'Active' ? '#16A34A' : '#6B7280' }}>
                        {truck.status}
                      </span>
                    </td>
                    <td style={s.td}>{truck.assignedDriverName || 'Unassigned'}</td>
                    <td style={{ ...s.td, color: 'rgba(20,20,30,0.45)' }}>{truck.notes || '—'}</td>
                    <td style={{ ...s.td, textAlign: 'right' }}>
                      <button onClick={() => deleteTruck(truck.id)} style={s.deleteBtn}>
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
