'use client';
import { FiDollarSign, FiCalendar, FiClipboard } from 'react-icons/fi';

export default function PaymentStats({ stats }) {
  const {
  totalReceivables = 0,
  totalReceived = 0,
  pendingAmount = 0,
  overduePayments = 0,
} = stats || {};

  return (
    <div style={s.statsGrid}>
      <div style={s.statsCard}>
        <div style={s.statsIcon}>
         <FiDollarSign style={{ fontSize: 24, color: '#7C63FF' }} />
        </div>
        <div>
          <p style={s.statsLabel}>Total Receivables</p>
          <h3 style={s.statsValue}>${totalReceivables.toLocaleString()}</h3>
        </div>
      </div>

      <div style={s.statsCard}>
        <div style={s.statsIcon}>
          <FiCalendar style={{ fontSize: 24, color: '#22C55E' }} />
        </div>
        <div>
          <p style={s.statsLabel}>Total Received</p>
          <h3 style={s.statsValue}>${totalReceived.toLocaleString()}</h3>
        </div>
      </div>

      <div style={s.statsCard}>
        <div style={s.statsIcon}>
          <FiClipboard style={{ fontSize: 24, color: '#FB923C' }} />
        </div>
        <div>
          <p style={s.statsLabel}>Pending Amount</p>
          <h3 style={s.statsValue}>${pendingAmount.toLocaleString()}</h3>
        </div>
      </div>

      <div style={s.statsCard}>
        <div style={s.statsIcon}>
          <FiCalendar style={{ fontSize: 24, color: '#EF4444' }} />
        </div>
        <div>
          <p style={s.statsLabel}>Overdue Payments</p>
          <h3 style={s.statsValue}>{overduePayments}</h3>
        </div>
      </div>
    </div>
  );
}

const s = {
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 24,
  },
  statsCard: {
    background: '#fff',
    border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 18,
    padding: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  statsIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: 'rgba(124,99,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsLabel: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.4)',
    margin: '0 0 6px',
  },
  statsValue: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 20,
    fontWeight: 700,
    margin: 0,
    color: '#1A1A1F',
  },
};