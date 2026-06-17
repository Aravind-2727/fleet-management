'use client';
const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
export default function RecentTrips() {
  return (
    <div style={s.recentSection}>
      <h2 style={s.sectionTitle}>Recent Trips</h2>
      <div style={s.tableWrapper}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.tableHeader}>Trip ID</th>
              <th style={s.tableHeader}>Truck</th>
              <th style={s.tableHeader}>Driver</th>
              <th style={s.tableHeader}>Route</th>
              <th style={s.tableHeader}>Status</th>
              <th style={s.tableHeader}>Freight Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={s.tableCell}>#TRIP-001</td>
              <td style={s.tableCell}>
                <div style={s.badgeTruck}>T-4582</div>
              </td>
              <td style={s.tableCell}>
                <div style={s.badgeDriver}>John Smith</div>
              </td>
              <td style={s.tableCell}>New York → Boston</td>
              <td style={s.tableCell}>
                <span style={s.badgeAssigned}>Assigned</span>
              </td>
              <td style={s.tableCell}>{formatCurrency(12500)}</td>
            </tr>
            <tr>
              <td style={s.tableCell}>#TRIP-002</td>
              <td style={s.tableCell}>
                <div style={s.badgeTruck}>T-7891</div>
              </td>
              <td style={s.tableCell}>
                <div style={s.badgeDriver}>Mike Johnson</div>
              </td>
              <td style={s.tableCell}>Chicago → Denver</td>
              <td style={s.tableCell}>
                <span style={s.badgeInTransit}>In Transit</span>
              </td>
              <td style={s.tableCell}>{formatCurrency(18750)}</td>
            </tr>
            <tr>
              <td style={s.tableCell}>#TRIP-003</td>
              <td style={s.tableCell}>
                <div style={s.badgeTruck}>T-2345</div>
              </td>
              <td style={s.tableCell}>
                <div style={s.badgeDriver}>Robert Davis</div>
              </td>
              <td style={s.tableCell}>Los Angeles → Phoenix</td>
              <td style={s.tableCell}>
                <span style={s.badgeDelivered}>Delivered</span>
              </td>
              <td style={s.tableCell}>{formatCurrency(9200)}</td>
            </tr>
            <tr>
              <td style={s.tableCell}>#TRIP-004</td>
              <td style={s.tableCell}>
                <div style={s.badgeTruck}>T-6789</div>
              </td>
              <td style={s.tableCell}>
                <div style={s.badgeDriver}>James Wilson</div>
              </td>
              <td style={s.tableCell}>Houston → Dallas</td>
              <td style={s.tableCell}>
                <span style={s.badgeAssigned}>Assigned</span>
              </td>
              <td style={s.tableCell}>{formatCurrency(15300)}</td>
            </tr>
            <tr>
              <td style={s.tableCell}>#TRIP-005</td>
              <td style={s.tableCell}>
                <div style={s.badgeTruck}>T-9012</div>
              </td>
              <td style={s.tableCell}>
                <div style={s.badgeDriver}>William Brown</div>
              </td>
              <td style={s.tableCell}>Seattle → Portland</td>
              <td style={s.tableCell}>
                <span style={s.badgeInTransit}>In Transit</span>
              </td>
              <td style={s.tableCell}>{formatCurrency(11800)}</td>
            </tr>
          </tbody>
        </table>
      </div>
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
  tableWrapper: {
    background: '#fff',
    border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 16,
    overflowX: 'auto',
    boxShadow: '0 2px 8px rgba(20,20,30,0.06)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: 800,
  },
  tableHeader: {
    background: 'rgba(20,20,30,0.03)',
    padding: 16, textAlign: 'left',
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 12, fontWeight: 600,
    color: 'rgba(20,20,30,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottom: '1px solid rgba(20,20,30,0.07)',
  },
  tableCell: {
    padding: 16,
    borderBottom: '1px solid rgba(20,20,30,0.07)',
    fontFamily: "'Outfit', sans-serif",
    fontSize: 14,
    color: '#1A1A1F',
  },
  badgeTruck: {
    display: 'inline-block',
    padding: '4px 10px',
    background: 'rgba(59,130,246,0.1)',
    color: '#3B82F6',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
  },
  badgeDriver: {
    display: 'inline-block',
    padding: '4px 10px',
    background: 'rgba(34,197,94,0.1)',
    color: '#22C55E',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
  },
  badgeAssigned: {
    display: 'inline-block',
    padding: '4px 10px',
    background: 'rgba(59,130,246,0.1)',
    color: '#3B82F6',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
  },
  badgeInTransit: {
    display: 'inline-block',
    padding: '4px 10px',
    background: 'rgba(168,85,247,0.1)',
    color: '#A855F7',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
  },
  badgeDelivered: {
    display: 'inline-block',
    padding: '4px 10px',
    background: 'rgba(34,197,94,0.1)',
    color: '#22C55E',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
  },
};