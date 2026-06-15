'use client';

export default function NotificationPanel({
  pendingAdvances,
  pendingSettlements,
  pendingCustomerPayments,
  overduePayments,
  tripsInTransit,
  tripsWaitingForDelivery,
  onNavigate
}) {
  const alerts = [
    {
      id: 'pending-advances',
      title: 'Pending Advance Requests',
      count: pendingAdvances,
      priority: pendingAdvances > 5 ? 'high' : pendingAdvances > 0 ? 'medium' : 'low',
      description: `${pendingAdvances} advance requests awaiting approval`,
      action: () => onNavigate('/advances'),
      actionText: 'Review Requests',
      icon: 'ti ti-credit-card',
      color: pendingAdvances > 0 ? '#EF4444' : '#22C55E',
    },
    {
      id: 'pending-settlements',
      title: 'Pending Driver Settlements',
      count: pendingSettlements,
      priority: pendingSettlements > 5 ? 'high' : pendingSettlements > 0 ? 'medium' : 'low',
      description: `${pendingSettlements} driver settlements pending payment`,
      action: () => onNavigate('/settlements'),
      actionText: 'Review Settlements',
      icon: 'ti ti-wallet',
      color: pendingSettlements > 0 ? '#EF4444' : '#22C55E',
    },
    {
      id: 'pending-payments',
      title: 'Pending Customer Payments',
      count: pendingCustomerPayments,
      priority: pendingCustomerPayments > 5 ? 'high' : pendingCustomerPayments > 0 ? 'medium' : 'low',
      description: `${pendingCustomerPayments} customer payments awaiting processing`,
      action: () => onNavigate('/payments'),
      actionText: 'Review Payments',
      icon: 'ti ti-building-bank',
      color: pendingCustomerPayments > 0 ? '#FB923C' : '#22C55E',
    },
    {
      id: 'overdue-payments',
      title: 'Overdue Payments',
      count: overduePayments,
      priority: overduePayments > 3 ? 'high' : overduePayments > 0 ? 'medium' : 'low',
      description: `${overduePayments} payments past due date`,
      action: () => onNavigate('/payments?status=overdue'),
      actionText: 'View Overdue',
      icon: 'ti ti-alert-circle',
      color: overduePayments > 0 ? '#EF4444' : '#22C55E',
    },
    {
      id: 'trips-in-transit',
      title: 'Trips In Transit',
      count: tripsInTransit,
      priority: tripsInTransit > 10 ? 'high' : tripsInTransit > 0 ? 'medium' : 'low',
      description: `${tripsInTransit} trips currently in progress`,
      action: () => onNavigate('/trips-management?status=in_transit'),
      actionText: 'View Trips',
      icon: 'ti ti-truck',
      color: tripsInTransit > 0 ? '#3B82F6' : '#22C55E',
    },
    {
      id: 'trips-waiting',
      title: 'Trips Waiting For Delivery',
      count: tripsWaitingForDelivery,
      priority: tripsWaitingForDelivery > 5 ? 'high' : tripsWaitingForDelivery > 0 ? 'medium' : 'low',
      description: `${tripsWaitingForDelivery} trips awaiting delivery completion`,
      action: () => onNavigate('/trips-management?status=waiting_delivery'),
      actionText: 'View Trips',
      icon: 'ti ti-box',
      color: tripsWaitingForDelivery > 0 ? '#8B5CF6' : '#22C55E',
    },
  ];

  const getPriorityColor = (priority, opacity = 1) => {
    switch (priority) {
      case 'high':
        return `rgba(239,68,68,${opacity})`;
      case 'medium':
        return `rgba(251,146,60,${opacity})`;
      case 'low':
        return `rgba(34,197,94,${opacity})`;
      default:
        return `rgba(107,114,128,${opacity})`;
    }
  };

  return (
    <div style={s.alertsContainer}>
      <div style={s.alertsHeader}>
        <h2 style={s.alertsTitle}>Fleet Alerts & Pending Actions</h2>
        <div style={s.alertsSummary}>
          {alerts.filter(a => a.count > 0).length} active alerts
        </div>
      </div>
      <div style={s.alertsGrid}>
        {alerts.map((alert) => (
          <div 
            key={alert.id}
            style={{ ...s.alertCard, borderColor: alert.color }}
            onClick={alert.action}
          >
            <div style={s.alertCardHeader}>
              <div style={{ ...s.alertIconContainer, backgroundColor: `${alert.color}15`, borderColor: `${alert.color}25` }}>
                <i className={alert.icon} style={{ fontSize: 20, color: alert.color }} />
              </div>
              <span style={{ ...s.priorityBadge, backgroundColor: `${alert.color}15`, color: alert.color }}>
                {alert.priority.toUpperCase()}
              </span>
            </div>
            <div style={s.alertCardContent}>
              <h3 style={s.alertTitle}>{alert.title}</h3>
              <div style={s.alertCount}>{alert.count}</div>
              <p style={s.alertDescription}>{alert.description}</p>
            </div>
            <div style={s.alertCardFooter}>
              <span>{alert.actionText}</span>
              <i className="ti ti-chevron-right" style={{ fontSize: 16, color: alert.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const s = {
  alertsContainer: {
    marginTop: 28,
  },
  alertsHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 24, flexWrap: 'wrap', gap: 16,
  },
  alertsTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 20, fontWeight: 600, margin: 0,
  },
  alertsSummary: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 14, color: 'rgba(20,20,30,0.6)',
    background: 'rgba(124,99,255,0.1)',
    padding: '6px 12px', borderRadius: 20,
  },
  alertsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 20,
  },
  alertCard: {
    background: '#fff',
    border: '1px solid',
    borderRadius: 16, padding: 20,
    boxShadow: '0 2px 8px rgba(20,20,30,0.06)',
    transition: 'all 0.2s',
    cursor: 'pointer',
    display: 'flex', flexDirection: 'column',
  },
  alertCardHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 16,
  },
  alertIconContainer: {
    width: 48, height: 48, borderRadius: 14,
    border: '1px solid',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  priorityBadge: {
    padding: '4px 10px', borderRadius: 20,
    fontSize: 11, fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  alertCardContent: {
    marginBottom: 16,
  },
  alertTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 16, fontWeight: 600, color: '#1A1A1F', margin: '0 0 8px',
  },
  alertCount: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 28, fontWeight: 700, color: '#1A1A1F', marginBottom: 8,
  },
  alertDescription: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 13, color: 'rgba(20,20,30,0.7)', lineHeight: 1.5,
  },
  alertCardFooter: {
    display: 'flex', alignItems: 'center', gap: 8,
    marginTop: 'auto', fontSize: 13, fontWeight: 500,
    color: '#7C63FF',
  },
};