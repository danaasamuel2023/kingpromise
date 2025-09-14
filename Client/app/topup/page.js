'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { 
  Info, 
  AlertCircle, 
  X, 
  Copy, 
  AlertTriangle, 
  Shield, 
  CreditCard, 
  TrendingUp, 
  ArrowRight,
  Loader2,
  CheckCircle
} from 'lucide-react';

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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="w-12 h-12 rounded-full border-2 border-gray-200"></div>
            <div className="absolute top-0 w-12 h-12 rounded-full border-2 border-transparent border-t-blue-600 animate-spin"></div>
          </div>
          <p className="text-gray-600 text-sm">Checking authentication...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">DataSpot</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Deposit Funds</span>
              <Shield className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-6 h-6 text-gray-700" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Add Funds</h2>
                  <p className="text-sm text-gray-500">Deposit money to your wallet</p>
                </div>
              </div>
              <Link 
                href="/howtodeposite" 
                className="flex items-center space-x-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
              >
                <Info className="w-4 h-4" />
                <span>Help</span>
              </Link>
            </div>
          </div>

          <div className="p-6">
            {/* Info Banner */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p>Need assistance with your deposit?</p>
                  <Link href="/howtodeposite" className="font-medium hover:underline">
                    View our step-by-step guide →
                  </Link>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-red-800">{error}</span>
                </div>
              </div>
            )}

            {/* Success Display */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm text-green-800">{success}</span>
                </div>
              </div>
            )}

            {/* Deposit Form */}
            <form onSubmit={handleDeposit} className="space-y-6">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (GHS)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">GHS</span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    className="pl-12 pr-3 py-2.5 block w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="10"
                    step="0.01"
                    required
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-500">
                  Minimum deposit amount is GHS 10.00
                </p>
              </div>
              
              {/* Amount Breakdown */}
              {amount && amount > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-gray-600" />
                    Payment Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Deposit Amount:</span>
                      <span className="font-medium text-gray-900">GHS {parseFloat(amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Processing Fee (3%):</span>
                      <span className="font-medium text-gray-900">GHS {fee}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-gray-900">Total Amount:</span>
                        <span className="text-blue-600">GHS {totalAmount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading || !amount || amount <= 9}
                  className="w-full flex items-center justify-center py-3 px-4 rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Proceed to Payment
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Footer Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-gray-400" />
                  3% processing fee applies to all deposits
                </p>
                <p className="flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-gray-400" />
                  Secure payment processing via Paystack
                </p>
                <Link 
                  href="/myorders" 
                  className="flex items-center text-blue-600 hover:text-blue-700 font-medium pt-2"
                >
                  View transaction history →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Account Status Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50 px-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    {accountStatus === 'pending' ? 'Account Activation Required' : 
                     accountStatus === 'disabled' ? 'Account Disabled' : 
                     'Account Approval Required'}
                  </h2>
                </div>
                <button 
                  onClick={() => setShowApprovalModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4">
              {accountStatus === 'disabled' ? (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Your account has been disabled:</p>
                  <p className="text-sm text-red-600 font-medium">{disableReason}</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    {accountStatus === 'pending' ? 
                      'To activate your account, please make a payment of GHS 100 to:' : 
                      'Your account requires approval. Please make a payment of GHS 100 to:'}
                  </p>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">Mobile Money Number:</p>
                          <p className="font-mono font-semibold text-gray-900">0597760914</p>
                        </div>
                        <button 
                          onClick={copyMomoNumber}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                          {copySuccess && <span className="text-xs">{copySuccess}</span>}
                        </button>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Account Name:</p>
                        <p className="font-semibold text-gray-900">KOJO Frimpong</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                    <p className="text-sm text-yellow-800 font-medium">
                      Important: Use your email or phone number as the payment reference
                    </p>
                  </div>
                </>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex space-x-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Close
              </button>
              
              <a
                href="mailto:support@dataspot.com"
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm text-center"
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