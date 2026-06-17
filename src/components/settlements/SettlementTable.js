'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../app/lib/supabase';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount || 0);

function SettlementTableInner({ settlements, updateSettlementStatus, deleteSettlement, drivers, trips }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return s.statusPending.background;
      case 'paid':
        return s.statusPaid.background;
      case 'processing':
        return s.statusProcessing.background;
      default:
        return s.statusDefault.background;
    }
  };

  if (settlements.length === 0) {
    return <div style={s.empty}>No settlements found</div>;
  }

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
              <td style={s.td}>{drivers[settlement.driver_id] || 'Unknown'}</td>
              <td style={s.td}>{trips[settlement.trip_id] || 'Unknown'}</td>
              <td style={s.td}>{formatCurrency(settlement.earnings || 0)}</td>
              <td style={s.td}>{formatCurrency(settlement.reimbursable_expenses || 0)}</td>
              <td style={s.td}>{formatCurrency(settlement.advances_deducted || 0)}</td>
              <td style={s.td}>
                <span style={{ fontWeight: 600, color: (settlement.net_payable || 0) >= 0 ? '#22C55E' : '#E0524A' }}>
                  {formatCurrency(Math.abs(settlement.net_payable || 0))}
                </span>
              </td>
              <td style={s.td}>{settlement.payment_mode}</td>
              <td style={s.td}>
                <select
                  value={settlement.payment_status}
                  onChange={(e) => updateSettlementStatus(settlement.id, e.target.value)}
                 style={{
  ...s.statusSelect,
  ...getStatusColor(settlement.payment_status)
}}
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

export default function SettlementTable({ settlements, updateSettlementStatus, deleteSettlement }) {
  const [drivers, setDrivers] = useState({});
  const [trips, setTrips] = useState({});

  const fetchDriversAndTrips = async () => {
    const driverIds = [...new Set(settlements.map(s => s.driver_id))];
    const tripIds = [...new Set(settlements.map(s => s.trip_id))];

    // Guard against empty arrays - .in() with empty array causes error
    if (driverIds.length === 0 && tripIds.length === 0) {
      return;
    }

    if (driverIds.length > 0) {
      const { data: driversData, error: driversError } = await supabase
        .from('drivers')
        .select('id, profiles(name)')
        .in('id', driverIds);

      if (!driversError && driversData) {
        const driversMap = {};
        driversData.forEach(driver => {
          driversMap[driver.id] = driver.profiles?.name || 'Unknown';
        });
        setDrivers(driversMap);
      }
    }

    if (tripIds.length > 0) {
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select('id, customer')
        .in('id', tripIds);

      if (!tripsError && tripsData) {
        const tripsMap = {};
        tripsData.forEach(trip => {
          tripsMap[trip.id] = trip.customer || 'Unknown';
        });
        setTrips(tripsMap);
      }
    }
  };

  useEffect(() => {
    fetchDriversAndTrips();
  }, [settlements]);

  return <SettlementTableInner settlements={settlements} updateSettlementStatus={updateSettlementStatus} deleteSettlement={deleteSettlement} drivers={drivers} trips={trips} />;
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