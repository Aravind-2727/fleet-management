'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';

import StatsCards from '../../components/dashboard/StatsCards';
import RecentTrips from '../../components/dashboard/RecentTrips';
import RecentExpenses from '../../components/dashboard/RecentExpenses';
import ActiveDrivers from '../../components/dashboard/ActiveDrivers';
import FleetStatus from '../../components/dashboard/FleetStatus';
import RevenueExpenseChart from '../../components/dashboard/RevenueExpenseChart';
import NotificationsPanel from '../../components/dashboard/NotificationsPanel';
import DashboardAlertCards from '../../components/dashboard/DashboardAlertCards';
import NotificationPanel from '../../components/dashboard/NotificationPanel';

export default function Dashboard() {
const { user, loading, role } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [drivers, setDrivers] = useState([]);
  const [driversLoading, setDriversLoading] = useState(true);
  const [trucks, setTrucks] = useState([]);
  const [trucksLoading, setTrucksLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0, totalExpenses: 0, netProfit: 0,
    chartData: [], loading: true, error: null
  });
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsError, setNotificationsError] = useState(null);
  const [pendingSettlements, setPendingSettlements] = useState(0);
  const [pendingCustomerPayments, setPendingCustomerPayments] = useState(0);
  const [overduePayments, setOverduePayments] = useState(0);
  const [tripsInTransit, setTripsInTransit] = useState(0);
  const [tripsWaitingForDelivery, setTripsWaitingForDelivery] = useState(0);
  const [deliveredTripsPendingSettlement, setDeliveredTripsPendingSettlement] = useState(0);
  const [driverPayableBalance, setDriverPayableBalance] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    const fetchExpenses = async () => {
      try {
        const { data, error } = await supabase
          .from('trip_expenses').select('*')
          .eq('owner_id', user.id)
          .order('expense_date', { ascending: false }).limit(5);
        if (!error) setExpenses(data || []);
      } catch (e) { console.error(e); }
      finally { setExpensesLoading(false); }
    };
    fetchExpenses();
  }, [user]);

  useEffect(() => {
    if (!user) { setDriversLoading(false); return; }
    const fetchDrivers = async () => {
      try {
        const { data, error } = await supabase
          .from('drivers').select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false }).limit(5);
        if (!error) setDrivers(data || []);
      } catch (e) { console.error(e); }
      finally { setDriversLoading(false); }
    };
    fetchDrivers();
  }, [user]);

  useEffect(() => {
    if (!user) { setTrucksLoading(false); return; }
    const fetchTrucks = async () => {
      try {
        const { data, error } = await supabase
          .from('trucks').select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });
        if (!error) setTrucks(data || []);
      } catch (e) { console.error(e); }
      finally { setTrucksLoading(false); }
    };
    fetchTrucks();
  }, [user]);

  useEffect(() => {
    if (!user) { setAnalytics(prev => ({ ...prev, loading: false })); return; }
    const fetchAnalytics = async () => {
      try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const iso = sixMonthsAgo.toISOString();

        const [tripsRes, expRes] = await Promise.all([
          supabase.from('trips').select('freight_amount, created_at')
            .eq('owner_id', user.id).gte('created_at', iso),
          supabase.from('trip_expenses').select('amount, expense_date')
            .eq('owner_id', user.id).gte('expense_date', iso)
        ]);

        const tripsData = tripsRes.data || [];
        const expData = expRes.data || [];
        const totalRevenue = tripsData.reduce((s, t) => s + (t.freight_amount || 0), 0);
        const totalExpenses = expData.reduce((s, e) => s + (e.amount || 0), 0);

        const processMonthly = (data, isRevenue) => {
          const result = {};
          const now = new Date();
          for (let i = 5; i >= 0; i--) {
            const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = m.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            result[key] = data
              .filter(item => {
                const d = new Date(isRevenue ? item.created_at : item.expense_date);
                return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
              })
              .reduce((s, item) => s + (isRevenue ? (item.freight_amount || 0) : (item.amount || 0)), 0);
          }
          return result;
        };

        const revData = processMonthly(tripsData, true);
        const expMonthly = processMonthly(expData, false);
        const chartData = Object.keys(revData).map(month => ({
          month, revenue: revData[month], expenses: expMonthly[month] || 0
        }));

        setAnalytics({ totalRevenue, totalExpenses, netProfit: totalRevenue - totalExpenses, chartData, loading: false, error: null });
      } catch (e) {
        setAnalytics({ totalRevenue: 0, totalExpenses: 0, netProfit: 0, chartData: [], loading: false, error: e.message });
      }
    };
    fetchAnalytics();
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    setNotificationsLoading(true);
    setNotificationsError(null);
    try {
      const [tripsRes, custRes, drvRes] = await Promise.all([
        supabase.from('trips').select('id, truck_id, driver_id, freight_amount, status, created_at')
          .eq('owner_id', user.id).eq('status', 'pending_settlement').order('created_at', { ascending: false }),
        supabase.from('trips').select('id, freight_amount, received_amount')
          .eq('owner_id', user.id),
        supabase.from('drivers').select('id, profile_id, payment_status, created_at, profiles(name)')
          .eq('owner_id', user.id).eq('payment_status', 'pending').order('created_at', { ascending: false })
      ]);

      const newNotifications = [];
      const trips = tripsRes.data || [];
      const allTrips = custRes.data || [];
      const cust = allTrips.filter(t => (t.received_amount || 0) < (t.freight_amount || 0));
      const drv = drvRes.data || [];

      if (trips.length > 0) newNotifications.push({
        id: 'trips-pending-settlement', title: 'Trips Pending Settlement',
        description: `${trips.length} completed trips awaiting final settlement`,
        count: trips.length, priority: trips.length >= 3 ? 'high' : 'medium',
        time: `${trips.length} trip${trips.length > 1 ? 's' : ''}`, action: '/trips', actionText: 'View'
      });
      if (cust.length > 0) newNotifications.push({
        id: 'customer-payments', title: 'Pending Customer Payments',
        description: `${cust.length} customer payments awaiting processing`,
        count: cust.length, priority: cust.length >= 3 ? 'high' : 'medium',
        time: `${cust.length} payment${cust.length > 1 ? 's' : ''}`, action: '/payments', actionText: 'Process'
      });
      if (drv.length > 0) newNotifications.push({
        id: 'drivers-awaiting-payment', title: 'Drivers Awaiting Payment',
        description: `${drv.length} drivers with pending payouts`,
        count: drv.length, priority: drv.length >= 3 ? 'high' : 'medium',
        time: `${drv.length} driver${drv.length > 1 ? 's' : ''}`, action: '/drivers', actionText: 'Pay'
      });

      setNotifications(newNotifications);
    } catch (e) {
      setNotificationsError(e.message);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const fetchAlertData = async () => {
    if (!user) return;
    try {
      const [settlRes, custRes, overdueRes, transitRes, waitRes, delivRes, payableRes] = await Promise.all([
        supabase.from('trips').select('id').eq('owner_id', user.id).eq('status', 'pending_settlement'),
        supabase.from('trips').select('id, freight_amount, received_amount').eq('owner_id', user.id),
        supabase.from('trips').select('id, freight_amount, received_amount, status').eq('owner_id', user.id).eq('status', 'delivered'),
        supabase.from('trips').select('id').eq('owner_id', user.id).eq('status', 'in_transit'),
        supabase.from('trips').select('id').eq('owner_id', user.id).eq('status', 'waiting_for_delivery'),
        supabase.from('trips').select('id').eq('owner_id', user.id).eq('status', 'delivered').eq('close_status', true),
        supabase.from('settlements').select('net_payable').eq('owner_id', user.id).eq('payment_status', 'pending')
      ]);

      const allTrips = custRes.data || [];
      const deliveredTrips = overdueRes.data || [];
      setPendingSettlements(settlRes.data?.length || 0);
      setPendingCustomerPayments(allTrips.filter(t => (t.received_amount || 0) < (t.freight_amount || 0)).length);
      setOverduePayments(deliveredTrips.filter(t => (t.received_amount || 0) < (t.freight_amount || 0)).length);
      setTripsInTransit(transitRes.data?.length || 0);
      setTripsWaitingForDelivery(waitRes.data?.length || 0);
      setDeliveredTripsPendingSettlement(delivRes.data?.length || 0);
      setDriverPayableBalance(payableRes.data?.reduce((s, i) => s + (i.net_payable || 0), 0) || 0);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    fetchAlertData();
  }, [user]);
useEffect(() => {
  if (loading) return;
  if (!user) {
    router.replace('/');
    return;
  }
  if (role === 'driver') {
    router.replace('/driver/home');
  }
}, [user, role, loading, router]);
  if (loading) {
    return (
      <div style={s.center}>
        <div style={s.spinnerRing}><div style={s.spinner} /></div>
        <p style={s.muted}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={s.shell}>
      <StatsCards />

      <NotificationsPanel
        notifications={notifications}
        notificationsLoading={notificationsLoading}
        notificationsError={notificationsError}
        onRefresh={fetchNotifications}
        onAction={(path) => router.push(path)}
      />

      <DashboardAlertCards
        pendingSettlements={pendingSettlements}
        pendingReceivables={pendingCustomerPayments}
        activeTrips={tripsInTransit + tripsWaitingForDelivery}
        deliveredTripsPendingSettlement={deliveredTripsPendingSettlement}
        driverPayableBalance={driverPayableBalance}
        onNavigate={(path) => router.push(path)}
      />

      <NotificationPanel
        pendingSettlements={pendingSettlements}
        pendingCustomerPayments={pendingCustomerPayments}
        overduePayments={overduePayments}
        tripsInTransit={tripsInTransit}
        tripsWaitingForDelivery={tripsWaitingForDelivery}
        onNavigate={(path) => router.push(path)}
      />

      <RecentTrips />
      <RecentExpenses expenses={expenses} expensesLoading={expensesLoading} />
      <ActiveDrivers drivers={drivers} driversLoading={driversLoading} />
      <FleetStatus trucks={trucks} trucksLoading={trucksLoading} />
      <RevenueExpenseChart analytics={analytics} />
    </div>
  );
}

const s = {
  center: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', gap: 16,
  },
  spinnerRing: {
    width: 56, height: 56, borderRadius: '50%',
    border: '1px solid rgba(124,99,255,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  spinner: {
    width: 36, height: 36, borderRadius: '50%',
    border: '2px solid rgba(124,99,255,0.1)',
    borderTop: '2px solid #7C63FF',
    animation: 'spin 0.8s linear infinite',
  },
  muted: {
    fontFamily: "'Space Grotesk', sans-serif",
    color: 'rgba(20,20,30,0.45)', fontSize: 13,
  },
  shell: {
    display: 'flex', flexDirection: 'column',
    gap: 24, paddingBottom: 40, width: '100%',
  },
};