'use client';

export default function ReportTable({ data, columns, loading }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getColumnValue = (row, columnKey) => {
    if (columnKey === 'created_at' || columnKey === 'expense_date') {
      return new Date(row[columnKey]).toLocaleDateString();
    }
    if (columnKey === 'amount' || columnKey === 'freight_amount' || columnKey === 'earnings' || columnKey === 'pending_amount') {
      return formatCurrency(row[columnKey]);
    }
    if (columnKey === 'driver' || columnKey === 'customer') {
      return row[columnKey] || 'Unknown';
    }
    if (columnKey === 'truck') {
      return row[columnKey]?.truck_number || 'Unknown';
    }
    return row[columnKey] || '—';
  };

  if (loading) {
    return (
      <div style={s.loadingContainer}>
        <div style={s.spinnerRing}><div style={s.spinner} /></div>
        <p style={s.muted}>Loading report data...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={s.emptyState}>
        <div style={s.emptyIcon}>
          <i className="ti ti-file" style={{ fontSize: 48, color: 'rgba(20,20,30,0.3)' }} />
        </div>
        <p style={s.emptyText}>No data available for the selected filters</p>
      </div>
    );
  }

  return (
    <div style={s.tableContainer}>
      <table style={s.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={s.th}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} style={s.tr}>
              {columns.map((column) => (
                <td key={column.key} style={s.td}>
                  {getColumnValue(row, column.key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const s = {
  loadingContainer: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: 60, textAlign: 'center',
  },
  spinnerRing: {
    width: 56, height: 56, borderRadius: '50%',
    border: '1px solid rgba(124,99,255,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  spinner: {
    width: 36, height: 36, borderRadius: '50%',
    border: '2px solid rgba(124,99,255,0.1)',
    borderTop: '2px solid #7C63FF',
    animation: 'spin 0.8s linear infinite',
  },
  muted: {
    fontFamily: "'Space Grotesk', sans-serif",
    color: 'rgba(20,20,30,0.45)', fontSize: 14,
  },

  tableContainer: {
    background: '#fff',
    border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(20,20,30,0.06)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '16px 24px',
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.5)',
    background: 'rgba(124,99,255,0.05)',
    borderBottom: '1px solid rgba(20,20,30,0.07)',
  },
  tr: {
    borderBottom: '1px solid rgba(20,20,30,0.05)',
    transition: 'all 0.15s',
  },
  td: {
    padding: '16px 24px',
    fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
    color: '#1A1A1F',
  },

  emptyState: {
    background: '#fff',
    border: '1px solid rgba(20,20,30,0.07)',
    borderRadius: 16, padding: 60,
    textAlign: 'center', boxShadow: '0 2px 8px rgba(20,20,30,0.06)',
  },
  emptyIcon: {
    margin: '0 auto 16px',
  },
  emptyText: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 16, color: 'rgba(20,20,30,0.6)', margin: 0,
  },
};