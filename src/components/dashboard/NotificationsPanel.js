'use client';

export default function NotificationsPanel({ notifications, notificationsLoading, notificationsError, onRefresh, onAction }) {
  return (
    <div style={s.recentSection}>
      <div style={s.header}>
        <h2 style={s.sectionTitle}>Notifications & Pending Actions</h2>
        <button 
          onClick={onRefresh}
          style={s.refreshBtn}
          disabled={notificationsLoading}
        >
          <i className="ti ti-refresh" style={{ fontSize: 16 }} />
          <span>Refresh</span>
        </button>
      </div>
      {notificationsLoading ? (
        <div style={s.driversLoading}>
          <div style={s.spinnerRing}><div style={s.spinner} /></div>
          <p style={s.muted}>Loading notifications...</p>
        </div>
      ) : notificationsError ? (
        <div style={s.emptyState}>
          <div style={s.emptyIcon}>
            <i className="ti ti-alert-triangle" style={{ fontSize: 24 }} />
          </div>
          <p style={s.emptyText}>Error loading notifications: {notificationsError}</p>
        </div>
      ) : notifications.length === 0 ? (
        <div style={s.emptyState}>
          <div style={s.emptyIcon}>
            <i className="ti ti-bell-off" style={{ fontSize: 24 }} />
          </div>
          <p style={s.emptyText}>No pending actions or notifications</p>
        </div>
      ) : (
        <div style={s.notificationsGrid}>
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              style={{ ...s.notificationCard, borderColor: getPriorityColor(notification.priority) }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(20,20,30,0.12)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(20,20,30,0.06)'
              }}
            >
              <div style={s.notificationHeader}>
                <div style={s.notificationTitle}>
                  <h3 style={s.notificationTitleText}>{notification.title}</h3>
                  <span style={{ ...s.priorityBadge, background: getPriorityColor(notification.priority, 0.1), color: getPriorityColor(notification.priority) }}>
                    {notification.priority}
                  </span>
                </div>
                <span style={s.notificationCount}>{notification.count}</span>
              </div>
              <p style={s.notificationDescription}>{notification.description}</p>
              <div style={s.notificationFooter}>
                <span style={s.notificationTime}>{notification.time}</span>
                <button style={s.actionBtn} onClick={() => onAction(notification.action)}>
                  {notification.actionText}
                  <i className="ti ti-chevron-right" style={{ fontSize: 16 }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
}

const s = {
  recentSection: {
    marginTop: 28,
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 24, flexWrap: 'wrap', gap: 16,
  },
  sectionTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 20, fontWeight: 600, margin: 0,
  },
  refreshBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#fff', border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 12, padding: '8px 16px',
    fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500,
    color: '#1A1A1F', cursor: 'pointer',
    transition: 'all 0.2s',
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
  notificationsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 16,
  },
  notificationCard: {
    background: '#fff',
    border: '1px solid',
    borderRadius: 16, padding: 20,
    boxShadow: '0 2px 8px rgba(20,20,30,0.06)',
    transition: 'all 0.2s',
  },
  notificationHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 16,
  },
  notificationTitle: {
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  notificationTitleText: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 16, fontWeight: 600, color: '#1A1A1F', margin: 0,
  },
  priorityBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notificationCount: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 28, fontWeight: 700, color: '#1A1A1F',
  },
  notificationDescription: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 14, color: 'rgba(20,20,30,0.7)', margin: '0 0 16px',
  },
  notificationFooter: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  notificationTime: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 12, color: 'rgba(20,20,30,0.5)',
  },
  actionBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'none', border: 'none',
    fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600,
    color: '#7C63FF', cursor: 'pointer',
  },
};