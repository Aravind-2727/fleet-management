'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';
import { useRouter } from 'next/navigation';
import { withRoleProtection } from '../../lib/withRoleProtection';
import TripUpdateModal from '../../../components/driver/TripUpdateModal';

function MyTrip() {
  const { user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [statusOptions] = useState(['assigned', 'loading', 'in_transit', 'unloading', 'delivered']);
  const [statusIndex, setStatusIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const fetchAssignedTrip = async () => {
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

        const driverId = profile?.id;
        if (!driverId) return;

        const { data, error } = await supabase
          .from('trips')
          .select('id, status, origin, destination, customer, created_at, owner_id, driver_id, trucks(truck_number)')
          .eq('driver_id', driverId)
          .in('status', ['assigned', 'loading', 'in_transit', 'unloading'])
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Trip fetch error:', error);
          return;
        }

        if (data) {
          setTrip(data);
          // Determine current index in status flow
          const currentStatus = data.status;
          const idx = statusOptions.indexOf(currentStatus);
          setStatusIndex(idx);
        }
      } catch (error) {
        console.error('Error fetching assigned trip:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedTrip();
  }, [user]);

  const currentStatus = trip?.status;
  const nextStatusIdx = statusIndex + 1;
  const nextStatus = nextStatusIdx < statusOptions.length ? statusOptions[nextStatusIdx] : null;

  const canUpdateStatus = nextStatus !== null && currentStatus !== 'delivered';

  const updateStatus = async () => {
    if (!nextStatus || !trip) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('trips')
        .update({ status: nextStatus })
        .eq('id', trip.id)
        .select('id, status')
        .single();

      if (error) {
        console.error('Status update error:', error);
        alert(error.message);
        return;
      }

      setShowConfirm(false);
      // Refresh trip data
      setTrip({ ...trip, status: data.status });
      // Update statusIndex if needed
      const newIdx = statusOptions.indexOf(data.status);
      setStatusIndex(newIdx);

      alert(`Status updated to ${nextStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={s.root}>
        <div style={s.center}>
          <div style={s.spinnerRing}><div style={s.spinner} /></div>
          <p style={s.muted}>Loading trip...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div style={s.root}>
        <div style={s.center}>
          <h2>No Assigned Trip</h2>
          <p style={s.muted}>You don't have any assigned trips at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={s.root}>
      <div style={s.header}>
        <div>
          <p style={s.headerSub}>Driver</p>
          <h1 style={s.headerTitle}>My Trip</h1>
        </div>
      </div>

      <div style={s.card}>
        <div style={s.cardHeader}>
          <h3 style={s.cardTitle}>Trip Details</h3>
          <span style={{ ...s.statusBadge, backgroundColor: `${getStatusColor(currentStatus)}15`, color: getStatusColor(currentStatus) }}>
            {currentStatus}
          </span>
        </div>
        <div style={s.cardContent}>
          <div style={s.detailsGrid}>
            <div>
              <p style={s.detailLabel}>Route</p>
              <p style={s.detailValue}>{trip.origin} → {trip.destination}</p>
            </div>
            <div>
              <p style={s.detailLabel}>Customer</p>
              <p style={s.detailValue}>{trip.customer}</p>
            </div>
            <div>
              <p style={s.detailLabel}>Truck</p>
              <p style={s.detailValue}>{trip.trucks?.truck_number || 'Unknown'}</p>
            </div>
            <div>
              <p style={s.detailLabel}>Origin</p>
              <p style={s.detailValue}>{trip.origin}</p>
            </div>
            <div>
              <p style={s.detailLabel}>Destination</p>
              <p style={s.detailValue}>{trip.destination}</p>
            </div>
            <div>
              <p style={s.detailLabel}>Started</p>
              <p style={s.detailValue}>{new Date(trip.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {canUpdateStatus ? (
            <div style={s.actionSection}>
              <h4 style={s.actionTitle}>Next Action</h4>
              <p style={s.actionText}>Update trip status to: <strong>{nextStatus}</strong></p>
              <button 
                onClick={() => setShowConfirm(true)}
                style={s.updateButton}
              >
                Update to {nextStatus}
              </button>
            </div>
          ) : (
            <div style={s.completedSection}>
              <h4 style={s.actionTitle}>Trip Status</h4>
              <p style={s.completedText}>Trip has been completed successfully.</p>
              <span style={{ ...s.statusBadge, backgroundColor: '#22C55E15', color: '#22C55E' }}>
                Completed
              </span>
            </div>
          )}
        </div>
      </div>

      <TripUpdateModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={updateStatus}
        nextStatus={nextStatus}
        loading={loading}
      />
    </div>
  );
}

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
    minHeight: '100vh', gap: 16, padding: 16, textAlign: 'center',
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
  card: {
    background: '#fff',
    border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 16,
    padding: 20,
    boxShadow: '0 2px 8px rgba(20,20,30,0.06)',
  },
  cardHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20, flexWrap: 'wrap', gap: 12,
  },
  cardTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 18, fontWeight: 600, color: '#1A1A1F', margin: 0,
  },
  cardContent: {},
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
    marginBottom: 24,
  },
  detailLabel: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.4)', margin: '0 0 6px',
  },
  detailValue: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 15, fontWeight: 500, color: '#1A1A1F', margin: 0,
    wordBreak: 'break-word',
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
  actionSection: {
    background: 'rgba(124,99,255,0.05)',
    border: '1px solid rgba(124,99,255,0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  actionTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 15, fontWeight: 600, color: '#1A1A1F', margin: '0 0 6px',
  },
  actionText: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 13, color: 'rgba(20,20,30,0.7)', margin: '0 0 14px',
  },
  updateButton: {
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
  completedSection: {
    textAlign: 'center',
    padding: 16,
    background: 'rgba(34,197,94,0.05)',
    border: '1px solid rgba(34,197,94,0.1)',
    borderRadius: 12,
  },
  completedText: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 13, color: '#16A34A', marginBottom: 12,
  },
};

export default withRoleProtection(MyTrip, '/driver/mytrip');