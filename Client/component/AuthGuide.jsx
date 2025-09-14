'use client'
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Shield, Loader2 } from 'lucide-react';

const AuthGuard = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // List of paths that should bypass authentication
  const publicPaths = ['/SignIn', '/SignUp', '/reset', '/forgot-password'];
  const isPublicPath = publicPaths.includes(pathname);

  useEffect(() => {
    // If current path is public, don't check auth
    if (isPublicPath) {
      setLoading(false);
      setIsAuthenticated(true);
      return;
    }
    
    // Check if user is authenticated
    const userData = localStorage.getItem('userData');
    const authToken = localStorage.getItem('authToken');
    
    if (!userData || !authToken) {
      // Redirect to sign in instead of sign up for better UX
      router.push('/SignIn');
    } else {
      // Verify the data is valid JSON
      try {
        JSON.parse(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Invalid user data:', error);
        // Clear invalid data
        localStorage.removeItem('userData');
        localStorage.removeItem('authToken');
        router.push('/SignIn');
      }
    }
    
    setLoading(false);
  }, [router, isPublicPath, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          {/* Simple Loading Animation */}
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="w-16 h-16 rounded-full border-2 border-gray-200"></div>
            <div className="absolute top-0 w-16 h-16 rounded-full border-2 border-transparent border-t-blue-600 animate-spin"></div>
            <div className="absolute inset-4 rounded-full bg-blue-100 flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-gray-900">
              DataSpot
            </h1>
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Verifying authentication...</span>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-8 w-48 mx-auto">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-progress"></div>
            </div>
          </div>
        </div>
        
        {/* Add animation styles */}
        <style jsx>{`
          @keyframes progress {
            0% {
              width: 0%;
            }
            50% {
              width: 70%;
            }
            100% {
              width: 95%;
            }
          }
          
          .animate-progress {
            animation: progress 2s ease-out infinite;
          }
        `}</style>
      </div>
    );
  }

  return isAuthenticated ? children : null;
};

export default AuthGuard;