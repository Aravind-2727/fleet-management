'use client';

import { useState } from 'react';
import Modal from '../common/Modal';

export default function ExpenseModal({ isOpen, onClose, onSuccess, trips, driverId, userId }) {
  const [formData, setFormData] = useState({
    tripId: '',
    category: 'Fuel',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.tripId || !formData.amount) {
      alert('Please fill all required fields');
      return;
    }

    const parsedAmount = parseFloat(formData.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid positive amount');
      return;
    }

    setSaving(true);
    try {
      const { supabase } = await import('../../app/lib/supabase');
      const { error } = await supabase.from('trip_expenses').insert([{
        owner_id: userId,
        trip_id: formData.tripId,
        driver_id: driverId,
        category: formData.category,
        amount: parsedAmount,
        paid_by: 'driver_paid',
        status: 'pending',
        expense_date: formData.expenseDate,
        notes: formData.notes,
      }]);

      if (error) {
        alert(error.message);
        return;
      }

      setFormData({ tripId: '', category: 'Fuel', amount: '', expenseDate: new Date().toISOString().split('T')[0], notes: '' });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating expense:', error);
      alert('Failed to submit expense. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div style={s.formCard}>
        <div style={s.shimmer} />
        <h3 style={s.formTitle}>Submit Expense</h3>

        <div style={s.formGrid}>
          <div style={s.formField}>
            <label style={s.label}>Trip</label>
            <select
              value={formData.tripId}
              onChange={(e) => setFormData({ ...formData, tripId: e.target.value })}
              style={s.input}
            >
              <option value="">Select Trip</option>
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.origin} → {trip.destination}
                </option>
              ))}
            </select>
          </div>

          <div style={s.formField}>
            <label style={s.label}>Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={s.input}
            >
              <option value="Fuel">Fuel</option>
              <option value="Toll">Toll</option>
              <option value="Food">Food</option>
              <option value="Repair">Repair</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={s.formField}>
            <label style={s.label}>Amount (₹)</label>
            <input
              type="number"
              placeholder="e.g. 500"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              style={s.input}
            />
          </div>

          <div style={s.formField}>
            <label style={s.label}>Date</label>
            <input
              type="date"
              value={formData.expenseDate}
              onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
              style={s.input}
            />
          </div>

          <div style={s.formField}>
            <label style={s.label}>Notes</label>
            <input
              placeholder="Optional notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              style={s.input}
            />
          </div>
        </div>

        <div style={s.formActions}>
          <button onClick={handleSave} style={s.saveBtn} disabled={saving}>
            {saving ? 'Submitting...' : 'Submit Expense'}
          </button>
          <button onClick={onClose} style={s.cancelBtn} disabled={saving}>Cancel</button>
        </div>
      </div>
    </Modal>
  );
}

const s = {
  formCard: {
    background: '#fff',
    border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 18, padding: 24,
    position: 'relative', overflow: 'hidden',
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
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 14, marginBottom: 20,
  },
  formField: { marginBottom: 14 },
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
    minHeight: 44,
  },
  formActions: {
    display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap',
  },
  saveBtn: {
    background: '#22C55E', color: '#fff', border: 'none',
    padding: '11px 22px', borderRadius: 12,
    cursor: 'pointer', fontWeight: 600, fontSize: 14,
    fontFamily: "'Outfit', sans-serif", minHeight: 44,
  },
  cancelBtn: {
    background: '#fff', color: 'rgba(20,20,30,0.5)',
    border: '1px solid rgba(20,20,30,0.1)',
    padding: '11px 22px', borderRadius: 12,
    cursor: 'pointer', fontWeight: 600, fontSize: 14,
    fontFamily: "'Outfit', sans-serif", minHeight: 44,
  },
};
