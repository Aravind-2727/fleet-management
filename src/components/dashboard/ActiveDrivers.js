'use client';

export default function ActiveDrivers({ drivers, driversLoading }) {
  return (
    <div style={s.recentSection}>
      <h2 style={s.sectionTitle}>Active Drivers</h2>
      {driversLoading ? (
        <div style={s.driversLoading}>
          <div style={s.spinnerRing}><div style={s.spinner} /></div>
          <p style={s.muted}>Loading drivers...</p>
        </div>
      ) : drivers.length === 0 ? (
        <div style={s.emptyState}>
          <div style={s.emptyIcon}>
            <i className="ti ti-users" style={{ fontSize: 24 }} />
          </div>
          <p style={s.emptyText}>No active drivers found</p>
        </div>
      ) : (
        <div>
          <div style={s.driversSummary}>
            <div style={s.summaryCard}>
              <p style={s.summaryLabel}>Total Drivers</p>
              <p style={s.summaryValue}>{drivers.length}</p>
            </div>
            <div style={s.summaryCard}>
              <p style={s.summaryLabel}>Active</p>
              <p style={s.summaryValueGreen}>{drivers.length}</p>
            </div>
            <div style={s.summaryCard}>
              <p style={s.summaryLabel}>Inactive</p>
              <p style={s.summaryValueRed}>0</p>
            </div>
          </div>
          <div style={s.driversList}>
            {drivers.map((driver) => (
              <div key={driver.id} style={s.driverCard}>
                <div style={s.driverInfo}>
                  <div style={s.driverAvatar}>
                    {driver.profiles?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={s.driverName}>{driver.profiles?.name}</p>
                    <p style={s.driverPhone}>{driver.profiles?.phone}</p>
                  </div>
                </div>
                <span style={{ ...s.statusBadge, background: driver.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(107,114,128,0.1)', color: driver.status === 'active' ? '#22C55E' : '#6B7280' }}>
                  {driver.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  recentSection: {
    marginTop: 28,
  },
  sectionTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 20, fontWeight: 600, margin: '0 0 16px',
  },
  driversLoading: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: 40, textAlign: 'center',
  },
  driversSummary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 14,
    marginBottom: 24,
  },
  summaryCard: {
    background: '#fff',
    border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 16, padding: 20,
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(20,20,30,0.06)',
  },
  summaryLabel: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 12, color: 'rgba(20,20,30,0.5)', margin: '0 0 8px',
  },
  summaryValue: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 24, fontWeight: 700, color: '#1A1A1F',
  },
  summaryValueGreen: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 24, fontWeight: 700, color: '#22C55E',
  },
  summaryValueRed: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 24, fontWeight: 700, color: '#EF4444',
  },
  driversList: {
    display: 'flex', flexDirection: 'column', gap: 16,
  },
  driverCard: {
    background: '#fff',
    border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 16, padding: 20,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    boxShadow: '0 2px 8px rgba(20,20,30,0.06)',
    transition: 'all 0.2s',
  },
  driverInfo: {
    display: 'flex', alignItems: 'center', gap: 16,
  },
  driverAvatar: {
    width: 40, height: 40, borderRadius: '50%',
    background: 'rgba(59,130,246,0.1)',
    color: '#3B82F6',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 600, fontSize: 16,
  },
  driverName: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 15, fontWeight: 600, color: '#1A1A1F', margin: '0 0 4px',
  },
  driverPhone: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 13, color: 'rgba(20,20,30,0.6)',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
};