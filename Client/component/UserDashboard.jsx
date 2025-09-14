'use client'
import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Package, 
  Database, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  X, 
  AlertCircle, 
  PlusCircle, 
  User, 
  BarChart2, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Eye, 
  Globe, 
  Activity, 
  ArrowUpRight, 
  Shield, 
  Info, 
  Timer, 
  CheckCircle,
  Home,
  FileText,
  HelpCircle,
  Settings,
  Moon,
  Sun
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AnimatedCounter, CurrencyCounter } from './Animation';
import DailySalesChart from '@/app/week/page';

const DashboardPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [stats, setStats] = useState({
    balance: 0,
    todayOrders: 0,
    todayGbSold: 0,
    todayRevenue: 0,
    recentTransactions: []
  });
  
  const [animateStats, setAnimateStats] = useState(false);
  const [showSalesChart, setShowSalesChart] = useState(false);
  const [salesPeriod, setSalesPeriod] = useState('7d');
  const [showNotice, setShowNotice] = useState(true);

  // Check for dark mode preference on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      setDarkMode(true);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const ViewAll = () => {
    router.push('/orders');
  };

  const navigateToTransactions = () => {
    router.push('/myorders');
  };

  const navigateToTopup = () => {
    router.push('/topup');
  };
  
  const navigateToregisterFriend = () => {
    router.push('/registerFriend');
  }
  
  const navigateToVerificationServices = () => {
    router.push('/verification-services');
  }

  const navigateToNetwork = (network) => {
    switch(network) {
      case 'mtn':
        router.push('/mtnup2u');
        break;
      case 'airteltigo':
        router.push('/at-ishare');
        break;
      case 'telecel':
        router.push('/TELECEL');
        break;
      default:
        router.push('/');
    }
  };

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) {
      router.push('/SignUp');
      return;
    }

    const userData = JSON.parse(userDataString);
    setUserName(userData.name || 'User');
    fetchDashboardData(userData.id);
    
    const noticeDismissed = localStorage.getItem('dataDeliveryNoticeDismissed');
    if (noticeDismissed === 'true') {
      setShowNotice(false);
    }
  }, [router]);

  const fetchDashboardData = async (userId) => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('authToken');
      
      const response = await fetch(`https://kingpromise.onrender.com/api/v1/data/user-dashboard/${userId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const responseData = await response.json();
      
      if (responseData.status === 'success') {
        const { userBalance, todayOrders } = responseData.data;
        
        setStats({
          balance: userBalance,
          todayOrders: todayOrders.count,
          todayGbSold: todayOrders.totalGbSold,
          todayRevenue: todayOrders.totalValue,
          recentTransactions: todayOrders.orders.map(order => ({
            id: order._id,
            customer: order.phoneNumber,
            method: order.method,
            amount: order.price,
            gb: formatDataCapacity(order.capacity),
            time: new Date(order.createdAt).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            }),
            network: order.network
          }))
        });
        
        setLoading(false);
        
        setTimeout(() => {
          setAnimateStats(true);
        }, 300);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const formatDataCapacity = (capacity) => {
    if (capacity >= 1000) {
      return (capacity / 1000).toFixed(1);
    }
    return capacity;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2
    }).format(value);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning'; 
    if (hour < 18) return 'Good afternoon'; 
    return 'Good evening'; 
  };

  const dismissNotice = () => {
    setShowNotice(false);
    localStorage.setItem('dataDeliveryNoticeDismissed', 'true');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700"></div>
            <div className="absolute top-0 w-12 h-12 rounded-full border-2 border-transparent border-t-blue-600 animate-spin"></div>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">DataSpot</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dark Mode Toggle - Floating Button */}
        <button
          onClick={toggleDarkMode}
          className="fixed bottom-6 right-6 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 z-50"
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-700" />
          )}
        </button>

        {/* Service Notice */}
        {showNotice && (
          <div className="mb-6">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-grow">
                  <h3 className="text-sm font-medium text-amber-900 dark:text-amber-300 mb-2">Service Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Timer className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Delivery Time</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">5 min - 4 hours</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Service Hours</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">8:00 AM - 9:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={dismissNotice}
                  className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            {getGreeting()}, {userName}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Welcome to your DataSpot dashboard</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Balance Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <button
                onClick={navigateToTopup}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                Add Funds
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Available Balance</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {animateStats ? 
                <CurrencyCounter value={stats.balance} duration={1500} /> : 
                formatCurrency(0)
              }
            </p>
          </div>

          {/* Orders Today */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Orders Today</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {animateStats ? 
                <AnimatedCounter value={stats.todayOrders} duration={1200} /> : 
                "0"
              }
            </p>
          </div>

          {/* Data Sold */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Data Sold Today</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {animateStats ? 
                <><AnimatedCounter value={stats.todayGbSold} duration={1200} /> GB</> : 
                "0 GB"
              }
            </p>
          </div>

          {/* Revenue Today */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Today's Revenue</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {animateStats ? 
                <CurrencyCounter value={stats.todayRevenue} duration={1500} /> : 
                formatCurrency(0)
              }
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Network Services */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Order</h3>
            <div className="grid grid-cols-3 gap-4">
              <button 
                onClick={() => navigateToNetwork('mtn')}
                className="p-4 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800 transition-colors"
              >
                <div className="text-center">
                  <Globe className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                  <p className="font-medium text-gray-900 dark:text-white">MTN</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Data Plans</p>
                </div>
              </button>

              <button 
                onClick={() => navigateToNetwork('airteltigo')}
                className="p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors"
              >
                <div className="text-center">
                  <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <p className="font-medium text-gray-900 dark:text-white">AirtelTigo</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Data Plans</p>
                </div>
              </button>

              <button 
                onClick={() => navigateToNetwork('telecel')}
                className="p-4 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800 transition-colors"
              >
                <div className="text-center">
                  <Globe className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
                  <p className="font-medium text-gray-900 dark:text-white">Telecel</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Data Plans</p>
                </div>
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
            <div className="space-y-2">
              <button
                onClick={navigateToTopup}
                className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Add Funds</span>
                </div>
                <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500 -rotate-90" />
              </button>
              
              <button
                onClick={() => router.push('/orders')}
                className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View Orders</span>
                </div>
                <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500 -rotate-90" />
              </button>
              
              <button
                onClick={() => router.push('/support')}
                className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <HelpCircle className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Get Support</span>
                </div>
                <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500 -rotate-90" />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
              <button 
                onClick={ViewAll}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {stats.recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {stats.recentTransactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <Database className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{transaction.customer}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{transaction.gb}GB • {transaction.method}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(transaction.amount)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{transaction.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Database className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Your recent transactions will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;