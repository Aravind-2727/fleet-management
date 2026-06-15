'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';
import { useRouter } from 'next/navigation';

export default function MyTrip() {
  const { user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [statusOptions] = useState(['assigned', 'loading', 'in_transit', 'unloading', 'delivered']);
  const [statusIndex, setStatusIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const fetchAssignedTrip = async () => {
       const { data, error } = await supabase
        .from('trips')
        .select('id, status, route, customer_name, truck_name, start_location, end_location, created_at')
        .eq('status', 'assigned')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Trip fetch error:', error);
        return;
      }

      // Use a subquery to get driver id from auth user's profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError) return;

      const { data: assignedTrip, error: assignedError } = await supabase
        .from('trips')
        .select('id, status, route, customer_name, truck_name, start_location, end_location, created_at')
        .eq('driver_id', profileData?.id)
        .eq('status', 'assigned')
        .single();

      if (!assignedError && assignedTrip) {
        setTrip(assignedTrip);
        // Determine current index in status flow
        const currentStatus = assignedTrip.status;
        const idx = statusOptions.indexOf(currentStatus);
        setStatusIndex(idx);
      }
    };

    fetchAssignedTrip();
  }, [user]);

  const currentStatus = trip?.status;
  const nextStatusIdx = statusIndex + 1;
  const nextStatus = nextStatusIdx < statusOptions.length ? statusOptions[nextStatusIdx] : null;

  const canUpdateStatus = nextStatus !== null;

  const updateStatus = async () => {
    if (!nextStatus) return;

    const { data, error } = await supabase
      .from('trips')
      .update({ status: nextStatus })
      .eq('id', trip?.id)
      .select('id')
      .single();

    if (error) {
      console.error('Status update error:', error);
      return;
    }

    // Refresh trip data
    const { data: refreshedTrip, error: refreshError } = await supabase
      .from('trips')
      .select('status')
      .eq('id', trip?.id)
      .single();

    if (!refreshError) {
      setTrip({ ...trip, status: refreshedTrip.status });
      // Update statusIndex if needed
      const newIdx = statusOptions.indexOf(refreshedTrip.status);
      setStatusIndex(newIdx);
    }
  };

  if (!trip) {
    return <div>Loading assigned trip...</div>;
  }

  return (
    <div>
      <h2>My Trip</h2>
      <p><strong>Route:</strong> {trip.route}</p>
      <p><strong>Customer:</strong> {trip.customer_name}</p>
      <p><strong>Truck:</strong> {trip.truck_name}</p>
      <p><strong>Start Location:</strong> {trip.start_location}</p>
      <p><strong>End Location:</strong> {trip.end_location}</p>
      <p><strong>Started:</strong> {trip.created_at}</p>

      <p><strong>Current Status:</strong> {trip.status}</p>

      {canUpdateStatus ? (
           <button
             onClick={updateStatus}
             style={{
               background: '#7C63FF',
               color: '#fff',
               border: 'none',
               padding: '8px 16px',
               borderRadius: '4px',
               cursor: 'pointer'
             }}
           >
             {nextStatus}
           </button>
      ) : (
        <p>Trip completed.</p>
      )}
    </div>
  );
}