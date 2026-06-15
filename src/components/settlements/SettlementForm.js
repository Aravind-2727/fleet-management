'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../app/lib/supabase';

function SettlementFormInner({
  drivers,
  trips,
  settlements,
  formLoading,
  saveSettlement,
    setShowForm,
}) {
  const [driverId, setDriverId] = useState('');
  const [tripId, setTripId] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [expenses, setExpenses] = useState([]);
  const [advances, setAdvances] = useState([]);

  const selectedTrip = trips.find(t => t.id === tripId);
  const selectedDriver = drivers.find(d => d.id === driverId);

  const fetchTripExpenses = async (tripId, driverId) => {
    const { data, error } = await supabase
      .from('trip_expenses')
      .select('*')
      .eq('trip_id', tripId)
      .eq('driver_id', driverId)
      .eq('status', 'paid');

    if (error) {
      console.error('Error fetching expenses:', error);
    } else {
      setExpenses(data || []);
    }
  };

  const fetchDriverAdvances = async (driverId) => {
    const { data, error } = await supabase
      .from('advance_requests')
      .select('*')
      .eq('driver_id', driverId)
      .eq('status', 'paid');

    if (error) {
      console.error('Error fetching advances:', error);
    } else {
      setAdvances(data || []);
    }
  };

  const calculateSettlement = () => {
    if (!selectedTrip || !selectedDriver) return null;

    const earnings = selectedTrip.freight_amount || 0;

    const expensesTotal = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const advancesTotal = advances.reduce((sum, a) => sum + (a.amount || 0), 0);

    const netPayable = earnings + expensesTotal - advancesTotal;

    return {
      earnings,
      expenses: expensesTotal,
      advances: advancesTotal,
      netPayable,
    };
  };

  useEffect(() => {
    if (selectedTrip && selectedDriver) {
      fetchTripExpenses(selectedTrip.id, selectedDriver.id);
      fetchDriverAdvances(selectedDriver.id);
    }
  }, [selectedTrip, selectedDriver]);

  const settlement = calculateSettlement();

  return (
    <div style={s.formCard}>
      <div style={s.shimmer} />
      <h3 style={s.formTitle}>Create New Settlement</h3>

      <div style={s.field}>
        <label style={s.label}>Driver</label>
        <select
          value={driverId}
          onChange={(e) => {
            setDriverId(e.target.value);
            setTripId('');
          }}
          style={s.input}
        >
          <option value="">Select Driver</option>
          {drivers.map((driver) => (
            <option key={driver.id} value={driver.id}>
              {driver.profiles?.name}
            </option>
          ))}
        </select>
      </div>

      <div style={s.field}>
        <label style={s.label}>Trip</label>
        <select
          value={tripId}
          onChange={(e) => setTripId(e.target.value)}
          style={s.input}
          disabled={!driverId}
        >
          <option value="">Select Trip</option>
          {trips
            .filter(t => !driverId || t.driver_id === driverId)
            .map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.customer} - {trip.origin} to {trip.destination}
              </option>
            ))}
        </select>
      </div>

      <div style={s.field}>
        <label style={s.label}>Payment Mode</label>
        <select
          value={paymentMode}
          onChange={(e) => setPaymentMode(e.target.value)}
          style={s.input}
        >
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {settlement && (
        <div style={s.calculationCard}>
          <h4 style={s.calculationTitle}>Settlement Calculation</h4>
          <div style={s.calculationRow}>
            <span>Driver Earnings:</span>
            <span>${settlement.earnings.toLocaleString()}</span>
          </div>
          <div style={s.calculationRow}>
            <span>Expenses:</span>
            <span>+$${settlement.expenses.toLocaleString()}</span>
          </div>
          <div style={s.calculationRow}>
            <span>Advances Deducted:</span>
            <span>-${settlement.advances.toLocaleString()}</span>
          </div>
          <div style={{ ...s.calculationRow, fontWeight: 700, fontSize: 16 }}>
            <span>Net Payable:</span>
            <span style={{ color: settlement.netPayable >= 0 ? '#22C55E' : '#E0524A' }}>
              ${Math.abs(settlement.netPayable).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      <div style={s.formActions}>
        <button onClick={() => saveSettlement(driverId, tripId, paymentMode, settlement)} style={s.saveBtn} disabled={formLoading || !settlement}>
          {formLoading ? 'Creating...' : 'Create Settlement'}
        </button>
        <button onClick={() => setShowForm(false)} style={s.cancelBtn} disabled={formLoading}>Cancel</button>
      </div>
    </div>
  );
}

export default function SettlementForm({
  showForm,
  setShowForm,
  drivers,
  trips,
  settlements,
  formLoading,
  saveSettlement,
}) {
  if (!showForm) return null;

 return (
  <SettlementFormInner
    drivers={drivers}
    trips={trips}
    settlements={settlements}
    formLoading={formLoading}
    saveSettlement={saveSettlement}
    setShowForm={setShowForm}
  />
);
}

const s = {
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

  /* ── CALCULATION CARD ── */
  calculationCard: {
    background: 'rgba(124,99,255,0.05)',
    border: '1px solid rgba(124,99,255,0.15)',
    borderRadius: 12, padding: 16,
    marginBottom: 20,
  },
  calculationTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 14, fontWeight: 600, margin: '0 0 12px',
    color: '#7C63FF',
  },
  calculationRow: {
    display: 'flex', justifyContent: 'space-between',
    marginBottom: 6, fontSize: 14,
  },
};