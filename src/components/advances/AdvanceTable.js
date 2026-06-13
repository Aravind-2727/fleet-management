'use client';

export default function AdvanceTable({ advances, updateAdvanceStatus, deleteAdvance }) {
  if (advances.length === 0) {
    return <div style={s.empty}>No advance requests found</div>;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return s.statusPending;
      case 'approved':
        return s.statusApproved;
      case 'paid':
        return s.statusPaid;
      case 'rejected':
        return s.statusRejected;
      default:
        return s.statusDefault;
    }
  };

  return (
    <div style={s.tableCard}>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>Driver</th>
            <th style={s.th}>Amount</th>
            <th style={s.th}>Reason</th>
            <th style={s.th}>Status</th>
            <th style={s.th}>Requested Date</th>
            <th style={s.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {advances.map((advance) => (
            <tr key={advance.id} style={s.tr}>
              <td style={s.td}>{advance.driver_name || 'Unknown'}</td>
              <td style={s.td}>${advance.amount.toLocaleString()}</td>
              <td style={s.td}>{advance.reason}</td>
              <td style={s.td}>
                <select
                  value={advance.status}
                  onChange={(e) => updateAdvanceStatus(advance.id, e.target.value)}
                  style={{ ...s.statusSelect, backgroundColor: getStatusColor(advance.status) }}
                  disabled={advance.status === 'paid'}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="paid">Paid</option>
                  <option value="rejected">Rejected</option>
                </select>
              </td>
              <td style={s.td}>{new Date(advance.requested_date).toLocaleDateString()}</td>
              <td style={{ ...s.td, textAlign: 'right' }}>
                <button onClick={() => deleteAdvance(advance.id)} style={s.deleteBtn}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const s = {
  tableCard: {
    background: '#fff',
    border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 18,
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '14px 20px',
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.4)',
    borderBottom: '1px solid rgba(20,20,30,0.07)',
  },
  tr: {
    borderBottom: '1px solid rgba(20,20,30,0.05)',
  },
  td: {
    padding: '14px 20px',
    fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
  },
  statusSelect: {
    border: 'none',
    borderRadius: 20,
    padding: '4px 12px',
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
    color: '#fff',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
    paddingRight: 32,
  },
  deleteBtn: {
    background: 'rgba(224,82,74,0.1)',
    border: '1px solid rgba(224,82,74,0.25)',
    color: '#E0524A',
    padding: '7px 16px', borderRadius: 10,
    cursor: 'pointer', fontWeight: 600, fontSize: 13,
    fontFamily: "'Outfit', sans-serif",
  },

  /* ── STATUS COLORS ── */
  statusPending: {
    background: 'rgba(251,146,60,0.1)',
    border: '1px solid rgba(251,146,60,0.25)',
    color: '#FB923C',
  },
  statusApproved: {
    background: 'rgba(59,130,246,0.1)',
    border: '1px solid rgba(59,130,246,0.25)',
    color: '#3B82F6',
  },
  statusPaid: {
    background: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.25)',
    color: '#22C55E',
  },
  statusRejected: {
    background: 'rgba(107,114,128,0.1)',
    border: '1px solid rgba(107,114,128,0.25)',
    color: '#6B7280',
  },
  statusDefault: {
    background: 'rgba(107,114,128,0.1)',
    border: '1px solid rgba(107,114,128,0.25)',
    color: '#6B7280',
  },

  /* ── EMPTY STATE ── */
  empty: {
    background: '#fff',
    border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 18, padding: '40px 0',
    textAlign: 'center',
    fontFamily: "'Space Grotesk', sans-serif",
    color: 'rgba(20,20,30,0.35)', fontSize: 13,
  },
};