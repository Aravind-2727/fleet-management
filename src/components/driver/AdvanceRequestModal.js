'use client';

import { useState } from 'react';
import Modal from '../common/Modal';

export default function AdvanceRequestModal({ isOpen, onClose, onSuccess, driverId, userId }) {
  const [formData, setFormData] = useState({
    amount: '',
    reason: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.amount || !formData.reason) {
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
      const { error } = await supabase.from('advance_requests').insert([{
        owner_id: userId,
        driver_id: driverId,
        amount: parsedAmount,
        reason: formData.reason,
        status: 'pending',
      }]);

      if (error) {
        alert(error.message);
        return;
      }

      setFormData({ amount: '', reason: '' });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating advance:', error);
      alert('Failed to submit advance request. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div style={s.formCard}>
        <div style={s.shimmer} />
        <h3 style={s.formTitle}>Request Early Payout</h3>

        <div style={s.formGrid}>
          <div style={s.formField}>
            <label style={s.label}>Amount (₹)</label>
            <input
              type="number"
              placeholder="e.g. 2000"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              style={s.input}
            />
          </div>

          <div style={{ ...s.formField, gridColumn: 'span 2' }}>
            <label style={s.label}>Reason</label>
            <textarea
              placeholder="e.g. Emergency medical expense"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              style={{ ...s.input, minHeight: 80, resize: 'vertical' }}
            />
          </div>
        </div>

        <div style={s.formActions}>
          <button onClick={handleSave} style={s.saveBtn} disabled={saving}>
            {saving ? 'Submitting...' : 'Submit Request'}
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
