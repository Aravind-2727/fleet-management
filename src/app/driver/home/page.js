'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

export default function DriverHome() {
  const { user } = useAuth();
  const [assignedTrip, setAssignedTrip] = useState(null);
  const [pendingAdvance, setPendingAdvance] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [payableEstimate, setPayableEstimate] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const fetchDriver = async () => {
      const { data, error } = await supabase
        .from('drivers')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (error) {
        console.error('Driver fetch error:', error);
        return;
      }
      const driverId = data?.id;
      if (!driverId) return;

      // Assigned trip
      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .select('id, status, route, created_at')
        .eq('driver_id', driverId)
        .eq('status', 'assigned')
        .single();

      if (!tripError && trip) setAssignedTrip(trip);

      // Pending advance request
      const { data: advance, error: advanceError } = await supabase
        .from('advance_requests')
        .select('id, amount, status, created_at')
        .eq('driver_id', driverId)
        .eq('status', 'pending')
        .single();

      if (!advanceError && advance) setPendingAdvance(advance);

      // Recent expenses
      const { data: expenses, error: expError } = await supabase
        .from('trip_expenses')
        .select('id, amount, expense_date, description')
        .eq('driver_id', driverId)
        .order('expense_date', { ascending: false })
        .limit(5);

      if (!expError) setRecentExpenses(expenses || []);

      // Payable estimate
      const { data: settlement, error: settleError } = await supabase
        .from('settlements')
        .select('net_payable')
        .eq('driver_id', driverId)
        .eq('paid', false)
        .maybeSingle();

      if (!settleError) setPayableEstimate(settlement?.net_payable ?? 0);
    };

    fetchDriver();
  }, [user]);

  return (
    <div>
      <h2>Driver Dashboard</h2>

      {/* Assigned Trip */}
      {assignedTrip && (
        <div>
          <h3>Assigned Trip</h3>
          <p>Status: {assignedTrip.status}</p>
          <p>Route: {assignedTrip.route}</p>
          <p>Started: {assignedTrip.created_at}</p>
        </div>
      )}

      {/* Pending Advance */}
      {pendingAdvance && (
        <div>
          <h3>Pending Advance</h3>
          <p>Amount: ${pendingAdvance.amount}</p>
          <p>Requested: {pendingAdvance.created_at}</p>
        </div>
      )}

      {/* Recent Expenses */}
      <h3>Recent Expenses</h3>
      {recentExpenses.length > 0 ? (
        <ul>
        {recentExpenses.map(exp => (
          <li key={exp.id}>
            ${exp.amount} – {exp.description} ({exp.expense_date})
          </li>
        ))}
        </ul>
      ) : (
        <p>No recent expenses.</p>
      )}

      {/* Payable Estimate */}
      {payableEstimate !== null && (
        <div>
          <h3>Current Payable Estimate</h3>
          <p>${payableEstimate.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}