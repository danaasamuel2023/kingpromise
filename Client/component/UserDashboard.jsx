'use client'
import React, { useState, useEffect } from 'react';
import { CreditCard, Package, Database, DollarSign, TrendingUp, Calendar,X, AlertCircle, PlusCircle, User, BarChart2, ChevronDown, ChevronUp, Clock, Eye, Globe, Zap, Activity, Sparkles, ArrowUpRight, Star, Target, Flame, Award, Shield, Info, Timer, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AnimatedCounter, CurrencyCounter } from './Animation'; // Adjust the import path as necessary
import DailySalesChart from '@/app/week/page';

const DashboardPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState({
    balance: 0,
    todayOrders: 0,
    todayGbSold: 0,
    todayRevenue: 0,
    recentTransactions: []
  });
  
  // Add a state to control animation start
  const [animateStats, setAnimateStats] = useState(false);
  // Add state to control sales chart visibility
  const [showSalesChart, setShowSalesChart] = useState(false);
  // Add state for sales chart time period
  const [salesPeriod, setSalesPeriod] = useState('7d');
  // Add state for notice visibility
  const [showNotice, setShowNotice] = useState(true);

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
    // Check if user is authenticated
    // Fetch user data from localStorage
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) {
      router.push('/SignUp');
      return;
    }

    const userData = JSON.parse(userDataString);
    setUserName(userData.name || 'User');
    fetchDashboardData(userData.id);
    
    // Check if user has dismissed the notice before
    const noticeDismissed = localStorage.getItem('dataDeliveryNoticeDismissed');
    if (noticeDismissed === 'true') {
      setShowNotice(false);
    }
  }, [router]);

  // Fetch dashboard data from API
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
        // Map API data to our stats state
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
        
        // Set loading to false first
        setLoading(false);
        
        // Delay animation start slightly for better UX
        setTimeout(() => {
          setAnimateStats(true);
        }, 300);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // You might want to show an error message to the user
      setLoading(false);
    }
  };

  // Helper function to format data capacity (convert to GB if needed)
  const formatDataCapacity = (capacity) => {
    if (capacity >= 1000) {
      return (capacity / 1000).toFixed(1);
    }
    return capacity;
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Get greeting based on time of day - Ghana time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning'; 
    if (hour < 18) return 'Good afternoon'; 
    return 'Good evening'; 
  };

  // Get English greeting
  const getEnglishGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  };

  // Toggle sales chart visibility
  const toggleSalesChart = () => {
    setShowSalesChart(!showSalesChart);
  };

  // Handle time period change for sales data
  const handleSalesPeriodChange = (period) => {
    setSalesPeriod(period);
  };

  // Dismiss notice handler
  const dismissNotice = () => {
    setShowNotice(false);
    localStorage.setItem('dataDeliveryNoticeDismissed', 'true');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          {/* Compact Loading Animation */}
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-emerald-200/20"></div>
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-400 border-r-teal-400 animate-spin"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 animate-pulse flex items-center justify-center">
              <Zap className="w-4 h-4 text-white animate-bounce" strokeWidth={2} />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-transparent bg-clip-text animate-pulse">
              CHEAPDATE
            </h1>
            <div className="flex items-center justify-center space-x-1 text-emerald-300">
              <Sparkles className="w-3 h-3 animate-spin" />
              <span className="text-xs">Loading...</span>
              <Sparkles className="w-3 h-3 animate-spin" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements - Smaller */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br from-emerald-400/5 to-teal-400/5 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-gradient-to-br from-purple-400/5 to-pink-400/5 blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 py-3">
        {/* Data Delivery Notice - Compact */}
        {showNotice && (
          <div className="mb-3 animate-fadeInDown">
            <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 backdrop-blur-xl rounded-lg p-3 border border-amber-500/30 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 rounded-md bg-amber-500/20 backdrop-blur-sm flex items-center justify-center border border-amber-500/30">
                      <Timer className="w-3 h-3 text-amber-300" strokeWidth={2} />
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="text-xs font-bold text-white flex items-center space-x-1">
                          <Info className="w-3 h-3 text-amber-300" />
                          <span>Service Info</span>
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="bg-white/10 backdrop-blur-sm rounded-md p-2 border border-white/20">
                            <div className="flex items-center space-x-1">
                              <Timer className="w-3 h-3 text-amber-300" />
                              <span className="text-[10px] font-semibold text-white">Delivery</span>
                            </div>
                            <p className="text-amber-300 text-xs font-bold">5min - 4hr</p>
                          </div>
                          
                          <div className="bg-white/10 backdrop-blur-sm rounded-md p-2 border border-white/20">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-emerald-300" />
                              <span className="text-[10px] font-semibold text-white">Hours</span>
                            </div>
                            <p className="text-emerald-300 text-xs font-bold">8AM - 9PM</p>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={dismissNotice}
                        className="ml-2 text-white/60 hover:text-white transition-colors"
                        aria-label="Dismiss notice"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section - Very Compact */}
        <div className="mb-3">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-lg p-3 relative overflow-hidden shadow-lg">
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-md bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                    <Zap className="w-3 h-3 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-white">CHEAPDATE</h1>
                    <p className="text-[10px] text-white/80">{getGreeting()}, {userName}!</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={navigateToTopup}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-medium py-1.5 px-3 rounded-md border border-white/30 transition-all flex items-center space-x-1"
                  >
                    <PlusCircle className="w-3 h-3" />
                    <span className="text-xs">Top Up</span>
                  </button>
                  
                  <button 
                    onClick={() => router.push('/orders')}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-medium py-1.5 px-3 rounded-md border border-white/30 transition-all flex items-center space-x-1"
                  >
                    <Package className="w-3 h-3" />
                    <span className="text-xs">Orders</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - Very Compact */}
        <div className="mb-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {/* Balance Card - Compact */}
            <div className="col-span-2 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-lg p-3 text-white relative overflow-hidden shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-md bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/80">Balance</p>
                    <p className="text-base font-bold text-white">
                      {animateStats ? 
                        <CurrencyCounter value={stats.balance} duration={1500} /> : 
                        formatCurrency(0)
                      }
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={navigateToTopup}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium py-1 px-2 rounded-md border border-white/30 transition-all"
                >
                  <span className="text-xs">Add</span>
                </button>
              </div>
            </div>

            {/* Orders Today - Compact */}
            <div className="bg-white/10 backdrop-blur-xl rounded-lg p-3 border border-white/20">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Package className="w-3 h-3 text-emerald-400" strokeWidth={2} />
                  <span className="text-lg font-bold text-white">
                    {animateStats ? 
                      <AnimatedCounter value={stats.todayOrders} duration={1200} /> : 
                      "0"
                    }
                  </span>
                </div>
                <p className="text-white text-[10px]">Orders Today</p>
              </div>
            </div>

            {/* Revenue Today - Compact */}
            <div className="bg-white/10 backdrop-blur-xl rounded-lg p-3 border border-white/20">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <TrendingUp className="w-3 h-3 text-purple-400" strokeWidth={2} />
                  <span className="text-sm font-bold text-white">
                    {animateStats ? 
                      <CurrencyCounter value={stats.todayRevenue} duration={1500} /> : 
                      formatCurrency(0)
                    }
                  </span>
                </div>
                <p className="text-white text-[10px]">Revenue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Network Selection - Very Compact */}
        <div className="mb-3">
          <div className="bg-white/5 backdrop-blur-xl rounded-lg p-3 border border-white/20">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-3 h-3 text-emerald-400" strokeWidth={2} />
              <h2 className="text-xs font-bold text-white">Quick Order</h2>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => navigateToNetwork('mtn')}
                className="bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 rounded-md p-2 transition-all transform hover:scale-105"
              >
                <div className="text-center">
                  <p className="text-white font-bold text-xs">MTN</p>
                  <p className="text-white/80 text-[9px]">Data</p>
                </div>
              </button>

              <button 
                onClick={() => navigateToNetwork('airteltigo')}
                className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 rounded-md p-2 transition-all transform hover:scale-105"
              >
                <div className="text-center">
                  <p className="text-white font-bold text-xs">ATigo</p>
                  <p className="text-white/80 text-[9px]">Data</p>
                </div>
              </button>

              <button 
                onClick={() => navigateToNetwork('telecel')}
                className="bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 rounded-md p-2 transition-all transform hover:scale-105"
              >
                <div className="text-center">
                  <p className="text-white font-bold text-xs">Telecel</p>
                  <p className="text-white/80 text-[9px]">Data</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity - Very Compact */}
        <div className="mb-3">
          <div className="bg-white/5 backdrop-blur-xl rounded-lg border border-white/20 overflow-hidden">
            <div className="p-3 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-3 h-3 text-emerald-400" strokeWidth={2} />
                  <h2 className="text-xs font-bold text-white">Recent Activity</h2>
                </div>
                
                <button 
                  onClick={ViewAll}
                  className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium py-1 px-2 rounded-md border border-white/20 transition-all"
                >
                  <span className="text-[10px]">View All</span>
                  <ArrowUpRight className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
            
            <div className="p-3">
              {stats.recentTransactions.length > 0 ? (
                <div className="space-y-2">
                  {stats.recentTransactions.slice(0, 3).map((transaction, index) => (
                    <div key={transaction.id} className="flex items-center justify-between p-2 bg-white/5 rounded-md border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="flex items-center space-x-2">
                        <Database className="w-3 h-3 text-emerald-400" strokeWidth={2} />
                        <div>
                          <p className="text-white text-[10px] font-medium">{transaction.customer}</p>
                          <p className="text-white/70 text-[9px]">{transaction.gb}GB • {transaction.method}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-white font-medium text-[10px]">{formatCurrency(transaction.amount)}</p>
                        <p className="text-white/70 text-[9px]">{transaction.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Database className="w-4 h-4 text-white/30 mx-auto mb-1" />
                  <p className="text-white/70 text-[10px]">No transactions yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions - Very Compact Grid */}
        <div className="grid grid-cols-6 gap-1.5">
          {[
            { icon: Package, label: 'Order', path: '/datamart', color: 'from-emerald-400 to-teal-500' },
            { icon: BarChart2, label: 'Stats', path: '/reports', color: 'from-blue-400 to-indigo-500' },
            { icon: Clock, label: 'History', path: '/orders', color: 'from-purple-400 to-pink-500' },
            { icon: CreditCard, label: 'Top Up', onClick: navigateToTopup, color: 'from-yellow-400 to-orange-500' },
            { icon: AlertCircle, label: 'Support', path: '/support', color: 'from-red-400 to-red-500' },
            { icon: User, label: 'Profile', path: '/profile', color: 'from-gray-400 to-gray-500' }
          ].map((action, index) => (
            <button
              key={index}
              onClick={action.onClick || (() => router.push(action.path))}
              className={`group bg-gradient-to-br ${action.color} hover:scale-105 rounded-md p-2 transition-all duration-200 transform shadow`}
            >
              <div className="text-center">
                <action.icon className="w-3.5 h-3.5 text-white mx-auto mb-0.5" strokeWidth={2} />
                <p className="text-white font-medium text-[9px]">{action.label}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Add fadeInDown animation */}
      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInDown {
          animation: fadeInDown 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;