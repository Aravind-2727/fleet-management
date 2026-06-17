'use client';

export default function DashboardAlertCards({
  pendingAdvances,
  pendingSettlements,
  pendingReceivables,
  activeTrips,
  deliveredTripsPendingSettlement,
  driverPayableBalance,
  onNavigate
}) {
  const cards = [
    {
      title: 'Pending Advances',
      count: pendingAdvances,
      priority: pendingAdvances > 0 ? 'high' : 'low',
      color: pendingAdvances > 0 ? '#EF4444' : '#22C55E',
      link: '/advances',
      icon: 'ti ti-credit-card',
    },
    {
      title: 'Pending Settlements',
      count: pendingSettlements,
      priority: pendingSettlements > 0 ? 'high' : 'low',
      color: pendingSettlements > 0 ? '#EF4444' : '#22C55E',
      link: '/settlements',
      icon: 'ti ti-wallet',
    },
    {
      title: 'Delivered Trips Pending Settlement',
      count: deliveredTripsPendingSettlement,
      priority: deliveredTripsPendingSettlement > 0 ? 'high' : 'low',
      color: deliveredTripsPendingSettlement > 0 ? '#EF4444' : '#22C55E',
      link: '/trips',
      icon: 'ti ti-box',
    },
    {
      title: 'Driver Payable Balance',
      count: `$${driverPayableBalance.toLocaleString()}`,
      priority: driverPayableBalance > 0 ? 'medium' : 'low',
      color: driverPayableBalance > 0 ? '#3B82F6' : '#22C55E',
      link: '/drivers',
      icon: 'ti ti-wallet',
    },
    {
      title: 'Pending Receivables',
      count: pendingReceivables,
      priority: pendingReceivables > 0 ? 'medium' : 'low',
      color: pendingReceivables > 0 ? '#FB923C' : '#22C55E',
      link: '/payments',
      icon: 'ti ti-building-bank',
    },
    {
      title: 'Active Trips',
      count: activeTrips,
      priority: activeTrips > 0 ? 'medium' : 'low',
      color: activeTrips > 0 ? '#3B82F6' : '#22C55E',
      link: '/trips-management',
      icon: 'ti ti-truck',
    },
  ];

  return (
    <div style={s.cardsGrid}>
      {cards.map((card, index) => (
        <div 
          key={index} 
          style={{ ...s.card, borderColor: card.color }}
          onClick={() => onNavigate(card.link)}
        >
          <div style={s.cardHeader}>
            <div style={{ ...s.iconContainer, backgroundColor: `${card.color}15`, borderColor: `${card.color}25` }}>
              <i className={card.icon} style={{ fontSize: 24, color: card.color }} />
            </div>
            <span style={{ ...s.priorityBadge, backgroundColor: `${card.color}15`, color: card.color }}>
              {card.priority.toUpperCase()}
            </span>
          </div>
          <div style={s.cardContent}>
            <h3 style={s.cardTitle}>{card.title}</h3>
            <div style={s.cardCount}>{card.count}</div>
          </div>
          <div style={s.cardFooter}>
            <span>Go to {card.title}</span>
            <i className="ti ti-chevron-right" style={{ fontSize: 16, color: card.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const s = {
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 20,
    marginBottom: 28,
  },
  card: {
    background: '#fff',
    border: '1px solid',
    borderRadius: 16, padding: 24,
    boxShadow: '0 2px 8px rgba(20,20,30,0.06)',
    transition: 'all 0.2s',
    cursor: 'pointer',
    display: 'flex', flexDirection: 'column',
  },
  cardHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 20,
  },
  iconContainer: {
    width: 56, height: 56, borderRadius: 14,
    border: '1px solid',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  priorityBadge: {
    padding: '4px 10px', borderRadius: 20,
    fontSize: 11, fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  cardContent: {
    marginBottom: 16,
  },
  cardTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 16, fontWeight: 600, color: '#1A1A1F', margin: '0 0 8px',
  },
  cardCount: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 32, fontWeight: 700, color: '#1A1A1F',
  },
  cardFooter: {
    display: 'flex', alignItems: 'center', gap: 8,
    marginTop: 'auto', fontSize: 13, fontWeight: 500,
    color: '#7C63FF',
  },
};