'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function RevenueExpenseChart({ analytics }) {
  return (
    <div style={s.recentSection}>
      <h2 style={s.sectionTitle}>Revenue vs Expense Analytics</h2>
      {analytics.loading ? (
        <div style={s.driversLoading}>
          <div style={s.spinnerRing}><div style={s.spinner} /></div>
          <p style={s.muted}>Loading analytics data...</p>
        </div>
      ) : analytics.error ? (
        <div style={s.emptyState}>
          <div style={s.emptyIcon}>
            <i className="ti ti-alert-triangle" style={{ fontSize: 24 }} />
          </div>
          <p style={s.emptyText}>Error loading analytics: {analytics.error}</p>
        </div>
      ) : analytics.chartData.length === 0 ? (
        <div style={s.emptyState}>
          <div style={s.emptyIcon}>
            <i className="ti ti-chart-bar" style={{ fontSize: 24 }} />
          </div>
          <p style={s.emptyText}>No analytics data available</p>
        </div>
      ) : (
        <div>
          {/* ── STAT CARDS ── */}
          <div style={s.statGrid} className="dash-stat-grid">
            <div style={s.statCard}>
              <div style={{ ...s.statIcon, background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>
                <i className="ti ti-currency-rupee" style={{ fontSize: 20 }} />
              </div>
              <div style={s.shimmer} />
              <p style={s.statLabel}>Total Revenue</p>
              <p style={s.statValue}>₹{analytics.totalRevenue.toLocaleString('en-IN')}</p>
            </div>
            <div style={s.statCard}>
              <div style={{ ...s.statIcon, background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                <i className="ti ti-receipt" style={{ fontSize: 20 }} />
              </div>
              <div style={s.shimmer} />
              <p style={s.statLabel}>Total Expenses</p>
              <p style={s.statValue}>₹{analytics.totalExpenses.toLocaleString('en-IN')}</p>
            </div>
            <div style={s.statCardAccent}>
              <div style={{ ...s.statIcon, background: 'rgba(124,99,255,0.1)', color: '#7C63FF' }}>
                <i className="ti ti-chart-pie" style={{ fontSize: 20 }} />
              </div>
              <div style={s.shimmer} />
              <p style={{ ...s.statLabel, color: '#7C63FF' }}>Net Profit</p>
              <p style={{ ...s.statValue, color: '#7C63FF' }}>₹{analytics.netProfit.toLocaleString('en-IN')}</p>
            </div>
            <div style={s.statCard}>
  <div
    style={{
      ...s.statIcon,
      background: 'rgba(59,130,246,0.1)',
      color: '#3B82F6'
    }}
  >
    <i className="ti ti-wallet" style={{ fontSize: 20 }} />
  </div>

  <div style={s.shimmer} />

  <p style={s.statLabel}>Receivables</p>

  <p style={s.statValue}>₹0</p>
</div>
          </div>

          {/* ── CHART ── */}
          <div style={s.tableWrapper}>
       
        <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={analytics.chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,20,30,0.07)" />
                  <XAxis
                    dataKey="month"
                    stroke="rgba(20,20,30,0.4)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="rgba(20,20,30,0.4)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${(value / 1000)}k`}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid rgba(20,20,30,0.07)',
                      borderRadius: 8,
                      boxShadow: '0 2px 8px rgba(20,20,30,0.06)'
                    }}
                    formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#22C55E"
                    strokeWidth={3}
                    dot={{ fill: '#22C55E', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#EF4444"
                    strokeWidth={3}
                    dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Expenses"
                  />
                </LineChart>
              </ResponsiveContainer>
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
  emptyState: {
    background: '#fff',
    border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 16, padding: 40,
    textAlign: 'center', boxShadow: '0 2px 8px rgba(20,20,30,0.06)',
  },
  emptyIcon: {
    width: 56, height: 56, borderRadius: 14,
    background: 'rgba(124,99,255,0.1)',
    border: '1px solid rgba(124,99,255,0.25)',
    color: '#7C63FF',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px',
  },
  emptyText: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 14, color: 'rgba(20,20,30,0.6)', margin: 0,
  },
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
  tableWrapper: {
    background: '#fff',
    border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 16,
    overflowX: 'auto',
    boxShadow: '0 2px 8px rgba(20,20,30,0.06)',
  },
};