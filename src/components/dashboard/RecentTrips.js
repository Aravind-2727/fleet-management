'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../app/lib/supabase';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

export default function RecentTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        const { data, error } = await supabase
          .from('trips')
          .select('id, origin, destination, freight_amount, status, created_at, drivers(name), trucks(truck_number)')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (!error) setTrips(data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchTrips();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'assigned': '#3B82F6', 'loading': '#FB923C', 'in_transit': '#8B5CF6',
      'unloading': '#EC4899', 'delivered': '#22C55E', 'pending_settlement': '#F59E0B',
    };
    return colors[status] || '#6B7280';
  };

  const getStatusStyle = (status) => {
    const colors = {
      'assigned': { bg: 'rgba(59,130,246,0.1)', color: '#3B82F6', label: 'Assigned' },
      'loading': { bg: 'rgba(251,146,60,0.1)', color: '#FB923C', label: 'Loading' },
      'in_transit': { bg: 'rgba(139,92,246,0.1)', color: '#8B5CF6', label: 'In Transit' },
      'unloading': { bg: 'rgba(236,72,153,0.1)', color: '#EC4899', label: 'Unloading' },
      'delivered': { bg: 'rgba(34,197,94,0.1)', color: '#22C55E', label: 'Delivered' },
      'pending_settlement': { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B', label: 'Pending Settlement' },
    };
    return colors[status] || { bg: 'rgba(107,114,128,0.1)', color: '#6B7280', label: status };
  };

  if (loading) {
    return (
      <div style={s.recentSection}>
        <h2 style={s.sectionTitle}>Recent Trips</h2>
        <div style={{ ...s.tableWrapper, padding: 40, textAlign: 'center' }}>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'rgba(20,20,30,0.45)', fontSize: 13 }}>Loading trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={s.recentSection}>
      <h2 style={s.sectionTitle}>Recent Trips</h2>
      {trips.length === 0 ? (
        <div style={{ ...s.tableWrapper, padding: 40, textAlign: 'center' }}>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'rgba(20,20,30,0.45)', fontSize: 13 }}>No trips found</p>
        </div>
      ) : (
        <div style={s.tableWrapper}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.tableHeader}>Route</th>
                <th style={s.tableHeader}>Truck</th>
                <th style={s.tableHeader}>Driver</th>
                <th style={s.tableHeader}>Status</th>
                <th style={s.tableHeader}>Freight Amount</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip, i) => {
                const st = getStatusStyle(trip.status);
                return (
                  <tr key={trip.id}>
                    <td style={s.tableCell}>{trip.origin} → {trip.destination}</td>
                    <td style={s.tableCell}>
                      <div style={s.badgeTruck}>{trip.trucks?.truck_number || 'Unknown'}</div>
                    </td>
                    <td style={s.tableCell}>
                      <div style={s.badgeDriver}>{trip.drivers?.name || 'Unknown'}</div>
                    </td>
                    <td style={s.tableCell}>
                      <span style={{ ...s.statusBadge, backgroundColor: st.bg, color: st.color }}>{st.label}</span>
                    </td>
                    <td style={s.tableCell}>{formatCurrency(trip.freight_amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const s = {
  recentSection: { marginTop: 28 },
  sectionTitle: { fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 600, margin: '0 0 16px' },
  tableWrapper: { background: '#fff', border: '1px solid rgba(20,20,30,0.07)', borderRadius: 16, overflowX: 'auto', boxShadow: '0 2px 8px rgba(20,20,30,0.06)' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 600 },
  tableHeader: { background: 'rgba(20,20,30,0.03)', padding: 16, textAlign: 'left', fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 600, color: 'rgba(20,20,30,0.6)', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid rgba(20,20,30,0.07)' },
  tableCell: { padding: 16, borderBottom: '1px solid rgba(20,20,30,0.07)', fontFamily: "'Outfit', sans-serif", fontSize: 14, color: '#1A1A1F' },
  badgeTruck: { display: 'inline-block', padding: '4px 10px', background: 'rgba(59,130,246,0.1)', color: '#3B82F6', borderRadius: 20, fontSize: 12, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" },
  badgeDriver: { display: 'inline-block', padding: '4px 10px', background: 'rgba(34,197,94,0.1)', color: '#22C55E', borderRadius: 20, fontSize: 12, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" },
  statusBadge: { display: 'inline-block', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", textTransform: 'capitalize' },
};
