'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../../components/dashboard/layout';
import ReportFilters from '@/components/reports/ReportFilters';
import ReportStats from '@/components/reports/ReportStats';
import ReportTable from '@/components/reports/ReportTable';

export default function ReportsPage({ user, onLogout }) {
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState('trip');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedTruck, setSelectedTruck] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    outstandingReceivables: 0
  });

  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);

  const [tripData, setTripData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [settlementData, setSettlementData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);

  const [filteredTripData, setFilteredTripData] = useState([]);
  const [filteredExpenseData, setFilteredExpenseData] = useState([]);
  const [filteredSettlementData, setFilteredSettlementData] = useState([]);
  const [filteredPaymentData, setFilteredPaymentData] = useState([]);

  const reports = [
    { id: 'trip', label: 'Trip Report' },
    { id: 'expense', label: 'Expense Report' },
    { id: 'settlement', label: 'Driver Settlement Report' },
    { id: 'payment', label: 'Customer Payment Report' },
  ];

  useEffect(() => {
    fetchFiltersData();
  }, []);

  useEffect(() => {
    if (activeReport === 'trip') {
      fetchTripData();
    } else if (activeReport === 'expense') {
      fetchExpenseData();
    } else if (activeReport === 'settlement') {
      fetchSettlementData();
    } else if (activeReport === 'payment') {
      fetchPaymentData();
    }
  }, [activeReport]);

  useEffect(() => {
    applyFilters();
  }, [activeReport, dateRange, selectedDriver, selectedTruck, selectedStatus, searchQuery]);

  const fetchFiltersData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const [driversResponse, trucksResponse] = await Promise.all([
        supabase.from('drivers').select('id, profiles(name)').eq('owner_id', authUser.id).limit(50),
        supabase.from('trucks').select('id, truck_number').eq('owner_id', authUser.id).limit(50),
      ]);

      setDrivers(driversResponse.data || []);
      setTrucks(trucksResponse.data || []);
    } catch (error) {
      console.error('Error fetching filters data:', error);
    }
  };

  const fetchTripData = async () => {
    setLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setTripData([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('owner_id', authUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching trip data:', error);
      } else {
        setTripData(data || []);
        calculateStats(data || [], 'trip');
      }
    } catch (error) {
      console.error('Error fetching trip data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenseData = async () => {
    setLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setExpenseData([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('trip_expenses')
        .select('*')
        .eq('owner_id', authUser.id)
        .order('expense_date', { ascending: false });

      if (error) {
        console.error('Error fetching expense data:', error);
      } else {
        setExpenseData(data || []);
        calculateStats(data || [], 'expense');
      }
    } catch (error) {
      console.error('Error fetching expense data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettlementData = async () => {
    setLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setSettlementData([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('settlements')
        .select('*')
        .eq('owner_id', authUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching settlement data:', error);
      } else {
        setSettlementData(data || []);
        calculateStats(data || [], 'settlement');
      }
    } catch (error) {
      console.error('Error fetching settlement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentData = async () => {
    setLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setPaymentData([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('customer_payments')
        .select('*')
        .eq('owner_id', authUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payment data:', error);
      } else {
        setPaymentData(data || []);
        calculateStats(data || [], 'payment');
      }
    } catch (error) {
      console.error('Error fetching payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data, reportType) => {
    let totalRevenue = 0;
    let totalExpenses = 0;
    let outstandingReceivables = 0;

    if (reportType === 'trip') {
      totalRevenue = data.reduce((sum, item) => sum + (item.freight_amount || 0), 0);
      totalExpenses = data.reduce((sum, item) => sum + (item.expenses || 0), 0);
      outstandingReceivables = data.reduce((sum, item) => sum + (item.outstanding || 0), 0);
    } else if (reportType === 'expense') {
      totalExpenses = data.reduce((sum, item) => sum + (item.amount || 0), 0);
      totalRevenue = 0;
      outstandingReceivables = data.reduce((sum, item) => sum + (item.outstanding || 0), 0);
    } else if (reportType === 'settlement') {
      totalRevenue = data.reduce((sum, item) => sum + (item.earnings || 0), 0);
      totalExpenses = data.reduce((sum, item) => sum + (item.expenses || 0), 0);
      outstandingReceivables = data.reduce((sum, item) => sum + (item.pending_amount || 0), 0);
    } else if (reportType === 'payment') {
      totalRevenue = data.reduce((sum, item) => sum + (item.amount || 0), 0);
      totalExpenses = 0;
      outstandingReceivables = data.reduce((sum, item) => sum + (item.pending_amount || 0), 0);
    }

    const netProfit = totalRevenue - totalExpenses;

    setStats({
      totalRevenue,
      totalExpenses,
      netProfit,
      outstandingReceivables
    });
  };

  const applyFilters = () => {
    let filtered = [];

    if (activeReport === 'trip') {
      filtered = tripData.filter(item => {
        const matchesDate = dateRange.start && dateRange.end
          ? new Date(item.created_at) >= new Date(dateRange.start) &&
            new Date(item.created_at) <= new Date(dateRange.end)
          : true;
        const matchesDriver = selectedDriver
          ? item.driver_id === selectedDriver
          : true;
        const matchesTruck = selectedTruck
          ? item.truck_id === selectedTruck
          : true;
        const matchesStatus = selectedStatus
          ? item.status === selectedStatus
          : true;
        const matchesSearch = searchQuery
          ? item.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.driver?.toLowerCase().includes(searchQuery.toLowerCase())
          : true;

        return matchesDate && matchesDriver && matchesTruck && matchesStatus && matchesSearch;
      });
      setFilteredTripData(filtered);
    } else if (activeReport === 'expense') {
      filtered = expenseData.filter(item => {
        const matchesDate = dateRange.start && dateRange.end
          ? new Date(item.expense_date) >= new Date(dateRange.start) &&
            new Date(item.expense_date) <= new Date(dateRange.end)
          : true;
        const matchesDriver = selectedDriver
          ? item.driver_id === selectedDriver
          : true;
        const matchesTruck = selectedTruck
          ? item.truck_id === selectedTruck
          : true;
        const matchesStatus = selectedStatus
          ? item.status === selectedStatus
          : true;
        const matchesSearch = searchQuery
          ? item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.vendor?.toLowerCase().includes(searchQuery.toLowerCase())
          : true;

        return matchesDate && matchesDriver && matchesTruck && matchesStatus && matchesSearch;
      });
      setFilteredExpenseData(filtered);
    } else if (activeReport === 'settlement') {
      filtered = settlementData.filter(item => {
        const matchesDate = dateRange.start && dateRange.end
          ? new Date(item.created_at) >= new Date(dateRange.start) &&
            new Date(item.created_at) <= new Date(dateRange.end)
          : true;
        const matchesDriver = selectedDriver
          ? item.driver_id === selectedDriver
          : true;
        const matchesTruck = selectedTruck
          ? item.truck_id === selectedTruck
          : true;
        const matchesStatus = selectedStatus
          ? item.payment_status === selectedStatus
          : true;
        const matchesSearch = searchQuery
          ? item.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.driver?.toLowerCase().includes(searchQuery.toLowerCase())
          : true;

        return matchesDate && matchesDriver && matchesTruck && matchesStatus && matchesSearch;
      });
      setFilteredSettlementData(filtered);
    } else if (activeReport === 'payment') {
      filtered = paymentData.filter(item => {
        const matchesDate = dateRange.start && dateRange.end
          ? new Date(item.created_at) >= new Date(dateRange.start) &&
            new Date(item.created_at) <= new Date(dateRange.end)
          : true;
        const matchesDriver = selectedDriver
          ? item.driver_id === selectedDriver
          : true;
        const matchesTruck = selectedTruck
          ? item.truck_id === selectedTruck
          : true;
        const matchesStatus = selectedStatus
          ? item.payment_status === selectedStatus
          : true;
        const matchesSearch = searchQuery
          ? item.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.vendor?.toLowerCase().includes(searchQuery.toLowerCase())
          : true;

        return matchesDate && matchesDriver && matchesTruck && matchesStatus && matchesSearch;
      });
      setFilteredPaymentData(filtered);
    }
  };

  const getCurrentData = () => {
    switch (activeReport) {
      case 'trip': return filteredTripData;
      case 'expense': return filteredExpenseData;
      case 'settlement': return filteredSettlementData;
      case 'payment': return filteredPaymentData;
      default: return [];
    }
  };

  const exportToCSV = () => {
    const data = getCurrentData();
    if (data.length === 0) return;

    const headers = Object.keys(data[0]).filter(key => !key.startsWith('_'));
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeReport}_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusOptions = () => {
    switch (activeReport) {
      case 'trip': return ['pending', 'in_transit', 'delivered', 'cancelled'];
      case 'expense': return ['paid', 'pending', 'cancelled'];
      case 'settlement': return ['pending', 'partial', 'paid'];
      case 'payment': return ['pending', 'partial', 'paid'];
      default: return [];
    }
  };

  const getTableColumns = () => {
    switch (activeReport) {
      case 'trip':
        return [
          { key: 'customer', label: 'Customer' },
          { key: 'driver', label: 'Driver' },
          { key: 'freight_amount', label: 'Freight Amount' },
          { key: 'status', label: 'Status' },
          { key: 'created_at', label: 'Created Date' },
        ];
      case 'expense':
        return [
          { key: 'description', label: 'Description' },
          { key: 'vendor', label: 'Vendor' },
          { key: 'amount', label: 'Amount' },
          { key: 'status', label: 'Status' },
          { key: 'expense_date', label: 'Expense Date' },
        ];
      case 'settlement':
        return [
          { key: 'customer', label: 'Customer' },
          { key: 'driver', label: 'Driver' },
          { key: 'earnings', label: 'Earnings' },
          { key: 'pending_amount', label: 'Pending Amount' },
          { key: 'payment_status', label: 'Payment Status' },
          { key: 'created_at', label: 'Created Date' },
        ];
      case 'payment':
        return [
          { key: 'customer', label: 'Customer' },
          { key: 'amount', label: 'Amount' },
          { key: 'payment_status', label: 'Payment Status' },
          { key: 'pending_amount', label: 'Pending Amount' },
          { key: 'created_at', label: 'Created Date' },
        ];
      default: return [];
    }
  };

  if (loading) {
    return (
      <div style={s.root}>
        <div style={s.center}>
          <div style={s.spinnerRing}><div style={s.spinner} /></div>
          <p style={s.muted}>Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div style={s.shell}>

        {/* ── HEADER ── */}
        <div style={s.header}>
          <div>
            <p style={s.headerSub}>Fleet</p>
            <h1 style={s.headerTitle}>Reports</h1>
          </div>

          <button onClick={exportToCSV} style={s.exportBtn} disabled={getCurrentData().length === 0}>
            <i className="ti ti-download" style={{ fontSize: 16 }} /> Export CSV
          </button>
        </div>

        {/* ── REPORT SELECTOR ── */}
        <div style={s.reportSelector}>
          {reports.map((report) => (
            <button
              key={report.id}
              onClick={() => setActiveReport(report.id)}
              style={{ ...s.reportBtn, ...(activeReport === report.id ? s.reportBtnActive : {}) }}
            >
              {report.label}
            </button>
          ))}
        </div>

        {/* ── FILTERS ── */}
        <ReportFilters
          dateRange={dateRange}
          setDateRange={setDateRange}
          selectedDriver={selectedDriver}
          setSelectedDriver={setSelectedDriver}
          selectedTruck={selectedTruck}
          setSelectedTruck={setSelectedTruck}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          drivers={drivers}
          trucks={trucks}
          statusOptions={getStatusOptions()}
        />

        {/* ── STATS CARDS ── */}
        <ReportStats stats={stats} />

        {/* ── TABLE ── */}
        <ReportTable
          data={getCurrentData()}
          columns={getTableColumns()}
          loading={loading}
        />
      </div>
    </DashboardLayout>
  );
}

function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
      @keyframes spin { to { transform: rotate(360deg); } }
      input::placeholder { color: rgba(20,20,30,0.3); }
      input:focus { outline: none; border-color: rgba(124,99,255,0.4) !important; box-shadow: 0 0 0 3px rgba(124,99,255,0.1); }
      select:focus { outline: none; border-color: rgba(124,99,255,0.4) !important; box-shadow: 0 0 0 3px rgba(124,99,255,0.1); }
      ::-webkit-scrollbar { width: 8px; height: 8px; }
      ::-webkit-scrollbar-thumb { background: rgba(20,20,30,0.1); border-radius: 8px; }
      ::-webkit-scrollbar-track { background: transparent; }
    `}</style>
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
    maxWidth: 1200,
    margin: '0 auto',
    padding: 28,
    boxSizing: 'border-box',
  },

  /* ── HEADER ── */
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 24, flexWrap: 'wrap', gap: 16,
  },
  headerSub: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'rgba(20,20,30,0.4)', margin: '0 0 6px',
  },
  headerTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: -0.5,
  },
  exportBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#7C63FF', color: '#fff', border: 'none',
    padding: '11px 20px', borderRadius: 12,
    cursor: 'pointer', fontWeight: 600, fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
    boxShadow: '0 8px 20px rgba(124,99,255,0.25)',
  },

  /* ── REPORT SELECTOR ── */
  reportSelector: {
    display: 'flex', gap: 12, marginBottom: 24,
    flexWrap: 'wrap',
  },
  reportBtn: {
    padding: '11px 22px', borderRadius: 12,
    border: '1px solid rgba(20,20,30,0.07)',
    background: '#fff', color: 'rgba(20,20,30,0.6)',
    cursor: 'pointer', fontWeight: 600, fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
    transition: 'all 0.15s',
  },
  reportBtnActive: {
    background: '#7C63FF', color: '#fff', border: 'none',
    boxShadow: '0 8px 20px rgba(124,99,255,0.25)',
  },
};
