'use client';

export default function AdvanceStats({ summary }) {
  return (
    <div style={s.statsGrid}>
      <div style={s.statsCard}>
        <div style={s.statsIcon}>
          <i className="ti ti-clock" style={{ fontSize: 24, color: '#FB923C' }} />
        </div>
        <div>
          <p style={s.statsLabel}>Pending Requests</p>
          <h3 style={s.statsValue}>{summary.pendingCount}</h3>
        </div>
      </div>

      <div style={s.statsCard}>
        <div style={s.statsIcon}>
          <i className="ti ti-wallet" style={{ fontSize: 24, color: '#3B82F6' }} />
        </div>
        <div>
          <p style={s.statsLabel}>Approved Amount</p>
          <h3 style={s.statsValue}>${summary.approvedAmount.toLocaleString()}</h3>
        </div>
      </div>

      <div style={s.statsCard}>
        <div style={s.statsIcon}>
          <i className="ti ti-building-bank" style={{ fontSize: 24, color: '#22C55E' }} />
        </div>
        <div>
          <p style={s.statsLabel}>Paid Amount</p>
          <h3 style={s.statsValue}>${summary.paidAmount.toLocaleString()}</h3>
        </div>
      </div>

      <div style={s.statsCard}>
        <div style={s.statsIcon}>
          <i className="ti ti-x-circle" style={{ fontSize: 24, color: '#E0524A' }} />
        </div>
        <div>
          <p style={s.statsLabel}>Rejected Requests</p>
          <h3 style={s.statsValue}>{summary.rejectedCount}</h3>
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