'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../app/lib/supabase';
import { formatCurrency } from '../../app/lib/currency';

function PaymentFormInner({
  trips,
  payments,
  formLoading,
  savePayment,
  setShowForm,
}) {
  const [tripId, setTripId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending');

  const selectedTrip = trips.find(t => t.id === tripId);

  return (
    <div style={s.formCard}>
      <div style={s.shimmer} />
      <h3 style={s.formTitle}>Record New Payment</h3>

      {/* Trip Dropdown only */}
      <div style={s.field}>
        <label style={s.label}>Trip</label>
        <select
          value={tripId}
          onChange={(e) => setTripId(e.target.value)}
          style={s.input}
          disabled={formLoading}
        >
          <option value="">Select Trip</option>
          {trips.map((trip) => (
            <option key={trip.id} value={trip.id}>
              {trip.id}
            </option>
          ))}
        </select>
      </div>

      <div style={s.field}>
        <label style={s.label}>Amount</label>
        <input
          type="number"
          placeholder="e.g. 2000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={s.input}
        />
      </div>

      <div style={s.field}>
        <label style={s.label}>Payment Status</label>
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          style={s.input}
        >
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      <div style={s.calculationCard}>
        <h4 style={s.calculationTitle}>Payment Summary</h4>
        {selectedTrip && amount && (
          <div style={s.calculationRow}>
            <span>Freight Amount:</span>
            <span>{formatCurrency(selectedTrip.freight_amount || 0) || '—'}</span>
          </div>
        )}
        <div style={s.calculationRow}>
          <span>Status:</span>
          <span style={{ 
            color: paymentStatus === 'paid' ? '#22C55E' : 
                   paymentStatus === 'partial' ? '#FB923C' : '#6B7280'
          }}>
            {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
          </span>
        </div>
      </div>

      <div style={s.formActions}>
        <button
          onClick={() => savePayment(tripId, parseFloat(amount), paymentStatus)}
          style={s.saveBtn}
          disabled={formLoading || !tripId || !amount}
        >
          {formLoading ? 'Recording...' : 'Record Payment'}
        </button>
        <button onClick={() => setShowForm(false)} style={s.cancelBtn} disabled={formLoading}>Cancel</button>
      </div>
    </div>
  );
}

export default function PaymentForm({
  showForm,
  setShowForm,
  trips,
  payments,
  formLoading,
  savePayment,
}) {
  if (!showForm) return null;

  return (
    <PaymentFormInner
      trips={trips}
      payments={payments}
      formLoading={formLoading}
      savePayment={savePayment}
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
};