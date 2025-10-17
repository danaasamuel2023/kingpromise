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
  Sun,
  Zap,
  ArrowDownRight,
  Menu,
  Sparkles
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
  };
  
  const navigateToVerificationServices = () => {
    router.push('/verification-services');
  };

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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="w-16 h-16 rounded-full border-3 border-blue-200 dark:border-gray-700"></div>
            <div className="absolute top-0 w-16 h-16 rounded-full border-3 border-transparent border-t-blue-600 animate-spin"></div>
          </div>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">DataSpot</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        {/* Service Notice */}
        {showNotice && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-grow">
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">Service Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Timer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Delivery Time</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">5 min - 4 hours</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Service Hours</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">7:00 AM - 9:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={dismissNotice}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Section with Dark Mode Toggle */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {getGreeting()}, {userName}! ✨
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Welcome to your DataSpot dashboard</p>
          </div>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>

        {/* Stats Grid - Mobile Optimized Yellow Rectangles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl shadow-lg p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-gray-800/20 backdrop-blur-sm rounded-xl">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <button
                  onClick={navigateToTopup}
                  className="text-xs bg-gray-800/20 hover:bg-gray-800/30 text-gray-900 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                >
                  Deposit
                </button>
              </div>
              <p className="text-gray-800 text-sm font-medium mb-1">Available Balance</p>
              <p className="text-3xl font-bold text-gray-900">
                {animateStats ? 
                  <CurrencyCounter value={stats.balance} duration={1500} /> : 
                  formatCurrency(0)
                }
              </p>
            </div>
          </div>

          {/* Orders Card */}
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl shadow-lg p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-gray-800/20 backdrop-blur-sm rounded-xl">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-gray-800 text-sm font-medium mb-1">Orders Today</p>
              <p className="text-3xl font-bold text-gray-900">
                {animateStats ? 
                  <AnimatedCounter value={stats.todayOrders} duration={1200} /> : 
                  "0"
                }
              </p>
              <p className="mt-3 text-xs text-gray-800">
                {stats.todayOrders > 0 ? `Active trading day` : 'No orders yet'}
              </p>
            </div>
          </div>

          {/* Data Volume Card */}
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl shadow-lg p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-gray-800/20 backdrop-blur-sm rounded-xl">
                  <Database className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-gray-800 text-sm font-medium mb-1">GB Sold Today</p>
              <p className="text-3xl font-bold text-gray-900">
                {animateStats ? 
                  <AnimatedCounter value={stats.todayGbSold} decimals={1} suffix=" GB" duration={1350} /> : 
                  "0 GB"
                }
              </p>
              <p className="mt-3 text-xs text-gray-800">
                Data transferred
              </p>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl shadow-lg p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-gray-800/20 backdrop-blur-sm rounded-xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-gray-800 text-sm font-medium mb-1">Revenue Today</p>
              <p className="text-3xl font-bold text-gray-900">
                {animateStats ? 
                  <CurrencyCounter value={stats.todayRevenue} duration={1500} /> : 
                  formatCurrency(0)
                }
              </p>
              <p className="mt-3 text-xs text-gray-800">
                Total earnings
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Network Services */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-blue-600" />
              Quick Order
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <button 
                onClick={() => navigateToNetwork('mtn')}
                className="group p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/30 hover:from-yellow-100 hover:to-yellow-200 rounded-xl border border-yellow-200 dark:border-yellow-800 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-yellow-500 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">MTN</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Best Prices</p>
                </div>
              </button>

              <button 
                onClick={() => navigateToNetwork('airteltigo')}
                className="group p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 hover:from-blue-100 hover:to-blue-200 rounded-xl border border-blue-200 dark:border-blue-800 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-blue-500 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">AirtelTigo</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Fast Delivery</p>
                </div>
              </button>

              <button 
                onClick={() => navigateToNetwork('telecel')}
                className="group p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30 hover:from-red-100 hover:to-red-200 rounded-xl border border-red-200 dark:border-red-800 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-red-500 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">Telecel</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Great Deals</p>
                </div>
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-600" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={navigateToTopup}
                className="w-full text-left p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-700 rounded-xl transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:scale-110 transition-transform">
                    <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Add Funds</span>
                </div>
                <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500 -rotate-90 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => router.push('/orders')}
                className="w-full text-left p-3 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-gray-700 dark:hover:to-gray-700 rounded-xl transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:scale-110 transition-transform">
                    <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View Orders</span>
                </div>
                <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500 -rotate-90 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => router.push('/support')}
                className="w-full text-left p-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-gray-700 dark:hover:to-gray-700 rounded-xl transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:scale-110 transition-transform">
                    <HelpCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Get Support</span>
                </div>
                <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500 -rotate-90 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-600" />
                Recent Transactions
              </h3>
              <button 
                onClick={ViewAll}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center space-x-1 hover:translate-x-1 transition-transform"
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
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-50 dark:from-gray-700 dark:to-gray-700 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-700 rounded-xl transition-all duration-300">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2.5 rounded-xl ${
                        transaction.network === 'YELLO' || transaction.network === 'MTN' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                        transaction.network === 'AT_PREMIUM' || transaction.network === 'airteltigo' || transaction.network === 'at' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        transaction.network === 'TELECEL' ? 'bg-red-100 dark:bg-red-900/30' :
                        'bg-purple-100 dark:bg-purple-900/30'
                      }`}>
                        <Database className={`w-5 h-5 ${
                          transaction.network === 'YELLO' || transaction.network === 'MTN' ? 'text-yellow-600 dark:text-yellow-400' :
                          transaction.network === 'AT_PREMIUM' || transaction.network === 'airteltigo' || transaction.network === 'at' ? 'text-blue-600 dark:text-blue-400' :
                          transaction.network === 'TELECEL' ? 'text-red-600 dark:text-red-400' :
                          'text-purple-600 dark:text-purple-400'
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{transaction.customer}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {transaction.gb}GB • {transaction.method}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(transaction.amount)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{transaction.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Database className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No transactions yet</p>
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