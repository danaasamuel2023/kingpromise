'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { Info, AlertCircle, X, Copy, AlertTriangle, Zap, Star, Flame, Shield, CreditCard, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';

export default function DepositPage() {
  const [amount, setAmount] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [fee, setFee] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [accountStatus, setAccountStatus] = useState('');
  const [disableReason, setDisableReason] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  
  const router = useRouter();
  
  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem('userData');
      
      if (userData) {
        const user = JSON.parse(userData);
        setUserId(user.id);
        setUserEmail(user.email);
        setIsAuthenticated(true);
        
        if (user.isDisabled) {
          setAccountStatus('disabled');
          setDisableReason(user.disableReason || 'No reason provided');
        } else if (user.approvalStatus === 'pending') {
          setAccountStatus('pending');
        } else if (user.approvalStatus === 'rejected') {
          setAccountStatus('not-approved');
          setDisableReason(user.rejectionReason || 'Your account has not been approved.');
        }
      } else {
        router.push('/SignIn');
      }
    };
    
    checkAuth();
  }, [router]);
  
  // Calculate fee and total amount when deposit amount changes
  useEffect(() => {
    if (amount && amount > 0) {
      const feeAmount = parseFloat(amount) * 0.03; // 3% fee
      const total = parseFloat(amount) + feeAmount;
      setFee(feeAmount.toFixed(2));
      setTotalAmount(total.toFixed(2));
    } else {
      setFee('');
      setTotalAmount('');
    }
  }, [amount]);
  
  const handleDeposit = async (e) => {
    e.preventDefault();
    
    if (!amount || amount <= 9) {
      setError('Please enter a valid amount greater than 9 GHS.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.post('https://kingpromise.onrender.com/api/v1/deposit', {
        userId,
        amount: parseFloat(amount),
        totalAmountWithFee: parseFloat(totalAmount),
        email: userEmail
      });
      
      if (response.data.paystackUrl) {
        setSuccess('Redirecting to Paystack...');
        window.location.href = response.data.paystackUrl;
      }
    } catch (error) {
      console.error('Deposit error:', error);
      
      if (error.response?.data?.error === 'Account is disabled') {
        setAccountStatus('disabled');
        setDisableReason(error.response.data.disableReason || 'No reason provided');
        setShowApprovalModal(true);
      } else if (error.response?.data?.error === 'Account not approved') {
        if (error.response.data.approvalStatus === 'pending') {
          setAccountStatus('pending');
        } else {
          setAccountStatus('not-approved');
          setDisableReason(error.response.data.reason || 'Your account has not been approved.');
        }
        setShowApprovalModal(true);
      } else {
        setError(error.response?.data?.error || 'Failed to process deposit. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to copy mobile money number to clipboard
  const copyMomoNumber = () => {
    navigator.clipboard.writeText('0597760914');
    setCopySuccess('Copied!');
    setTimeout(() => setCopySuccess(''), 2000);
  };
  
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-3">
            <div className="w-12 h-12 rounded-full border-2 border-emerald-100/20"></div>
            <div className="absolute top-0 w-12 h-12 rounded-full border-2 border-transparent border-t-emerald-400 border-r-teal-400 animate-spin"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 animate-pulse flex items-center justify-center">
              <Zap className="w-3 h-3 text-white animate-bounce" strokeWidth={2} />
            </div>
          </div>
          <div className="flex items-center justify-center space-x-1 text-emerald-300">
            <Sparkles className="w-3 h-3 animate-spin" />
            <span className="text-xs font-medium">Checking authentication...</span>
            <Sparkles className="w-3 h-3 animate-spin" />
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

      <div className="relative z-10 min-h-screen flex items-center justify-center p-3">
        <div className="w-full max-w-sm">
          {/* Header Section - Very Compact */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" strokeWidth={2} />
              </div>
              <h1 className="text-base font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-transparent bg-clip-text">
                CHEAPDATE
              </h1>
            </div>
            <p className="text-white/80 text-xs">Deposit Funds</p>
          </div>

          {/* Main Card - Very Compact */}
          <div className="bg-white/5 backdrop-blur-xl rounded-lg border border-white/20 overflow-hidden shadow-lg">
            {/* Header - Very Compact */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-3 relative overflow-hidden">
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <CreditCard className="w-2.5 h-2.5 text-white" />
              </div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-md bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                    <CreditCard className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Add Funds</h2>
                    <p className="text-white/90 text-[10px]">Power up your account</p>
                  </div>
                </div>
                
                <Link 
                  href="/howtodeposite" 
                  className="flex items-center space-x-1 px-2 py-1 bg-white/20 backdrop-blur-sm text-white font-medium rounded-md border border-white/30 hover:bg-white/30 transition-all"
                >
                  <Info size={10} />
                  <span className="text-[10px]">Help</span>
                </Link>
              </div>
            </div>

            <div className="p-4">
              {/* Info Banner - Very Compact */}
              <div className="mb-3 p-2 rounded-md bg-gradient-to-r from-emerald-100/10 to-teal-100/10 border border-emerald-500/30 backdrop-blur-sm">
                <div className="flex items-start space-x-1.5">
                  <div className="w-4 h-4 rounded bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Info className="w-2 h-2 text-emerald-400" />
                  </div>
                  <p className="text-emerald-200 text-[10px]">
                    Need help? <Link href="/howtodeposite" className="text-emerald-400 hover:text-emerald-300 underline font-medium">View guide</Link>
                  </p>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-3 p-2 rounded-md flex items-start bg-gradient-to-r from-red-100/10 to-red-200/10 border border-red-500/30 backdrop-blur-sm">
                  <div className="w-4 h-4 rounded bg-red-500/20 flex items-center justify-center mr-1.5 flex-shrink-0 mt-0.5">
                    <AlertCircle className="w-2 h-2 text-red-400" />
                  </div>
                  <span className="text-red-200 text-[10px]">{error}</span>
                </div>
              )}

              {/* Success Display */}
              {success && (
                <div className="mb-3 p-2 rounded-md flex items-start bg-gradient-to-r from-emerald-100/10 to-emerald-200/10 border border-emerald-500/30 backdrop-blur-sm">
                  <div className="w-4 h-4 rounded bg-emerald-500/20 flex items-center justify-center mr-1.5 flex-shrink-0 mt-0.5">
                    <Shield className="w-2 h-2 text-emerald-400" />
                  </div>
                  <span className="text-emerald-200 text-[10px]">{success}</span>
                </div>
              )}

              {/* Deposit Form - Very Compact */}
              <form onSubmit={handleDeposit} className="space-y-3">
                <div>
                  <label htmlFor="amount" className="block text-xs font-bold mb-1.5 text-white">
                    Amount (GHS)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <span className="text-emerald-400 text-sm font-bold">₵</span>
                    </div>
                    <input
                      type="number"
                      id="amount"
                      className="pl-8 pr-3 py-2 block w-full rounded-md bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-sm"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="1"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                
                {/* Amount Breakdown - Very Compact */}
                {amount && amount > 0 && (
                  <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-md border border-white/20">
                    <h3 className="text-xs font-bold text-white mb-2 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1.5 text-emerald-400" />
                      Breakdown
                    </h3>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-white/90 text-[10px]">
                        <span>Amount:</span>
                        <span className="font-medium">GHS {parseFloat(amount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-white/90 text-[10px]">
                        <span>Processing Fee (3%):</span>
                        <span className="font-medium">GHS {fee}</span>
                      </div>
                      <div className="border-t border-white/20 pt-1.5 mt-1.5">
                        <div className="flex justify-between text-white font-bold text-xs">
                          <span>Total:</span>
                          <span className="text-emerald-400">GHS {totalAmount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center py-2 px-3 rounded-md text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 transition-all transform hover:scale-105 font-bold text-xs"
                >
                  {isLoading ? (
                    <>
                      <div className="mr-1.5 animate-spin">
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full"></div>
                      </div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-1.5 w-3 h-3" />
                      Deposit via Paystack
                      <ArrowRight className="ml-1.5 w-3 h-3" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer Info - Very Compact */}
              <div className="mt-3 p-2 bg-white/5 backdrop-blur-sm rounded-md border border-white/10">
                <div className="space-y-1 text-[10px] text-white/70">
                  <p className="flex items-center">
                    <Shield className="w-2.5 h-2.5 mr-1.5 text-emerald-400" />
                    3% processing fee applies
                  </p>
                  <p className="flex items-center">
                    <Shield className="w-2.5 h-2.5 mr-1.5 text-emerald-400" />
                    Secure payments via Paystack
                  </p>
                  <Link 
                    href="/myorders" 
                    className="flex items-center text-emerald-400 hover:text-emerald-300 font-medium transition-colors mt-1.5"
                  >
                    <TrendingUp className="w-2.5 h-2.5 mr-1.5" />
                    View deposit history
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Account Status Modal - Very Compact */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-3">
          <div className="bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 p-4 max-w-xs w-full shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center space-x-1.5">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center">
                  <AlertCircle className="w-3 h-3 text-red-400" />
                </div>
                <h2 className="text-sm font-bold text-white">
                  {accountStatus === 'pending' ? 'Account Pending' : 
                   accountStatus === 'disabled' ? 'Account Disabled' : 
                   'Account Not Approved'}
                </h2>
              </div>
              <button 
                onClick={() => setShowApprovalModal(false)}
                className="text-white/70 hover:text-white p-1 rounded-md hover:bg-white/10 transition-all"
              >
                <X size={12} />
              </button>
            </div>
            
            {accountStatus === 'disabled' ? (
              <p className="text-red-300 text-xs mb-3">
                {disableReason}
              </p>
            ) : (
              <>
                <p className="text-white/80 text-xs mb-3">
                  {accountStatus === 'pending' ? 
                    'Pay 100 GHS to activate your account:' : 
                    'Your account needs approval. Pay 100 GHS to:'}
                </p>
                
                <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-md mb-3 border border-white/20">
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <p className="text-white text-[10px] font-medium">
                        <span className="text-emerald-400">MoMo:</span> 0597760914
                      </p>
                      <p className="text-white text-[10px] font-medium">
                        <span className="text-emerald-400">Name:</span> KOJO Frimpong
                      </p>
                    </div>
                    <button 
                      onClick={copyMomoNumber}
                      className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 font-medium p-1.5 rounded-md hover:bg-white/10 transition-all"
                    >
                      <Copy size={10} />
                      {copySuccess && <span className="text-[9px] text-emerald-300">{copySuccess}</span>}
                    </button>
                  </div>
                </div>
                
                <p className="text-yellow-300 text-[10px] mb-3 text-center font-medium">
                  Use your email/phone as payment reference
                </p>
              </>
            )}
            
            <div className="flex space-x-1.5">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 py-1.5 px-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-md transition-all border border-white/20 text-[10px]"
              >
                Close
              </button>
              
              <a
                href="mailto:datamartghana@gmail.com"
                className="flex-1 py-1.5 px-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium rounded-md text-center transition-all transform hover:scale-105 text-[10px]"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}