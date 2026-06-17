'use client';

import { formatCurrency } from '../../app/lib/currency';

export default function SettlementStats({ settlements }) {
  const totalPayable = settlements.reduce((sum, s) => sum + (s.net_payable || 0), 0);
  const totalPaid = settlements.reduce((sum, s) => sum + (s.net_payable || 0) * (s.payment_status === 'paid' ? 1 : 0), 0);
  const pendingSettlements = settlements.filter(s => s.payment_status !== 'paid').length;
  const thisMonth = settlements.filter(s => {
    const date = new Date(s.payment_date || s.created_at);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div style={s.statsGrid}>
      <div style={s.statsCard}>
        <div style={s.statsIcon}>
          <i className="ti ti-wallet" style={{ fontSize: 24, color: '#7C63FF' }} />
        </div>
        <div>
          <p style={s.statsLabel}>Total Payable</p>
          <h3 style={s.statsValue}>{formatCurrency(totalPayable)}</h3>
        </div>
      </div>

      <div style={s.statsCard}>
        <div style={s.statsIcon}>
          <i className="ti ti-building-bank" style={{ fontSize: 24, color: '#22C55E' }} />
        </div>
        <div>
          <p style={s.statsLabel}>Total Paid</p>
          <h3 style={s.statsValue}>{formatCurrency(totalPaid)}</h3>
        </div>
      </div>

      <div style={s.statsCard}>
        <div style={s.statsIcon}>
          <i className="ti ti-clock" style={{ fontSize: 24, color: '#FB923C' }} />
        </div>
        <div>
          <p style={s.statsLabel}>Pending Settlements</p>
          <h3 style={s.statsValue}>{pendingSettlements}</h3>
        </div>
      </div>

      <div style={s.statsCard}>
        <div style={s.statsIcon}>
          <i className="ti ti-calendar" style={{ fontSize: 24, color: '#3B82F6' }} />
        </div>
        <div>
          <p style={s.statsLabel}>This Month</p>
          <h3 style={s.statsValue}>{thisMonth}</h3>
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