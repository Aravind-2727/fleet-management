'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../app/lib/supabase';
import { formatCurrency } from '../../app/lib/currency';

export default function StatsCards() {
  const [columns, setColumns] = useState(4);
  const [stats, setStats] = useState({
    totalTrucks: 0,
    totalDrivers: 0,
    activeTrips: 0,
    monthlyExpenses: 0,
    loading: true,
  });

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 480) setColumns(1);
      else if (w < 768) setColumns(2);
      else if (w < 1024) setColumns(3);
      else setColumns(4);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const [trucksRes, driversRes, tripsRes, expensesRes] = await Promise.all([
          supabase.from('trucks').select('id').eq('owner_id', user.id),
          supabase.from('drivers').select('id').eq('owner_id', user.id),
          supabase.from('trips').select('id').eq('owner_id', user.id).in('status', ['assigned', 'loading', 'in_transit', 'unloading']),
          supabase.from('trip_expenses').select('amount, expense_date').eq('owner_id', user.id),
        ]);

        const totalTrucks = trucksRes.data?.length || 0;
        const totalDrivers = driversRes.data?.length || 0;
        const activeTrips = tripsRes.data?.length || 0;

        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const monthlyExpenses = (expensesRes.data || [])
          .filter(e => e.expense_date && new Date(e.expense_date) >= new Date(monthStart))
          .reduce((sum, e) => sum + (e.amount || 0), 0);

        setStats({ totalTrucks, totalDrivers, activeTrips, monthlyExpenses, loading: false });
      } catch (e) {
        console.error('Error fetching stats:', e);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };
    fetchStats();
  }, []);

  return (
    <div style={{ ...s.statGrid, gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      <div style={s.statCard}>
        <div style={{ ...s.statIcon, ...s.statIconTruck }}>
          <i className="ti ti-truck" style={{ fontSize: 20 }} />
        </div>
        <div style={s.shimmer} />
        <p style={s.statLabel}>Total Trucks</p>
        <p style={s.statValue}>{stats.loading ? '...' : stats.totalTrucks}</p>
      </div>
      <div style={s.statCard}>
        <div style={{ ...s.statIcon, ...s.statIconDriver }}>
          <i className="ti ti-users" style={{ fontSize: 20 }} />
        </div>
        <div style={s.shimmer} />
        <p style={s.statLabel}>Total Drivers</p>
        <p style={s.statValue}>{stats.loading ? '...' : stats.totalDrivers}</p>
      </div>
      <div style={s.statCard}>
        <div style={{ ...s.statIcon, ...s.statIconTrip }}>
          <i className="ti ti-route" style={{ fontSize: 20 }} />
        </div>
        <div style={s.shimmer} />
        <p style={s.statLabel}>Active Trips</p>
        <p style={s.statValue}>{stats.loading ? '...' : stats.activeTrips}</p>
      </div>
      <div style={s.statCardAccent}>
        <div style={{ ...s.statIcon, ...s.statIconExpense }}>
          <i className="ti ti-currency-rupee" style={{ fontSize: 20 }} />
        </div>
        <div style={s.shimmer} />
        <p style={{ ...s.statLabel, color: '#7C63FF' }}>Monthly Expenses</p>
        <p style={{ ...s.statValue, color: '#7C63FF' }}>{stats.loading ? '...' : formatCurrency(stats.monthlyExpenses)}</p>
      </div>
    </div>
  );
}

const s = {
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
  statIconTruck: {
    background: 'rgba(59,130,246,0.1)', color: '#3B82F6',
  },
  statIconDriver: {
    background: 'rgba(34,197,94,0.1)', color: '#22C55E',
  },
  statIconTrip: {
    background: 'rgba(168,85,247,0.1)', color: '#A855F7',
  },
  statIconExpense: {
    background: 'rgba(251,146,60,0.1)', color: '#FB923C',
  },
};
