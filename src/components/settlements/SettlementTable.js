'use client';

export default function SettlementTable({ settlements, updateSettlementStatus, deleteSettlement }) {
  if (settlements.length === 0) {
    return <div style={s.empty}>No settlements found</div>;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return s.statusPending;
      case 'paid':
        return s.statusPaid;
      case 'processing':
        return s.statusProcessing;
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
            <th style={s.th}>Trip</th>
            <th style={s.th}>Earnings</th>
            <th style={s.th}>Reimbursable Expenses</th>
            <th style={s.th}>Advances Deducted</th>
            <th style={s.th}>Net Payable</th>
            <th style={s.th}>Payment Mode</th>
            <th style={s.th}>Status</th>
            <th style={s.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {settlements.map((settlement) => (
            <tr key={settlement.id} style={s.tr}>
              <td style={s.td}>{settlement.driver_name || 'Unknown'}</td>
              <td style={s.td}>{settlement.trip_customer || 'Unknown'}</td>
              <td style={s.td}>${settlement.earnings.toLocaleString()}</td>
              <td style={s.td}>${settlement.reimbursable_expenses.toLocaleString()}</td>
              <td style={s.td}>${settlement.advances_deducted.toLocaleString()}</td>
              <td style={s.td}>
                <span style={{ fontWeight: 600, color: settlement.net_payable >= 0 ? '#22C55E' : '#E0524A' }}>
                  ${Math.abs(settlement.net_payable).toLocaleString()}
                </span>
              </td>
              <td style={s.td}>{settlement.payment_mode}</td>
              <td style={s.td}>
                <select
                  value={settlement.payment_status}
                  onChange={(e) => updateSettlementStatus(settlement.id, e.target.value)}
                  style={{ ...s.statusSelect, backgroundColor: getStatusColor(settlement.payment_status) }}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="processing">Processing</option>
                </select>
              </td>
              <td style={{ ...s.td, textAlign: 'right' }}>
                <button onClick={() => deleteSettlement(settlement.id)} style={s.deleteBtn}>
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
  statusPaid: {
    background: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.25)',
    color: '#22C55E',
  },
  statusProcessing: {
    background: 'rgba(59,130,246,0.1)',
    border: '1px solid rgba(59,130,246,0.25)',
    color: '#3B82F6',
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