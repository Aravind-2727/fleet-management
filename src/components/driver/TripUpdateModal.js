'use client';

import Modal from '../common/Modal';

export default function TripUpdateModal({ isOpen, onClose, onConfirm, nextStatus, loading }) {
  const statusLabels = {
    assigned: 'Assigned',
    loading: 'Loading',
    in_transit: 'In Transit',
    unloading: 'Unloading',
    delivered: 'Delivered',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div style={s.card}>
        <div style={s.shimmer} />
        <h3 style={s.title}>Update Trip Status</h3>
        <p style={s.text}>
          Update trip status to <strong>{statusLabels[nextStatus] || nextStatus}</strong>?
        </p>
        <div style={s.actions}>
          <button onClick={onConfirm} style={s.confirmBtn} disabled={loading}>
            {loading ? 'Updating...' : `Update to ${statusLabels[nextStatus] || nextStatus}`}
          </button>
          <button onClick={onClose} style={s.cancelBtn} disabled={loading}>Cancel</button>
        </div>
      </div>
    </Modal>
  );
}

const s = {
  card: {
    background: '#fff',
    borderRadius: 18, padding: 24,
    position: 'relative', overflow: 'hidden',
    boxSizing: 'border-box',
    textAlign: 'center',
  },
  shimmer: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(124,99,255,0.4), transparent)',
  },
  title: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 18, fontWeight: 600, margin: '0 0 12px',
    color: '#1A1A1F',
  },
  text: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 14, color: 'rgba(20,20,30,0.7)',
    margin: '0 0 20px',
  },
  actions: {
    display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap',
  },
  confirmBtn: {
    background: '#7C63FF', color: '#fff', border: 'none',
    padding: '11px 22px', borderRadius: 12,
    cursor: 'pointer', fontWeight: 600, fontSize: 14,
    fontFamily: "'Outfit', sans-serif", minHeight: 44,
    boxShadow: '0 4px 12px rgba(124,99,255,0.25)',
  },
  cancelBtn: {
    background: '#fff', color: 'rgba(20,20,30,0.5)',
    border: '1px solid rgba(20,20,30,0.1)',
    padding: '11px 22px', borderRadius: 12,
    cursor: 'pointer', fontWeight: 600, fontSize: 14,
    fontFamily: "'Outfit', sans-serif", minHeight: 44,
  },
};
