'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  RefreshCw, 
  ArrowRight,
  Loader2,
  X,
  AlertTriangle,
  CheckCircle,
  Zap,
  Star,
  Flame
} from 'lucide-react';

// Toast Notification Component - Compact
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className="fixed top-3 right-3 z-50 animate-slide-in">
      <div className={`p-2 rounded-lg shadow-lg flex items-center backdrop-blur-xl border max-w-xs ${
        type === 'success' 
          ? 'bg-emerald-500/95 text-white border-emerald-400/50' 
          : type === 'error' 
            ? 'bg-red-500/95 text-white border-red-400/50' 
            : 'bg-yellow-500/95 text-white border-yellow-400/50'
      }`}>
        <div className="mr-1.5">
          {type === 'success' ? (
            <CheckCircle className="h-3 w-3" />
          ) : type === 'error' ? (
            <X className="h-3 w-3" />
          ) : (
            <AlertTriangle className="h-3 w-3" />
          )}
        </div>
        <div className="flex-grow">
          <p className="font-medium text-xs">{message}</p>
        </div>
        <button onClick={onClose} className="ml-2 hover:scale-110 transition-transform">
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};

// Registration Closed Modal Component - Compact
const RegistrationClosedModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3">
      <div className="bg-white/10 backdrop-blur-xl rounded-lg border border-white/30 w-full max-w-xs shadow-xl">
        {/* Modal header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 rounded-t-lg flex justify-between items-center">
          <h3 className="text-sm font-bold text-white flex items-center">
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
            Registration Closed
          </h3>
          <button onClick={onClose} className="text-white hover:text-white/70 p-1 rounded-md hover:bg-white/10 transition-all">
            <X className="w-3 h-3" />
          </button>
        </div>
        
        {/* Modal content */}
        <div className="px-4 py-3">
          <div className="flex items-start">
            <div className="w-5 h-5 rounded-md bg-red-500/30 flex items-center justify-center mr-2 flex-shrink-0">
              <AlertTriangle className="w-3 h-3 text-red-300" />
            </div>
            <div>
              <p className="text-white font-medium text-xs mb-1">
                We're sorry, but new registrations are currently closed.
              </p>
              <p className="text-white/70 text-[10px]">
                Please check back later or contact our support team for more information.
              </p>
            </div>
          </div>
        </div>
        
        {/* Modal footer */}
        <div className="px-4 py-3 border-t border-white/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-md transition-all transform hover:scale-105 text-xs"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    referralCode: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Registration closed state
  const [isRegistrationClosed, setIsRegistrationClosed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success'
  });

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

  // Function to show toast
  const showToast = (message, type = 'success') => {
    setToast({
      visible: true,
      message,
      type
    });
  };

  // Function to hide toast
  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      visible: false
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignup = async () => {
    setError('');
    
    // Check if registration is closed
    if (isRegistrationClosed) {
      setShowModal(true);
      return;
    }
    
    setIsSubmitting(true);

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      showToast("Passwords do not match", "error");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('https://kingpromise.onrender.com/api/v1/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
          referredBy: formData.referralCode
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Registration successful! Redirecting to login...", "success");
        // Use a direct, synchronous approach for navigation
        setTimeout(() => {
          try {
            // Force a hard navigation instead of client-side navigation
            window.location.href = '/SignIn';
          } catch (err) {
            console.error("Navigation error:", err);
            showToast("Registration successful. Please go to the login page to continue.", "success");
          }
        }, 2000);
      } else {
        setError(data.message || 'Signup failed');
        showToast(data.message || 'Signup failed', 'error');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('An error occurred. Please try again.');
      showToast('An error occurred. Please try again.', 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black relative overflow-hidden flex items-center justify-center p-3">
      {/* Animated Background Elements - Smaller */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-400/20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gradient-to-br from-cyan-400/10 to-blue-400/10 blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Toast Notification */}
      {toast.visible && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      {/* Registration Closed Modal */}
      <RegistrationClosedModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Main Card - Compact */}
        <div className="bg-white/10 backdrop-blur-xl rounded-lg border border-white/30 overflow-hidden shadow-lg">
          {/* Header - Compact */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-4 relative overflow-hidden">
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <Star className="w-2.5 h-2.5 text-white animate-pulse" />
            </div>
            <div className="absolute bottom-2 left-2 w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
              <Flame className="w-2 h-2 text-white animate-bounce" />
            </div>
            
            <div className="relative z-10 text-center">
              {/* CHEAPDATE Logo - Compact */}
              <div className="flex justify-center mb-2">
                <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-md">
                  <div className="text-center">
                    <Zap className="w-4 h-4 text-white mx-auto" strokeWidth={3} />
                    <div className="text-white font-bold text-[8px]">CHEAP</div>
                  </div>
                </div>
              </div>
              
              <h1 className="text-base font-bold text-white mb-0.5">CHEAPDATE</h1>
              <p className="text-white/90 text-xs">Create Your Account</p>
            </div>
          </div>

          {/* Form Section - Compact */}
          <div className="p-4">
            {/* Registration Closed Warning */}
            {isRegistrationClosed && (
              <div className="mb-3 p-2 rounded-md flex items-start bg-yellow-500/20 border border-yellow-500/40 backdrop-blur-sm">
                <div className="w-4 h-4 rounded bg-yellow-500/30 flex items-center justify-center mr-1.5 flex-shrink-0">
                  <AlertTriangle className="w-2 h-2 text-yellow-300" />
                </div>
                <div>
                  <span className="text-yellow-200 font-medium text-[10px]">Registration is currently closed. Form is disabled.</span>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mb-3 p-2 rounded-md flex items-start bg-red-500/20 border border-red-500/40 backdrop-blur-sm">
                <div className="w-4 h-4 rounded bg-red-500/30 flex items-center justify-center mr-1.5 flex-shrink-0">
                  <X className="w-2 h-2 text-red-300" />
                </div>
                <span className="text-red-200 font-medium text-[10px]">{error}</span>
              </div>
            )}

            <div className="space-y-2.5">
              {/* Full Name Input - Compact */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <User className="w-3 h-3 text-emerald-400" />
                </div>
                <input 
                  type="text" 
                  name="name"
                  placeholder="Full Name" 
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-7 pr-2 py-2 block w-full rounded-md bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-xs"
                  required 
                  disabled={isSubmitting || isRegistrationClosed}
                />
              </div>

              {/* Email Input - Compact */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <Mail className="w-3 h-3 text-emerald-400" />
                </div>
                <input 
                  type="email" 
                  name="email"
                  placeholder="Email Address" 
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-7 pr-2 py-2 block w-full rounded-md bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-xs"
                  required 
                  disabled={isSubmitting || isRegistrationClosed}
                />
              </div>

              {/* Phone Number Input - Compact */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <Phone className="w-3 h-3 text-emerald-400" />
                </div>
                <input 
                  type="tel" 
                  name="phoneNumber"
                  placeholder="Phone Number" 
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="pl-7 pr-2 py-2 block w-full rounded-md bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-xs"
                  required 
                  disabled={isSubmitting || isRegistrationClosed}
                />
              </div>

              {/* Password Input - Compact */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <Lock className="w-3 h-3 text-emerald-400" />
                </div>
                <input 
                  type="password" 
                  name="password"
                  placeholder="Password" 
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-7 pr-2 py-2 block w-full rounded-md bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-xs"
                  required 
                  disabled={isSubmitting || isRegistrationClosed}
                />
              </div>

              {/* Confirm Password Input - Compact */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <Lock className="w-3 h-3 text-emerald-400" />
                </div>
                <input 
                  type="password" 
                  name="confirmPassword"
                  placeholder="Confirm Password" 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-7 pr-2 py-2 block w-full rounded-md bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-xs"
                  required 
                  disabled={isSubmitting || isRegistrationClosed}
                />
              </div>

              {/* Referral Code Input - Compact */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <RefreshCw className="w-3 h-3 text-emerald-400" />
                </div>
                <input 
                  type="text" 
                  name="referralCode"
                  placeholder="Referral Code (Optional)" 
                  value={formData.referralCode}
                  onChange={handleChange}
                  className="pl-7 pr-2 py-2 block w-full rounded-md bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-xs"
                  disabled={isSubmitting || isRegistrationClosed}
                />
              </div>

              {/* Submit Button - Compact */}
              <button 
                onClick={handleSignup}
                className={`w-full flex items-center justify-center py-2 px-3 rounded-md shadow-lg text-white font-bold transition-all duration-300 transform text-xs ${
                  (isSubmitting || isRegistrationClosed)
                    ? 'bg-gradient-to-r from-gray-500 to-gray-600 opacity-60 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500/50'
                }`}
                disabled={isSubmitting || isRegistrationClosed}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin mr-1.5 w-3 h-3" />
                    Creating Account...
                  </>
                ) : isRegistrationClosed ? (
                  <>
                    <AlertTriangle className="mr-1.5 w-3 h-3" />
                    Registration Closed
                  </>
                ) : (
                  <>
                    <Zap className="mr-1.5 w-3 h-3" />
                    Create Account
                    <ArrowRight className="ml-1.5 w-3 h-3" />
                  </>
                )}
              </button>
            </div>

            {/* Login Link - Compact */}
            <div className="text-center mt-3">
              <p className="text-white font-medium text-xs">
                Already have an account? 
                <a href="/SignIn" className="text-emerald-400 hover:text-emerald-300 ml-1 font-bold hover:underline transition-colors">
                  Login
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}