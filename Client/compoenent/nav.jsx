'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  LayoutDashboard, 
  Layers, 
  User,
  CreditCard,
  LogOut,
  ChevronRight,
  ShoppingCart,
  BarChart2,
  Menu,
  X,
  Activity,
  TrendingUp,
  Settings,
  Wallet,
  Globe,
  Shield,
  FileText,
  HelpCircle,
  Moon,
  Sun
} from 'lucide-react';

const MobileNavbar = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [userRole, setUserRole] = useState("user");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  
  // Check user role and login status on initial load
  useEffect(() => {
    try {
      const authToken = localStorage.getItem('authToken');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const dataUser = JSON.parse(localStorage.getItem('data.user') || '{}');
      
      const loggedIn = !!authToken;
      setIsLoggedIn(loggedIn);
      
      if (!loggedIn) {
        return;
      }
      
      if (userData && userData.role) {
        setUserRole(userData.role);
        setUserName(userData.name || '');
        setUserEmail(userData.email || '');
      } else if (dataUser && dataUser.role) {
        setUserRole(dataUser.role);
        setUserName(dataUser.name || '');
        setUserEmail(dataUser.email || '');
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      setIsLoggedIn(false);
    }
  }, []);

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

  // Enhanced Logout function
  const handleLogout = () => {
    console.log("Logout initiated");
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('data.user');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      setIsLoggedIn(false);
      setUserRole("user");
      
      window.location.href = '/';
    } catch (error) {
      console.error("Error during logout:", error);
      window.location.href = '/';
    }
  };

  // Navigate to profile page
  const navigateToProfile = () => {
    router.push('/profile');
    setIsMobileMenuOpen(false);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  // Navigation Item Component
  const NavItem = ({ icon, text, path, onClick, disabled = false, badge = null, isActive = false }) => {
    const itemClasses = `flex items-center py-3 px-4 ${
      disabled 
        ? 'opacity-50 cursor-not-allowed' 
        : 'hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer'
    } transition-colors ${
      isActive ? 'bg-blue-50 dark:bg-blue-900/20 border-l-3 border-blue-600' : ''
    }`;
    
    return (
      <div 
        className={itemClasses}
        onClick={() => {
          if (disabled) return;
          if (onClick) {
            onClick();
          } else {
            router.push(path);
            setIsMobileMenuOpen(false);
          }
        }}
      >
        <div className={`mr-3 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {React.cloneElement(icon, { size: 20 })}
        </div>
        <span className={`font-medium text-sm flex-1 ${
          isActive ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
        }`}>
          {text}
        </span>
        {badge && (
          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
            {badge}
          </span>
        )}
        {disabled && (
          <span className="px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400">
            Coming Soon
          </span>
        )}
        {!disabled && (
          <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        )}
      </div>
    );
  };

  // Section Heading Component
  const SectionHeading = ({ title }) => (
    <div className="px-4 py-2">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {title}
      </p>
    </div>
  );

  return (
    <>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 w-full bg-white dark:bg-gray-900 shadow-sm z-40 border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div className="flex justify-between items-center h-14 px-4 max-w-screen-xl mx-auto">
          <div className="flex items-center">
            <span 
              className="cursor-pointer"
              onClick={() => router.push('/')}
            >
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">DataSpot</h1>
            </span>
          </div>
          <div className="flex items-center space-x-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </button>
            
            {isLoggedIn && (
              <Shield className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            )}
            
            <button 
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? 
                <X size={20} className="text-gray-700 dark:text-gray-300" /> : 
                <Menu size={20} className="text-gray-700 dark:text-gray-300" />
              }
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 z-50 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed right-0 top-0 h-full w-80 max-w-[85%] bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-out z-50 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close menu"
            >
              <X size={20} className="text-gray-700 dark:text-gray-300" />
            </button>
          </div>
          
          {/* User Info Section */}
          {isLoggedIn && (
            <div className="px-4 pb-4">
              <div 
                className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={navigateToProfile}
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white">
                  <User size={20} />
                </div>
                <div className="ml-3 flex-1">
                  <div className="font-medium text-sm text-gray-900 dark:text-white">
                    {userName || 'User'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {userEmail || 'View Profile'}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Content */}
        <div className="h-[calc(100vh-180px)] overflow-y-auto bg-white dark:bg-gray-900">
          {isLoggedIn ? (
            <div className="py-2">
              <SectionHeading title="Main" />
              <NavItem 
                icon={<Home />} 
                text="Dashboard" 
                path="/" 
                isActive={activeSection === "Dashboard"}
              />
              {userRole === "admin" && (
                <NavItem 
                  icon={<Shield />} 
                  text="Admin Panel" 
                  path="/admin" 
                  badge="Admin"
                />
              )}

              <div className="my-4">
                <SectionHeading title="Services" />
                <NavItem 
                  icon={<Globe />} 
                  text="AirtelTigo" 
                  path="/at-ishare" 
                />
                <NavItem 
                  icon={<Activity />} 
                  text="MTN Data" 
                  path="/mtnup2u" 
                />
                <NavItem 
                  icon={<Layers />} 
                  text="Telecel" 
                  path="/TELECEL" 
                />
                <NavItem 
                  icon={<Activity />} 
                  text="AT Big Time" 
                  path="/at-big-time"
                  disabled={true} 
                />
              </div>

              <div className="my-4">
                <SectionHeading title="Account" />
                <NavItem 
                  icon={<Wallet />} 
                  text="Deposit Funds" 
                  path="/topup" 
                />
                <NavItem 
                  icon={<FileText />} 
                  text="Transactions" 
                  path="/myorders" 
                />
                <NavItem 
                  icon={<BarChart2 />} 
                  text="Reports" 
                  path="/reports"
                  disabled={true}
                />
              </div>

              <div className="my-4">
                <SectionHeading title="Support" />
                <NavItem 
                  icon={<HelpCircle />} 
                  text="Help Center" 
                  path="/help"
                  disabled={true}
                />
                <NavItem 
                  icon={<Settings />} 
                  text="Settings" 
                  path="/settings"
                  disabled={true}
                />
              </div>

              {/* Logout Button */}
              <div className="mt-6 px-4 pb-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium text-sm"
                >
                  <LogOut size={18} className="mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            // Not logged in state
            <div className="p-6 flex flex-col items-center justify-center h-full">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Welcome to DataSpot
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sign in to access your account and services
                </p>
              </div>
              
              <div className="w-full space-y-3">
                <button
                  onClick={() => {
                    router.push('/SignIn');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium text-sm"
                >
                  Sign In
                </button>
                
                <button
                  onClick={() => {
                    router.push('/SignUp');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors font-medium text-sm"
                >
                  Create Account
                </button>
              </div>

              <div className="mt-8 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  © 2025 DataSpot. All rights reserved.
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="pt-14">
        {/* Your content goes here */}
      </main>
    </>
  );
};

export default MobileNavbar;