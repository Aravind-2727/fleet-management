'use client';

export default function FleetStatus({ trucks, trucksLoading }) {
  return (
    <div style={s.recentSection}>
      <h2 style={s.sectionTitle}>Fleet Status Overview</h2>
      {trucksLoading ? (
        <div style={s.driversLoading}>
          <div style={s.spinnerRing}><div style={s.spinner} /></div>
          <p style={s.muted}>Loading fleet data...</p>
        </div>
      ) : trucks.length === 0 ? (
        <div style={s.emptyState}>
          <div style={s.emptyIcon}>
            <i className="ti ti-truck" style={{ fontSize: 24 }} />
          </div>
          <p style={s.emptyText}>No trucks found</p>
        </div>
      ) : (
        <div style={s.driversSummary}>
          <div style={s.summaryCard}>
            <div style={s.summaryIconGreen}>
              <i className="ti ti-check" style={{ fontSize: 20 }} />
            </div>
            <div>
              <p style={s.summaryLabel}>Available Trucks</p>
              <p style={s.summaryValueGreen}>{trucks.filter(t => t.status === 'available').length}</p>
              <p style={s.summarySubtext}>
                {trucks.length > 0 ? Math.round((trucks.filter(t => t.status === 'available').length / trucks.length) * 100) : 0}% of fleet
              </p>
            </div>
          </div>
          <div style={s.summaryCard}>
            <div style={s.summaryIconBlue}>
              <i className="ti ti-route" style={{ fontSize: 20 }} />
            </div>
            <div>
              <p style={s.summaryLabel}>On Trip Trucks</p>
              <p style={s.summaryValue}>{trucks.filter(t => t.status === 'on_trip').length}</p>
              <p style={s.summarySubtext}>
                {trucks.length > 0 ? Math.round((trucks.filter(t => t.status === 'on_trip').length / trucks.length) * 100) : 0}% of fleet
              </p>
            </div>
          </div>
          <div style={s.summaryCard}>
            <div style={s.summaryIconRed}>
              <i className="ti ti-wrench" style={{ fontSize: 20 }} />
            </div>
            <div>
              <p style={s.summaryLabel}>Maintenance Trucks</p>
              <p style={s.summaryValueRed}>{trucks.filter(t => t.status === 'maintenance').length}</p>
              <p style={s.summarySubtext}>
                {trucks.length > 0 ? Math.round((trucks.filter(t => t.status === 'maintenance').length / trucks.length) * 100) : 0}% of fleet
              </p>
            </div>
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
    display: 'flex', alignItems: 'center', gap: 16,
    boxShadow: '0 2px 8px rgba(20,20,30,0.06)',
    transition: 'all 0.2s',
  },
  summaryIconGreen: {
    width: 40, height: 40, borderRadius: 12,
    background: 'rgba(34,197,94,0.1)',
    color: '#22C55E',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  summaryIconBlue: {
    width: 40, height: 40, borderRadius: 12,
    background: 'rgba(59,130,246,0.1)',
    color: '#3B82F6',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  summaryIconRed: {
    width: 40, height: 40, borderRadius: 12,
    background: 'rgba(239,68,68,0.1)',
    color: '#EF4444',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  summaryLabel: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 12, color: 'rgba(20,20,30,0.5)', margin: '0 0 4px',
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
  summarySubtext: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11, color: 'rgba(20,20,30,0.4)', margin: '4px 0 0',
  },
};