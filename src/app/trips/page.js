'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/currency';
import DashboardLayout from '../../components/dashboard/layout';

export default function TripsPage({ user, onLogout }) {
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    driver_id: '',
    truck_id: '',
    origin: '',
    destination: '',
    customer: '',
    customer_phone: '',
    customer_email: '',
    freight_amount: '',
    start_date: '',
    end_date: '',
    notes: '',
  });

  useEffect(() => {
    fetchTrips();
    fetchDrivers();
    fetchTrucks();
  }, []);

  const fetchTrips = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { setTrips([]); setLoading(false); return; }

      const { data, error } = await supabase
        .from('trips')
        .select(`
          id, driver_id, truck_id, origin, destination, customer,
          freight_amount, received_amount, status, close_status,
          expected_start_date, expected_end_date, created_at,
          drivers(id, name),
          trucks(truck_number, status)
        `)
        .eq('owner_id', authUser.id)
        .order('created_at', { ascending: false });

      if (error) console.error('Error fetching trips:', error);
      else setTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
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
        .select('id, name, phone, email, pay_type, status')
        .eq('owner_id', authUser.id)
        .eq('status', 'Active');

      if (error) console.error('Error fetching drivers:', error);
      else setDrivers(data || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchTrucks = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { setTrucks([]); return; }

      const { data, error } = await supabase
        .from('trucks')
        .select('*')
        .eq('owner_id', authUser.id)
        .eq('status', 'Active');

      if (error) console.error('Error fetching trucks:', error);
      else setTrucks(data || []);
    } catch (error) {
      console.error('Error fetching trucks:', error);
    }
  };

  const validateForm = () => {
    if (!formData.driver_id) { alert('Please select a driver'); return false; }
    if (!formData.truck_id) { alert('Please select a truck'); return false; }
    if (!formData.origin) { alert('Please enter origin'); return false; }
    if (!formData.destination) { alert('Please enter destination'); return false; }
    if (!formData.customer) { alert('Please enter customer name'); return false; }
    if (!formData.freight_amount || isNaN(formData.freight_amount) || parseFloat(formData.freight_amount) <= 0) {
      alert('Please enter a valid freight amount'); return false;
    }
    return true;
  };

  const saveTrip = async () => {
    if (!validateForm()) return;

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { alert('Not authenticated. Please login again.'); return; }

      const { error } = await supabase.from('trips').insert([{
        owner_id: authUser.id,
        driver_id: formData.driver_id,
        truck_id: formData.truck_id,
        origin: formData.origin,
        destination: formData.destination,
        customer: formData.customer,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email,
        freight_amount: parseFloat(formData.freight_amount),
        received_amount: 0,
        status: 'assigned',
        expected_start_date: formData.start_date || null,
        expected_end_date: formData.end_date || null,
        notes: formData.notes,
      }]);

      if (error) { alert(error.message); return; }

      setFormData({
        driver_id: '', truck_id: '', origin: '', destination: '',
        customer: '', customer_phone: '', customer_email: '',
        freight_amount: '', start_date: '', end_date: '', notes: '',
      });
      setShowForm(false);
      fetchTrips();
      alert('Trip created successfully');
    } catch (error) {
      alert('Failed to create trip. Please try again.');
    }
  };

  const updateTripStatus = async (tripId, newStatus) => {
    try {
      const { error } = await supabase
        .from('trips')
        .update({ status: newStatus })
        .eq('id', tripId);

      if (error) { alert(error.message); return; }

      fetchTrips();
      alert(`Trip status updated to ${newStatus}`);
    } catch (error) {
      alert('Failed to update trip status. Please try again.');
    }
  };

  const closeTrip = async (tripId) => {
    if (!confirm('Are you sure you want to close this trip? This will initiate the settlement process.')) return;

    try {
      const { error } = await supabase
        .from('trips')
        .update({ close_status: true, status: 'pending_settlement' })
        .eq('id', tripId);

      if (error) { alert(error.message); return; }

      fetchTrips();
      alert('Trip closed successfully. You can now create a settlement.');
    } catch (error) {
      alert('Failed to close trip. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'assigned': '#3B82F6',
      'loading': '#FB923C',
      'in_transit': '#8B5CF6',
      'unloading': '#EC4899',
      'delivered': '#22C55E',
      'pending_settlement': '#F59E0B',
    };
    return colors[status] || '#6B7280';
  };

  if (loading) {
    return (
      <div style={s.root}>
        <div style={s.center}>
          <div style={s.spinnerRing}><div style={s.spinner} /></div>
          <p style={s.muted}>Loading trips...</p>
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
            <h1 style={s.headerTitle}>Trips Management</h1>
          </div>
          <button onClick={() => setShowForm(true)} style={s.primaryBtn}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Create Trip
          </button>
        </div>

        {/* Create Trip Form */}
        {showForm && (
          <div style={s.formCard}>
            <div style={s.shimmer} />
            <h3 style={s.formTitle}>Create New Trip</h3>

            <div style={s.formGrid}>
              <div style={s.formField}>
                <label style={s.label}>Driver</label>
                <select
                  value={formData.driver_id}
                  onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                  style={s.input}
                >
                  <option value="">Select Driver</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name || 'Unknown'}
                    </option>
                  ))}
                </select>
              </div>

              <div style={s.formField}>
                <label style={s.label}>Truck</label>
                <select
                  value={formData.truck_id}
                  onChange={(e) => setFormData({ ...formData, truck_id: e.target.value })}
                  style={s.input}
                >
                  <option value="">Select Truck</option>
                  {trucks.map(truck => (
                    <option key={truck.id} value={truck.id}>
                      {truck.truck_number}
                    </option>
                  ))}
                </select>
              </div>

              <div style={s.formField}>
                <label style={s.label}>Origin</label>
                <input
                  placeholder="e.g. Mumbai"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  style={s.input}
                />
              </div>

              <div style={s.formField}>
                <label style={s.label}>Destination</label>
                <input
                  placeholder="e.g. Delhi"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  style={s.input}
                />
              </div>

              <div style={s.formField}>
                <label style={s.label}>Customer</label>
                <input
                  placeholder="e.g. ABC Logistics"
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  style={s.input}
                />
              </div>

              <div style={s.formField}>
                <label style={s.label}>Freight Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={formData.freight_amount}
                  onChange={(e) => setFormData({ ...formData, freight_amount: e.target.value })}
                  style={s.input}
                />
              </div>

              <div style={s.formField}>
                <label style={s.label}>Customer Phone</label>
                <input
                  placeholder="e.g. +91 9876543210"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  style={s.input}
                />
              </div>

              <div style={s.formField}>
                <label style={s.label}>Customer Email</label>
                <input
                  placeholder="e.g. contact@abc.com"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  style={s.input}
                />
              </div>

              <div style={s.formField}>
                <label style={s.label}>Start Date</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  style={s.input}
                />
              </div>

              <div style={s.formField}>
                <label style={s.label}>End Date</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  style={s.input}
                />
              </div>

              <div style={{ ...s.formField, gridColumn: 'span 2' }}>
                <label style={s.label}>Notes</label>
                <textarea
                  placeholder="Optional notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={{ ...s.input, minHeight: 80, resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={s.formActions}>
              <button onClick={saveTrip} style={s.saveBtn}>Create Trip</button>
              <button onClick={() => setShowForm(false)} style={s.cancelBtn}>Cancel</button>
            </div>
          </div>
        )}

        {/* Trips Table */}
        {trips.length === 0 ? (
          <div style={s.empty}>
            <h3>No trips found</h3>
            <p style={s.emptyText}>Create your first trip to get started</p>
          </div>
        ) : (
          <div style={s.tableCard}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Route</th>
                  <th style={s.th}>Customer</th>
                  <th style={s.th}>Driver</th>
                  <th style={s.th}>Truck</th>
                  <th style={s.th}>Freight</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip) => (
                  <tr key={trip.id} style={s.tr}>
                    <td style={s.td}>{trip.origin} → {trip.destination}</td>
                    <td style={s.td}>{trip.customer}</td>
                    <td style={s.td}>{trip.drivers?.name || 'Unknown'}</td>
                    <td style={s.td}>{trip.trucks?.truck_number || 'Unknown'}</td>
                    <td style={s.td}>{formatCurrency(trip.freight_amount || 0)}</td>
                    <td style={s.td}>
                      <span style={{
                        ...s.statusBadge,
                        backgroundColor: `${getStatusColor(trip.status)}15`,
                        color: getStatusColor(trip.status),
                      }}>
                        {trip.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ ...s.td, textAlign: 'right' }}>
                      <div style={s.actionButtons}>
                        {trip.status === 'assigned' && (
                          <button
                            onClick={() => updateTripStatus(trip.id, 'loading')}
                            style={{ ...s.actionBtn, backgroundColor: '#3B82F615', color: '#3B82F6' }}
                          >
                            Start Loading
                          </button>
                        )}
                        {trip.status === 'loading' && (
                          <button
                            onClick={() => updateTripStatus(trip.id, 'in_transit')}
                            style={{ ...s.actionBtn, backgroundColor: '#8B5CF615', color: '#8B5CF6' }}
                          >
                            Start Transit
                          </button>
                        )}
                        {trip.status === 'in_transit' && (
                          <button
                            onClick={() => updateTripStatus(trip.id, 'unloading')}
                            style={{ ...s.actionBtn, backgroundColor: '#EC489915', color: '#EC4899' }}
                          >
                            Start Unloading
                          </button>
                        )}
                        {trip.status === 'unloading' && (
                          <button
                            onClick={() => updateTripStatus(trip.id, 'delivered')}
                            style={{ ...s.actionBtn, backgroundColor: '#22C55E15', color: '#22C55E' }}
                          >
                            Mark Delivered
                          </button>
                        )}
                        {trip.status === 'delivered' && trip.close_status !== true && (
                          <button
                            onClick={() => closeTrip(trip.id)}
                            style={{ ...s.actionBtn, backgroundColor: '#F59E0B15', color: '#F59E0B' }}
                          >
                            Close Trip
                          </button>
                        )}
                        {trip.status === 'pending_settlement' && (
                          <span style={{
                            ...s.actionBtn,
                            backgroundColor: '#F59E0B15',
                            color: '#F59E0B',
                            cursor: 'default',
                          }}>
                            Awaiting Settlement
                          </span>
                        )}
                      </div>
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
    maxWidth: 1200, margin: '0 auto', padding: 28, boxSizing: 'border-box',
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
    background: '#fff', border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 18, padding: 24, marginBottom: 20,
    position: 'relative', overflow: 'hidden', boxSizing: 'border-box',
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
    display: 'block', fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.4)', marginBottom: 8,
  },
  input: {
    width: '100%', padding: '12px 14px', borderRadius: 12,
    border: '1px solid rgba(20,20,30,0.1)', background: '#F7F7FA',
    fontSize: 14, fontFamily: "'Outfit', sans-serif",
    color: '#1A1A1F', boxSizing: 'border-box', transition: 'all 0.15s',
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
    background: '#fff', border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 18, padding: '40px 0', textAlign: 'center',
  },
  emptyText: {
    fontFamily: "'Space Grotesk', sans-serif",
    color: 'rgba(20,20,30,0.35)', fontSize: 13, marginTop: 8,
  },
  tableCard: {
    background: '#fff', border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 18, overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left', padding: '14px 20px',
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.4)',
    borderBottom: '1px solid rgba(20,20,30,0.07)',
  },
  tr: { borderBottom: '1px solid rgba(20,20,30,0.05)' },
  td: { padding: '14px 20px', fontSize: 14, fontFamily: "'Outfit', sans-serif" },
  statusBadge: {
    display: 'inline-block', padding: '4px 12px', borderRadius: 20,
    fontSize: 12, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif",
    textTransform: 'capitalize',
  },
  actionButtons: { display: 'flex', gap: 8, justifyContent: 'flex-end' },
  actionBtn: {
    padding: '6px 12px', borderRadius: 10, border: 'none',
    cursor: 'pointer', fontWeight: 600, fontSize: 12,
    fontFamily: "'Space Grotesk', sans-serif",
  },
};