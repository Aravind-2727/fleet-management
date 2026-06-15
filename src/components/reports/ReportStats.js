'use client';

export default function ReportStats({ stats }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const statsCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: 'ti ti-wallet',
      color: '#7C63FF',
      bgColor: 'rgba(124,99,255,0.1)',
      borderColor: 'rgba(124,99,255,0.25)',
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(stats.totalExpenses),
      icon: 'ti ti-building-bank',
      color: '#EF4444',
      bgColor: 'rgba(239,68,68,0.1)',
      borderColor: 'rgba(239,68,68,0.25)',
    },
    {
      title: 'Net Profit',
      value: formatCurrency(stats.netProfit),
      icon: 'ti ti-trending-up',
      color: stats.netProfit >= 0 ? '#22C55E' : '#EF4444',
      bgColor: stats.netProfit >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
      borderColor: stats.netProfit >= 0 ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)',
    },
    {
      title: 'Outstanding Receivables',
      value: formatCurrency(stats.outstandingReceivables),
      icon: 'ti ti-clock',
      color: '#FB923C',
      bgColor: 'rgba(251,146,60,0.1)',
      borderColor: 'rgba(251,146,60,0.25)',
    },
  ];

  return (
    <div style={s.statsGrid}>
      {statsCards.map((card, index) => (
        <div key={index} style={s.statsCard}>
          <div style={{ ...s.statsIcon, backgroundColor: card.bgColor, borderColor: card.borderColor }}>
            <i className={card.icon} style={{ fontSize: 24, color: card.color }} />
          </div>
          <div style={s.statsContent}>
            <p style={s.statsLabel}>{card.title}</p>
            <h3 style={s.statsValue}>{card.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}

const s = {
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 20,
    marginBottom: 28,
  },
  statsCard: {
    background: '#fff',
    border: '1px solid',
    borderRadius: 16, padding: 24,
    display: 'flex', alignItems: 'center', gap: 20,
    transition: 'all 0.2s',
  },
  statsIcon: {
    width: 56, height: 56, borderRadius: 14,
    border: '1px solid',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  statsContent: {
    flex: 1,
  },
  statsLabel: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.5)', marginBottom: 6,
  },
  statsValue: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 24, fontWeight: 700, margin: 0,
    color: '#1A1A1F',
  },
};