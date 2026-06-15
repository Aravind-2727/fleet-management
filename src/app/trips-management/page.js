'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../../components/dashboard/layout';

const getStatusColor = (status) => {
  switch (status) {
    case 'Assigned':
      return s.statusAssigned.background;
    case 'Loading':
      return s.statusLoading.background;
    case 'In Transit':
      return s.statusInTransit.background;
    case 'Unloading':
      return s.statusUnloading.background;
    case 'Delivered':
      return s.statusDelivered.background;
    default:
      return s.statusDefault.background;
  }
};

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

  /* ── FORM CARD ── */
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

  /* ── TABLE ── */
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
  statusSelect: {
    border: 'none',
    borderRadius: 20,
    padding: '4px 12px',
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
    color: '#fff',
    cursor: 'pointer',
    appearance: 'none',
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

  /* ── STATUS COLORS ── */
  statusAssigned: {
    background: 'rgba(124,99,255,0.1)',
    border: '1px solid rgba(124,99,255,0.25)',
    color: '#7C63FF',
  },
  statusLoading: {
    background: 'rgba(251,146,60,0.1)',
    border: '1px solid rgba(251,146,60,0.25)',
    color: '#FB923C',
  },
  statusInTransit: {
    background: 'rgba(59,130,246,0.1)',
    border: '1px solid rgba(59,130,246,0.25)',
    color: '#3B82F6',
  },
  statusUnloading: {
    background: 'rgba(168,85,247,0.1)',
    border: '1px solid rgba(168,85,247,0.25)',
    color: '#A855F7',
  },
  statusDelivered: {
    background: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.25)',
    color: '#22C55E',
  },
  statusDefault: {
    background: 'rgba(107,114,128,0.1)',
    border: '1px solid rgba(107,114,128,0.25)',
    color: '#6B7280',
  },
};

export default function TripsManagementPage({ user, onLogout }) {
  const [trips, setTrips] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [truckId, setTruckId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [customer, setCustomer] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [freightAmount, setFreightAmount] = useState('');
  const [status, setStatus] = useState('Assigned');

  useEffect(() => {
    fetchTrips();
    fetchTrucks();
    fetchDrivers();
  }, []);

  const saveTrip = async () => {
    if (!truckId || !driverId || !customer || !origin || !destination || !freightAmount) {
      alert('Please fill all required fields');
      return;
    }

    const amount = parseFloat(freightAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid positive freight amount');
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
      .from('trips')
      .insert([
        {
          owner_id: authUser.id,
          truck_id: truckId,
          driver_id: driverId,
          customer: customer.trim(),
          origin: origin.trim(),
          destination: destination.trim(),
          freight_amount: amount,
          status: status,
        },
      ]);

    if (error) {
      console.error(error);
      alert(error.message);
      setFormLoading(false);
      return;
    }

    setTruckId('');
    setDriverId('');
    setCustomer('');
    setOrigin('');
    setDestination('');
    setFreightAmount('');
    setStatus('Assigned');
    setShowForm(false);

    fetchTrips();
    setFormLoading(false);

    alert('Trip created successfully');
  };

  const updateTripStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('trips')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchTrips();
  };

  const deleteTrip = async (id) => {
    if (!confirm('Are you sure you want to delete this trip?')) {
      return;
    }

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      alert('Not authenticated. Please login again.');
      return;
    }

    // Verify ownership before delete
    const { data: trip, error: fetchError } = await supabase
      .from('trips')
      .select('owner_id')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !trip) {
      alert('Trip not found');
      return;
    }

    if (trip.owner_id !== authUser.id) {
      alert('Unauthorized to delete this trip');
      return;
    }

    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchTrips();
  };

  const fetchTrips = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      setTrips([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('owner_id', authUser.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setTrips(data || []);
    }

    setLoading(false);
  };

  const fetchTrucks = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const { data, error } = await supabase
      .from('trucks')
      .select('id, truck_number, status')
      .eq('owner_id', authUser.id);

    if (error) {
      console.error('Error fetching trucks:', error);
    } else {
      setTrucks(data || []);
    }
  };

  const fetchDrivers = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const { data, error } = await supabase
      .from('drivers')
      .select('id, profile_id, status, profiles(name, phone)')
      .eq('owner_id', authUser.id);

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
          <p style={s.muted}>Loading trips...</p>
        </div>
      </div>
    );
  }

  const getTruckNumber = (id) => {
    const truck = trucks.find(t => t.id === id);
    return truck ? truck.truck_number : 'Unknown';
  };

  const getDriverName = (id) => {
    const driver = drivers.find(d => d.id === id);
    return driver ? driver.profiles?.name : 'Unknown';
  };

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div style={s.shell}>

        {/* ── HEADER ── */}
        <div style={s.header}>
          <div>
            <p style={s.headerSub}>Fleet</p>
            <h1 style={s.headerTitle}>Trips Management</h1>
          </div>

          <button onClick={() => setShowForm(true)} style={s.primaryBtn}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Create Trip
          </button>
        </div>

        {/* ── ADD FORM ── */}
        {showForm && (
          <div style={s.formCard}>
            <div style={s.shimmer} />
            <h3 style={s.formTitle}>Create New Trip</h3>

            <div style={s.field}>
              <label style={s.label}>Truck</label>
              <select
                value={truckId}
                onChange={(e) => setTruckId(e.target.value)}
                style={s.input}
              >
                <option value="">Select Truck</option>
                {trucks.map((truck) => (
                  <option key={truck.id} value={truck.id}>
                    {truck.truck_number} - {truck.status}
                  </option>
                ))}
              </select>
            </div>

            <div style={s.field}>
              <label style={s.label}>Driver</label>
              <select
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                style={s.input}
              >
                <option value="">Select Driver</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.profiles?.name} - {driver.status}
                  </option>
                ))}
              </select>
            </div>

            <div style={s.field}>
              <label style={s.label}>Customer</label>
              <input
                placeholder="e.g. ABC Logistics"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                style={s.input}
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Origin</label>
              <input
                placeholder="e.g. New York, NY"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                style={s.input}
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Destination</label>
              <input
                placeholder="e.g. Los Angeles, CA"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                style={s.input}
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Freight Amount ($)</label>
              <input
                type="number"
                placeholder="e.g. 5000"
                value={freightAmount}
                onChange={(e) => setFreightAmount(e.target.value)}
                style={s.input}
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={s.input}
              >
                <option value="Assigned">Assigned</option>
                <option value="Loading">Loading</option>
                <option value="In Transit">In Transit</option>
                <option value="Unloading">Unloading</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>

            <div style={s.formActions}>
              <button onClick={saveTrip} style={s.saveBtn} disabled={formLoading}>
                {formLoading ? 'Creating...' : 'Create Trip'}
              </button>
              <button onClick={() => setShowForm(false)} style={s.cancelBtn} disabled={formLoading}>Cancel</button>
            </div>
          </div>
        )}

        {/* ── TABLE ── */}
        {trips.length === 0 ? (
          <div style={s.empty}>No trips found</div>
        ) : (
          <div style={s.tableCard}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Trip ID</th>
                  <th style={s.th}>Truck</th>
                  <th style={s.th}>Driver</th>
                  <th style={s.th}>Customer</th>
                  <th style={s.th}>Route</th>
                  <th style={s.th}>Freight Amount</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip) => (
                  <tr key={trip.id} style={s.tr}>
                    <td style={s.td}>{trip.id.substring(0, 8)}...</td>
                    <td style={s.td}>{getTruckNumber(trip.truck_id)}</td>
                    <td style={s.td}>{getDriverName(trip.driver_id)}</td>
                    <td style={s.td}>{trip.customer}</td>
                    <td style={s.td}>{trip.origin} → {trip.destination}</td>
                    <td style={s.td}>${(trip.freight_amount || 0).toLocaleString()}</td>
                    <td style={s.td}>
                      <select
                        value={trip.status}
                        onChange={(e) => updateTripStatus(trip.id, e.target.value)}
                        style={{ ...s.statusSelect, backgroundColor: getStatusColor(trip.status) }}
                      >
                        <option value="Assigned">Assigned</option>
                        <option value="Loading">Loading</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Unloading">Unloading</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                    <td style={{ ...s.td, textAlign: 'right' }}>
                      <button onClick={() => deleteTrip(trip.id)} style={s.deleteBtn}>
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