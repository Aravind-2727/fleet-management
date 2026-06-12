'use client';

export default function StatsCards() {
  return (
    <div style={s.statGrid} className="dash-stat-grid">
      <div style={s.statCard}>
        <div style={{ ...s.statIcon, ...s.statIconTruck }}>
          <i className="ti ti-truck" style={{ fontSize: 20 }} />
        </div>
        <div style={s.shimmer} />
        <p style={s.statLabel}>Total Trucks</p>
        <p style={s.statValue}>24</p>
      </div>
      <div style={s.statCard}>
        <div style={{ ...s.statIcon, ...s.statIconDriver }}>
          <i className="ti ti-users" style={{ fontSize: 20 }} />
        </div>
        <div style={s.shimmer} />
        <p style={s.statLabel}>Total Drivers</p>
        <p style={s.statValue}>18</p>
      </div>
      <div style={s.statCard}>
        <div style={{ ...s.statIcon, ...s.statIconTrip }}>
          <i className="ti ti-route" style={{ fontSize: 20 }} />
        </div>
        <div style={s.shimmer} />
        <p style={s.statLabel}>Active Trips</p>
        <p style={s.statValue}>12</p>
      </div>
      <div style={s.statCardAccent}>
        <div style={{ ...s.statIcon, ...s.statIconExpense }}>
          <i className="ti ti-currency-rupee" style={{ fontSize: 20 }} />
        </div>
        <div style={s.shimmer} />
        <p style={{ ...s.statLabel, color: '#7C63FF' }}>Monthly Expenses</p>
        <p style={{ ...s.statValue, color: '#7C63FF' }}>₹2,45,000</p>
      </div>
    </div>
  );
}

const s = {
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    background: '#fff',
    border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 16, padding: 20,
    position: 'relative', overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(20,20,30,0.06)',
    boxSizing: 'border-box',
  },
  statCardAccent: {
    background: 'linear-gradient(135deg, #F2EEFF, #fff)',
    border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 16, padding: 20,
    position: 'relative', overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(20,20,30,0.06)',
    boxSizing: 'border-box',
  },
  shimmer: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(124,99,255,0.4), transparent)',
  },
  statLabel: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.45)', margin: '0 0 8px',
  },
  statValue: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 28, fontWeight: 700, letterSpacing: -0.5,
    color: '#1A1A1F',
  },
  statIcon: {
    width: 40, height: 40, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  statIconTruck: {
    background: 'rgba(59,130,246,0.1)', color: '#3B82F6',
  },
  statIconDriver: {
    background: 'rgba(34,197,94,0.1)', color: '#22C55E',
  },
  statIconTrip: {
    background: 'rgba(168,85,247,0.1)', color: '#A855F7',
  },
  statIconExpense: {
    background: 'rgba(251,146,60,0.1)', color: '#FB923C',
  },
};