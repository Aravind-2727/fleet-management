'use client';

export default function RecentExpenses({ expenses, expensesLoading }) {
  const getStatusColor = (status) => {
    if (status === 'paid' || status === 'approved') return '#22C55E';
    if (status === 'pending') return '#FB923C';
    return '#6B7280';
  };

  const getStatusLabel = (status) => {
    if (status === 'paid') return 'Paid';
    if (status === 'approved') return 'Approved';
    if (status === 'pending') return 'Pending';
    return status || 'Unknown';
  };

  return (
    <div style={s.recentSection}>
      <h2 style={s.sectionTitle}>Recent Expenses</h2>
      {expensesLoading ? (
        <div style={s.expensesLoading}>
          <div style={s.spinnerRing}><div style={s.spinner} /></div>
          <p style={s.muted}>Loading expenses...</p>
        </div>
      ) : expenses.length === 0 ? (
        <div style={s.emptyState}>
          <div style={s.emptyIcon}>
            <i className="ti ti-receipt" style={{ fontSize: 24 }} />
          </div>
          <p style={s.emptyText}>No expenses found</p>
        </div>
      ) : (
        <div style={s.expensesGrid}>
          {expenses.map((expense) => (
            <div key={expense.id} style={s.expenseCard}>
              <div style={s.expenseCardHeader}>
                <div>
                  <p style={s.expenseDate}>{expense.expense_date ? new Date(expense.expense_date).toLocaleDateString() : '—'}</p>
                  <p style={s.expenseType}>{expense.category || 'Other'}</p>
                </div>
                <span style={{ ...s.statusBadge, background: getStatusColor(expense.status), color: '#fff' }}>
                  {getStatusLabel(expense.status)}
                </span>
              </div>
              <div style={s.expenseBody}>
                <div style={s.vehicleInfo}>
                  <i className="ti ti-user" style={{ fontSize: 16, color: '#7C63FF' }} />
                  <span style={s.vehicleText}>{expense.paid_by === 'driver_paid' ? 'Driver Paid' : 'Company Paid'}</span>
                </div>
                <p style={s.expenseAmount}>₹{(expense.amount || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  recentSection: { marginTop: 28 },
  sectionTitle: { fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 600, margin: '0 0 16px' },
  expensesLoading: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' },
  emptyState: { background: '#fff', border: '1px solid rgba(20,20,30,0.07)', borderRadius: 16, padding: 40, textAlign: 'center', boxShadow: '0 2px 8px rgba(20,20,30,0.06)' },
  emptyIcon: { width: 56, height: 56, borderRadius: 14, background: 'rgba(124,99,255,0.1)', border: '1px solid rgba(124,99,255,0.25)', color: '#7C63FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  emptyText: { fontFamily: "'Outfit', sans-serif", fontSize: 14, color: 'rgba(20,20,30,0.6)', margin: 0 },
  expensesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  expenseCard: { background: '#fff', border: '1px solid rgba(20,20,30,0.07)', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(20,20,30,0.06)', transition: 'all 0.2s' },
  expenseCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  expenseDate: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: 'rgba(20,20,30,0.5)', margin: '0 0 4px' },
  expenseType: { fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: '#1A1A1F' },
  expenseBody: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
  vehicleInfo: { display: 'flex', alignItems: 'center', gap: 8 },
  vehicleText: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: '#7C63FF' },
  expenseAmount: { fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: '#1A1A1F' },
  statusBadge: { display: 'inline-block', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase', letterSpacing: 0.5 },
  spinnerRing: { width: 56, height: 56, borderRadius: '50%', border: '1px solid rgba(124,99,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  spinner: { width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(124,99,255,0.1)', borderTop: '2px solid #7C63FF', animation: 'spin 0.8s linear infinite' },
  muted: { fontFamily: "'Space Grotesk', sans-serif", color: 'rgba(20,20,30,0.45)', fontSize: 13 },
};
