'use client';

import { useState } from 'react';

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

  const [driverId, setDriverId] = useState('');
  const [tripId, setTripId] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');

  const selectedTrip = trips.find(t => t.id === tripId);
  const selectedDriver = drivers.find(d => d.id === driverId);

  const calculateSettlement = () => {
    if (!selectedTrip || !selectedDriver) return null;

    const earnings = selectedTrip.freight_amount || 0;

    const reimbursableExpenses = selectedTrip.expenses
      ? selectedTrip.expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
      : 0;

    const advancesDeducted = selectedTrip.advances
      ? selectedTrip.advances.reduce((sum, a) => sum + (a.amount || 0), 0)
      : 0;

    const netPayable = earnings - reimbursableExpenses - advancesDeducted;

    return {
      earnings,
      reimbursableExpenses,
      advancesDeducted,
      netPayable,
    };
  };

  const settlement = calculateSettlement();

  const handleSave = () => {
    if (!driverId || !tripId) {
      alert('Please select driver and trip');
      return;
    }

    saveSettlement(driverId, tripId, paymentMode, settlement);
  };

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
            <span>Reimbursable Expenses:</span>
            <span>-${settlement.reimbursableExpenses.toLocaleString()}</span>
          </div>
          <div style={s.calculationRow}>
            <span>Advances Deducted:</span>
            <span>-${settlement.advancesDeducted.toLocaleString()}</span>
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
        <button onClick={handleSave} style={s.saveBtn} disabled={formLoading || !settlement}>
          {formLoading ? 'Creating...' : 'Create Settlement'}
        </button>
        <button onClick={() => setShowForm(false)} style={s.cancelBtn} disabled={formLoading}>Cancel</button>
      </div>
    </div>
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