'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../app/lib/supabase';

function PaymentFormInner({
  customers,
  trips,
  payments,
  formLoading,
  savePayment,
   setShowForm,
}) {
  const [customerId, setCustomerId] = useState('');
  const [tripId, setTripId] = useState('');
  const [freightAmount, setFreightAmount] = useState('');
  const [amountReceived, setAmountReceived] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending');

  const selectedTrip = trips.find(t => t.id === tripId);
  const selectedCustomer = customers.find(c => c.id === customerId);

  const calculatePayment = () => {
    if (!freightAmount) return null;

    const freight = parseFloat(freightAmount) || 0;
    const received = parseFloat(amountReceived) || 0;
    const pending = freight - received;

    let status = 'pending';
    if (received >= freight) {
      status = 'paid';
    } else if (received > 0 && received < freight) {
      status = 'partial';
    }

    return {
      freight,
      received,
      pending,
      status,
    };
  };

  const payment = calculatePayment();

  useEffect(() => {
    if (paymentStatus !== 'paid' && freightAmount && amountReceived) {
      const freight = parseFloat(freightAmount) || 0;
      const received = parseFloat(amountReceived) || 0;
      if (received >= freight) {
        setPaymentStatus('paid');
      } else if (received > 0 && received < freight) {
        setPaymentStatus('partial');
      }
    }
  }, [freightAmount, amountReceived]);

  return (
    <div style={s.formCard}>
      <div style={s.shimmer} />
      <h3 style={s.formTitle}>Record New Payment</h3>

      <div style={s.field}>
        <label style={s.label}>Customer</label>
        <select
          value={customerId}
          onChange={(e) => {
            setCustomerId(e.target.value);
            setTripId('');
          }}
          style={s.input}
        >
          <option value="">Select Customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.profiles?.name}
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
          disabled={!customerId}
        >
          <option value="">Select Trip</option>
          {trips
            .filter(t => !customerId || t.customer === customerId)
            .map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.customer} - {trip.origin} to {trip.destination}
              </option>
            ))}
        </select>
      </div>

      <div style={s.field}>
        <label style={s.label}>Freight Amount</label>
        <input
          type="number"
          placeholder="e.g. 5000"
          value={freightAmount}
          onChange={(e) => setFreightAmount(e.target.value)}
          style={s.input}
        />
      </div>

      <div style={s.field}>
        <label style={s.label}>Amount Received</label>
        <input
          type="number"
          placeholder="e.g. 2000"
          value={amountReceived}
          onChange={(e) => setAmountReceived(e.target.value)}
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

      {payment && (
        <div style={s.calculationCard}>
          <h4 style={s.calculationTitle}>Payment Summary</h4>
          <div style={s.calculationRow}>
            <span>Freight Amount:</span>
            <span>${payment.freight.toLocaleString()}</span>
          </div>
          <div style={s.calculationRow}>
            <span>Amount Received:</span>
            <span>${payment.received.toLocaleString()}</span>
          </div>
          <div style={s.calculationRow}>
            <span>Pending Amount:</span>
            <span>${payment.pending.toLocaleString()}</span>
          </div>
          <div style={{ ...s.calculationRow, fontWeight: 700, fontSize: 16 }}>
            <span>Status:</span>
            <span style={{ 
              color: payment.status === 'paid' ? '#22C55E' : 
                     payment.status === 'partial' ? '#FB923C' : '#6B7280'
            }}>
              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
            </span>
          </div>
        </div>
      )}

      <div style={s.formActions}>
        <button 
          onClick={() => savePayment(customerId, tripId, payment?.freight || 0, payment?.received || 0, paymentStatus)} 
          style={s.saveBtn} 
          disabled={formLoading || !payment}
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
  customers,
  trips,
  payments,
  formLoading,
  savePayment,
}) {
  if (!showForm) return null;

 return (
  <PaymentFormInner
    customers={customers}
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