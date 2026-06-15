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
import WelcomePanel from '../../components/dashboard/WelcomePanel';


export default function Dashboard() {
  const { user, loading } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [drivers, setDrivers] = useState([]);
  const [driversLoading, setDriversLoading] = useState(true);
  const [trucks, setTrucks] = useState([]);
  const [trucksLoading, setTrucksLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    chartData: [],
    loading: true,
    error: null
  });
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsError, setNotificationsError] = useState(null);
  const [pendingAdvances, setPendingAdvances] = useState(0);
  const [pendingSettlements, setPendingSettlements] = useState(0);
  const [pendingCustomerPayments, setPendingCustomerPayments] = useState(0);
  const [overduePayments, setOverduePayments] = useState(0);
  const [tripsInTransit, setTripsInTransit] = useState(0);
  const [tripsWaitingForDelivery, setTripsWaitingForDelivery] = useState(0);
  const router = useRouter();


  // ---- Recent expenses (owner-scoped) ----
  useEffect(() => {
    if (!user) {
      setExpensesLoading(false);
      return;
    }

    const fetchExpenses = async () => {
      try {
        const { data, error } = await supabase
          .from('trip_expenses')
          .select('*')
          .eq('owner_id', user.id)
          .order('expense_date', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error fetching expenses:', error);
          alert('Failed to load expenses. Please try again later.');
        } else {
          setExpenses(data || []);
        }
      } catch (error) {
        console.error('Error fetching expenses:', error);
        alert('Failed to load expenses. Please try again later.');
      } finally {
        setExpensesLoading(false);
      }
    };

    fetchExpenses();
  }, [user]);

  // ---- Drivers (owner-scoped) ----
  useEffect(() => {
    if (!user) {
      setDriversLoading(false);
      return;
    }

    const fetchDrivers = async () => {
      try {
        const { data, error } = await supabase
          .from('drivers')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error fetching drivers:', error);
          alert('Failed to load drivers. Please try again later.');
        } else {
          setDrivers(data || []);
        }
      } catch (error) {
        console.error('Error fetching drivers:', error);
        alert('Failed to load drivers. Please try again later.');
      } finally {
        setDriversLoading(false);
      }
    };

    fetchDrivers();
  }, [user]);

  // ---- Trucks (owner-scoped) ----
  useEffect(() => {
    if (!user) {
      setTrucksLoading(false);
      return;
    }

    const fetchTrucks = async () => {
      try {
        const { data, error } = await supabase
          .from('trucks')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching trucks:', error);
          alert('Failed to load trucks. Please try again later.');
        } else {
          setTrucks(data || []);
        }
      } catch (error) {
        console.error('Error fetching trucks:', error);
        alert('Failed to load trucks. Please try again later.');
      } finally {
        setTrucksLoading(false);
      }
    };

    fetchTrucks();
  }, [user]);

  // ---- Revenue / expense analytics (owner-scoped) ----
  useEffect(() => {
    if (!user) {
      setAnalytics(prev => ({ ...prev, loading: false }));
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const sixMonthsAgoISO = sixMonthsAgo.toISOString();

        const [tripsResponse, expensesResponse] = await Promise.all([
          supabase
            .from('trips')
            .select('freight_amount, created_at')
            .eq('owner_id', user.id)
            .gte('created_at', sixMonthsAgoISO)
            .order('created_at', { ascending: false }),

          supabase
            .from('trip_expenses')
            .select('amount, expense_date')
            .eq('owner_id', user.id)
            .gte('expense_date', sixMonthsAgoISO)
            .order('expense_date', { ascending: false })
        ]);

        const tripsData = tripsResponse.data || [];
        const originalExpensesData = expensesResponse.data || [];

        const totalRevenue = tripsData.reduce((sum, trip) => sum + (trip.freight_amount || 0), 0);
        const totalExpenses = originalExpensesData.reduce((sum, expense) => sum + (expense.amount || 0), 0);
        const netProfit = totalRevenue - totalExpenses;

        const processMonthlyData = (data, isRevenue = false) => {
          const monthlyData = {};
          const now = new Date();

          for (let i = 5; i >= 0; i--) {
            const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

            const total = data
              .filter(item => {
                const itemDate = new Date(isRevenue ? item.created_at : item.expense_date);
                return itemDate.getMonth() === month.getMonth() &&
                       itemDate.getFullYear() === month.getFullYear();
              })
              .reduce((sum, item) => sum + (isRevenue ? (item.freight_amount || 0) : (item.amount || 0)), 0);

            monthlyData[monthKey] = total;
          }

          return monthlyData;
        };

        const revenueData = processMonthlyData(tripsData, true);
        const monthlyExpensesData = processMonthlyData(originalExpensesData, false);

        const chartData = Object.keys(revenueData).map(month => ({
          month,
          revenue: revenueData[month],
          expenses: monthlyExpensesData[month] || 0
        }));

        if (tripsResponse.error) {
          console.error('Error fetching trips:', tripsResponse.error);
        }
        if (expensesResponse.error) {
          console.error('Error fetching expenses:', expensesResponse.error);
        }

        setAnalytics({
          totalRevenue,
          totalExpenses,
          netProfit,
          chartData,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setAnalytics({
          totalRevenue: 0,
          totalExpenses: 0,
          netProfit: 0,
          chartData: [],
          loading: false,
          error: error.message
        });
      }
    };

    fetchAnalytics();
  }, [user]);

  // ---- Notifications (owner-scoped) ----
  const fetchNotifications = async () => {
    if (!user) return;

    setNotificationsLoading(true);
    setNotificationsError(null);
    try {
      const [
        advanceRequestsResponse,
        tripsPendingSettlementResponse,
        customerPaymentsResponse,
        driversAwaitingPaymentResponse
      ] = await Promise.all([
        supabase
          .from('advance_requests')
          .select('id, amount, driver_id, status, created_at')
          .eq('owner_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false }),
        supabase
          .from('trips')
          .select('id, truck_id, driver_id, freight_amount, status, created_at')
          .eq('owner_id', user.id)
          .eq('status', 'pending_settlement')
          .order('created_at', { ascending: false }),
        supabase
          .from('customer_payments')
          .select('id, customer_id, amount, status, created_at')
          .eq('owner_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false }),
        supabase
          .from('drivers')
          .select('id, profile_id, payment_status, total_earnings, created_at, profiles(name)')
          .eq('owner_id', user.id)
          .eq('payment_status', 'pending')
          .order('created_at', { ascending: false })
      ]);

      const advanceRequests = advanceRequestsResponse.data || [];
      const tripsPendingSettlement = tripsPendingSettlementResponse.data || [];
      const customerPayments = customerPaymentsResponse.data || [];
      const driversAwaitingPayment = driversAwaitingPaymentResponse.data || [];

      const newNotifications = [];

      if (advanceRequests.length > 0) {
        newNotifications.push({
          id: 'advance-requests',
          title: 'Pending Advance Requests',
          description: `${advanceRequests.length} driver advance requests awaiting approval`,
          count: advanceRequests.length,
          priority: advanceRequests.length >= 5 ? 'high' : advanceRequests.length >= 2 ? 'medium' : 'low',
          time: advanceRequests.length === 1 ? '1 request' : `${advanceRequests.length} requests`,
          action: '/advance-requests',
          actionText: 'Review'
        });
      }

      if (tripsPendingSettlement.length > 0) {
        newNotifications.push({
          id: 'trips-pending-settlement',
          title: 'Trips Pending Settlement',
          description: `${tripsPendingSettlement.length} completed trips awaiting final settlement`,
          count: tripsPendingSettlement.length,
          priority: tripsPendingSettlement.length >= 3 ? 'high' : 'medium',
          time: tripsPendingSettlement.length === 1 ? '1 trip' : `${tripsPendingSettlement.length} trips`,
          action: '/trips',
          actionText: 'View'
        });
      }

      if (customerPayments.length > 0) {
        newNotifications.push({
          id: 'customer-payments',
          title: 'Pending Customer Payments',
          description: `${customerPayments.length} customer payments awaiting processing`,
          count: customerPayments.length,
          priority: customerPayments.length >= 3 ? 'high' : 'medium',
          time: customerPayments.length === 1 ? '1 payment' : `${customerPayments.length} payments`,
          action: '/payments',
          actionText: 'Process'
        });
      }

      if (driversAwaitingPayment.length > 0) {
        newNotifications.push({
          id: 'drivers-awaiting-payment',
          title: 'Drivers Awaiting Payment',
          description: `${driversAwaitingPayment.length} drivers with pending payouts`,
          count: driversAwaitingPayment.length,
          priority: driversAwaitingPayment.length >= 3 ? 'high' : 'medium',
          time: driversAwaitingPayment.length === 1 ? '1 driver' : `${driversAwaitingPayment.length} drivers`,
          action: '/drivers',
          actionText: 'Pay'
        });
      }

      setNotifications(newNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotificationsError(error.message);
    } finally {
      setNotificationsLoading(false);
    }
  };

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

  const handleAction = (action) => {
    router.push(action);
  };

  // ---- Alert counts (owner-scoped) ----
  const fetchAlertData = async () => {
    if (!user) return;

    try {
      const [
        advanceRequestsResponse,
        tripsPendingSettlementResponse,
        customerPaymentsResponse,
        overduePaymentsResponse,
        tripsInTransitResponse,
        tripsWaitingDeliveryResponse
      ] = await Promise.all([
        supabase
          .from('advance_requests')
          .select('id, amount, driver_id, status, created_at')
          .eq('owner_id', user.id)
          .eq('status', 'pending'),
        supabase
          .from('trips')
          .select('id, truck_id, driver_id, freight_amount, status, created_at')
          .eq('owner_id', user.id)
          .eq('status', 'pending_settlement'),
        supabase
          .from('customer_payments')
          .select('id, customer_id, amount, status, created_at')
          .eq('owner_id', user.id)
          .eq('status', 'pending'),
        supabase
          .from('customer_payments')
          .select('id, customer_id, amount, status, created_at')
          .eq('owner_id', user.id)
          .eq('status', 'overdue'),
        supabase
          .from('trips')
          .select('id, truck_id, driver_id, freight_amount, status, created_at')
          .eq('owner_id', user.id)
          .eq('status', 'in_transit'),
        supabase
          .from('trips')
          .select('id, truck_id, driver_id, freight_amount, status, created_at')
          .eq('owner_id', user.id)
          .eq('status', 'waiting_for_delivery')
      ]);

      setPendingAdvances(advanceRequestsResponse.data?.length || 0);
      setPendingSettlements(tripsPendingSettlementResponse.data?.length || 0);
      setPendingCustomerPayments(customerPaymentsResponse.data?.length || 0);
      setOverduePayments(overduePaymentsResponse.data?.length || 0);
      setTripsInTransit(tripsInTransitResponse.data?.length || 0);
      setTripsWaitingForDelivery(tripsWaitingDeliveryResponse.data?.length || 0);
    } catch (error) {
      console.error('Error fetching alert data:', error);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    fetchAlertData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div style={s.root}>
        <div style={s.center}>
          <div style={s.spinnerRing}><div style={s.spinner} /></div>
          <p style={s.muted}>Loading...</p>
        </div>
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
        onAction={handleAction}
      />

      <DashboardAlertCards
        pendingAdvances={pendingAdvances}
        pendingSettlements={pendingSettlements}
        pendingReceivables={pendingCustomerPayments}
        activeTrips={tripsInTransit + tripsWaitingForDelivery}
        onNavigate={(path) => router.push(path)}
      />

      <NotificationPanel
        pendingAdvances={pendingAdvances}
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

      <WelcomePanel />
    </div>
  );
}

const s = {
  root: {
    fontFamily: "'Outfit', sans-serif",
    background: '#F7F7FA',
    minHeight: '100vh',
    color: '#1A1A1F',
  },
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
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
};