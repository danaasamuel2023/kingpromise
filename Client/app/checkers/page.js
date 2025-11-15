'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, CheckCircle, AlertTriangle, X, Info, Phone, CreditCard, Calendar, Trophy, History, RefreshCw, Copy } from 'lucide-react';

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`p-3 rounded-xl shadow-xl flex items-center backdrop-blur-xl border max-w-sm ${
        type === 'success' 
          ? 'bg-emerald-500/90 text-white border-emerald-400/50' 
          : type === 'error' 
            ? 'bg-red-500/90 text-white border-red-400/50' 
            : 'bg-blue-500/90 text-white border-blue-400/50'
      }`}>
        <div className="mr-2">
          {type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : type === 'error' ? (
            <X className="h-4 w-4" />
          ) : (
            <Info className="h-4 w-4" />
          )}
        </div>
        <div className="flex-grow">
          <p className="font-medium text-sm">{message}</p>
        </div>
        <button onClick={onClose} className="ml-3 hover:scale-110 transition-transform">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Purchase Modal
const CheckerPurchaseModal = ({ isOpen, onClose, checker, phoneNumber, setPhoneNumber, onPurchase, error, isLoading }) => {
  if (!isOpen || !checker) return null;

  const handlePhoneNumberChange = (e) => {
    let formatted = e.target.value.replace(/\D/g, '');
    
    if (!formatted.startsWith('0') && formatted.length > 0) {
      formatted = '0' + formatted;
    }
    
    if (formatted.length > 10) {
      formatted = formatted.substring(0, 10);
    }
    
    setPhoneNumber(formatted);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onPurchase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 w-full max-w-md shadow-xl">
        {/* Modal header */}
        <div className={`bg-gradient-to-r ${checker.type === 'WAEC' ? 'from-blue-600 via-blue-500 to-cyan-600' : 'from-purple-600 via-violet-500 to-pink-600'} px-6 py-4 rounded-t-2xl flex justify-between items-center`}>
          <h3 className="text-lg font-bold text-white flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Purchase {checker.name}
          </h3>
          <button onClick={onClose} className="text-white hover:text-white/70 p-1 rounded-lg hover:bg-white/10 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Modal content */}
        <div className="px-6 py-4">
          {/* Bundle Info */}
          <div className="bg-white/10 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-medium">Checker Type:</span>
              <span className={`font-bold ${checker.type === 'WAEC' ? 'text-blue-400' : 'text-purple-400'}`}>{checker.type}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-medium">Description:</span>
              <span className="text-white/70 font-medium text-sm">{checker.description}</span>
            </div>
            <div className="flex justify-between items-center border-t border-white/20 pt-2">
              <span className="text-white font-bold">Total Price:</span>
              <span className={`font-bold text-lg ${checker.type === 'WAEC' ? 'text-blue-400' : 'text-purple-400'}`}>GH₵{checker.price}</span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 rounded-xl flex items-start bg-red-500/20 border border-red-500/30">
              <X className="w-4 h-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-red-200 text-sm">{error}</span>
            </div>
          )}

          {/* Phone Number Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2 text-white">
                Your Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="w-4 h-4 text-blue-400" />
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  className="pl-10 pr-4 py-3 block w-full rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                  placeholder="0XXXXXXXXX"
                  required
                  autoFocus
                />
              </div>
              <p className="mt-1 text-xs text-white/70">Format: 0 followed by 9 digits (Ghana)</p>
            </div>

            {/* Warning */}
            <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
              <div className="flex items-start">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-yellow-200 text-xs">
                    <strong>Important:</strong> Serial number and PIN will be sent to this number. Verify carefully!
                  </p>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <p className="text-blue-300 text-xs font-bold mb-2">What you get:</p>
              <ul className="space-y-1 text-blue-200 text-xs">
                <li className="flex items-start">
                  <CheckCircle className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                  Serial Number & PIN via SMS
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                  Instant access to results
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                  Print certificates
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all border border-white/20"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !phoneNumber || phoneNumber.length !== 10}
                className={`flex-1 py-3 px-4 bg-gradient-to-r ${checker.type === 'WAEC' ? 'from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700' : 'from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'} text-white font-bold rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Purchase Now
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Loading Overlay
const LoadingOverlay = ({ isLoading }) => {
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 max-w-xs w-full mx-auto text-center shadow-xl">
        <div className="flex justify-center mb-4">
          <div className="relative w-12 h-12">
            <div className="w-12 h-12 rounded-full border-3 border-blue-200/20"></div>
            <div className="absolute top-0 w-12 h-12 rounded-full border-3 border-transparent border-t-blue-400 border-r-cyan-400 animate-spin"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 animate-pulse flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white animate-bounce" strokeWidth={2.5} />
            </div>
          </div>
        </div>
        <h4 className="text-lg font-bold text-white mb-2">Processing...</h4>
        <p className="text-white/80 text-sm">Setting up your checker</p>
      </div>
    </div>
  );
};

// History View Modal
const HistoryModal = ({ isOpen, onClose, history, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 w-full max-w-2xl shadow-xl max-h-[80vh] overflow-y-auto">
        {/* Modal header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h3 className="text-lg font-bold text-white flex items-center">
            <History className="w-5 h-5 mr-2" />
            Purchase History
          </h3>
          <button onClick={onClose} className="text-white hover:text-white/70 p-1 rounded-lg hover:bg-white/10 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Modal content */}
        <div className="px-6 py-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-3 border-blue-200/20 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/80">Loading history...</p>
            </div>
          ) : history && history.length > 0 ? (
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item._id} className="bg-white/10 rounded-xl p-4 border border-white/20">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-white">{item.checkerType} Checker</h4>
                      <p className="text-white/70 text-sm">Ref: {item.reference}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.status === 'completed' ? 'bg-emerald-500/30 text-emerald-200' :
                      item.status === 'pending' ? 'bg-yellow-500/30 text-yellow-200' :
                      'bg-red-500/30 text-red-200'
                    }`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/70">
                      {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}
                    </span>
                    <span className="font-bold text-blue-400">GH₵{item.price}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-white/40 mx-auto mb-3" />
              <p className="text-white/80">No purchases yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Component
const ResultCheckerComponent = () => {
  const [selectedChecker, setSelectedChecker] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  
  // Toast state
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success'
  });

  const checkers = [
    {
      type: 'WAEC',
      name: 'WAEC Result Checker',
      description: 'West African Examinations Council',
      price: '19.00',
      icon: '📚',
      color: 'from-blue-500 to-cyan-600',
      features: ['View WAEC results', 'Print certificates', 'Share results online']
    },
    {
      type: 'BECE',
      name: 'BECE Result Checker',
      description: 'Basic Education Certificate Examination',
      price: '19.00',
      icon: '🎓',
      color: 'from-purple-500 to-pink-600',
      features: ['View BECE results', 'Print certificates', 'Share results online']
    }
  ];

  // Get user data on mount
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  // Add CSS for animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(100px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      .animate-slide-in {
        animation: slideIn 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    if (userData?.id) {
      fetchDashboard();
    }
  }, [userData?.id]);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `https://kingpromise.onrender.com/api/v1/checkers/checker-dashboard/${userData.id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      setDashboard(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({
      visible: true,
      message,
      type
    });
  };

  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      visible: false
    }));
  };

  const handleCheckerSelect = (checker) => {
    if (!userData || !userData.id) {
      showToast('Please login to continue', 'error');
      return;
    }

    setSelectedChecker(checker);
    setPhoneNumber('');
    setError('');
    setIsPurchaseModalOpen(true);
  };

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `https://kingpromise.onrender.com/api/v1/checkers/checker-history/${userData.id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      setHistory(response.data.data.purchases);
      setIsHistoryModalOpen(true);
    } catch (error) {
      showToast('Failed to load history', 'error');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const processPurchase = async () => {
    if (!selectedChecker) return;
    
    if (phoneNumber.length !== 10) {
      setError('Please enter a valid phone number (10 digits starting with 0)');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        'https://kingpromise.onrender.com/api/v1/checkers/purchase-checker',
        {
          userId: userData.id,
          phoneNumber: phoneNumber,
          checkerType: selectedChecker.type,
          price: parseFloat(selectedChecker.price),
          skipSms: false
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.status === 'success') {
        showToast(`${selectedChecker.type} purchased! Check your SMS for details.`, 'success');
        setPhoneNumber('');
        setError('');
        setIsPurchaseModalOpen(false);
        setSelectedChecker(null);
        fetchDashboard();
      }
    } catch (error) {
      console.error('Purchase error:', error);
      const errorMessage = error.response?.data?.message || 'Purchase failed. Please try again.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/5 to-cyan-400/5 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-purple-400/5 to-pink-400/5 blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Toast */}
      {toast.visible && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
      
      {/* Loading Overlay */}
      <LoadingOverlay isLoading={isLoading} />

      {/* History Modal */}
      <HistoryModal 
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={history}
        isLoading={isLoadingHistory}
      />

      {/* Purchase Modal */}
      <CheckerPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => {
          setIsPurchaseModalOpen(false);
          setSelectedChecker(null);
          setPhoneNumber('');
          setError('');
        }}
        checker={selectedChecker}
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        onPurchase={processPurchase}
        error={error}
        isLoading={isLoading}
      />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 py-8">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 text-transparent bg-clip-text">
                Result Checkers
              </h1>
            </div>
            <p className="text-white/80 text-base">WAEC & BECE Exam Result Checker</p>
          </div>

          {/* Dashboard Stats - Only if available */}
          {dashboard && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4 text-center">
                <p className="text-white/70 text-sm mb-1">Wallet Balance</p>
                <p className="text-blue-400 font-bold text-xl">GH₵{dashboard.userBalance.toFixed(2)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4 text-center">
                <p className="text-white/70 text-sm mb-1">WAEC Purchased</p>
                <p className="text-purple-400 font-bold text-xl">{dashboard.statistics.totalWAEC}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4 text-center">
                <p className="text-white/70 text-sm mb-1">BECE Purchased</p>
                <p className="text-pink-400 font-bold text-xl">{dashboard.statistics.totalBECE}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4 text-center">
                <p className="text-white/70 text-sm mb-1">Total Spent</p>
                <p className="text-emerald-400 font-bold text-xl">GH₵{dashboard.statistics.totalSpent.toFixed(2)}</p>
              </div>
            </div>
          )}

          {/* Checkers Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {checkers.map((checker) => (
              <div
                key={checker.type}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:border-white/40 group"
              >
                {/* Header with gradient */}
                <div className={`bg-gradient-to-r ${checker.color} p-6 relative overflow-hidden`}>
                  <div className="absolute top-3 right-3 text-3xl">{checker.icon}</div>
                  <h2 className="text-2xl font-bold text-white mb-1">{checker.name}</h2>
                  <p className="text-white/90 text-sm">{checker.description}</p>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Price */}
                  <div className="mb-4">
                    <p className="text-white/70 text-sm mb-1">Price</p>
                    <p className={`text-3xl font-bold bg-gradient-to-r ${checker.color} text-transparent bg-clip-text`}>
                      GH₵{checker.price}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="mb-6 space-y-2">
                    {checker.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-white/80 text-sm">
                        <CheckCircle className="w-4 h-4 mr-2 text-emerald-400 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Button */}
                  <button
                    onClick={() => handleCheckerSelect(checker)}
                    className={`w-full py-3 px-4 bg-gradient-to-r ${checker.color} text-white font-bold rounded-xl transition-all transform hover:scale-105 flex items-center justify-center shadow-lg hover:shadow-xl`}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* History Button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={loadHistory}
              disabled={isLoadingHistory}
              className="flex items-center space-x-2 px-6 py-3 bg-white/10 border border-white/20 text-white font-medium rounded-xl hover:bg-white/20 transition-all"
            >
              <History className="w-4 h-4" />
              <span>View Purchase History</span>
            </button>
          </div>

          {/* Info Card */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-white font-bold mb-2">How It Works</h4>
                <ul className="text-white/80 text-sm space-y-1">
                  <li>• Select your checker type (WAEC or BECE)</li>
                  <li>• Deduction from your wallet</li>
                  <li>• Serial number and PIN sent to your phone via SMS</li>
                  <li>• Use details to access your results online</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCheckerComponent;