// components/Footer.jsx
'use client'
import React from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, Star, Flame } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements - Smaller */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400/5 to-teal-400/5 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-20 h-20 rounded-full bg-gradient-to-br from-purple-400/5 to-pink-400/5 blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Brand Section - Compact */}
          <div className="lg:col-span-1">
            <div className="mb-3">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow relative">
                  <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                  <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    <Star className="w-1 h-1 text-white" strokeWidth={3} />
                  </div>
                </div>
                <h2 className="text-base font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-transparent bg-clip-text">
                  CHEAPDATE
                </h2>
              </div>
              <p className="text-white/70 font-medium text-xs mb-3">
                Your affordable data marketplace for unlimited possibilities.
              </p>
              
              {/* Social Media Links - Compact */}
              <div className="flex space-x-2">
                {[
                  { platform: 'twitter', icon: TwitterIcon },
                  { platform: 'instagram', icon: InstagramIcon },
                  { platform: 'facebook', icon: FacebookIcon },
                  { platform: 'linkedin', icon: LinkedInIcon }
                ].map(({ platform, icon: Icon }) => (
                  <a 
                    key={platform}
                    href="#" 
                    className="w-7 h-7 rounded-md bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all transform hover:scale-110 group"
                  >
                    <Icon className="w-3 h-3 text-emerald-400 group-hover:text-emerald-300" />
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          {/* Quick Links - Compact */}
          <div>
            <h3 className="text-sm font-black text-white mb-3 flex items-center">
              <div className="w-1 h-4 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full mr-2"></div>
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { name: 'Dashboard', path: '/' },
                { name: 'Orders', path: '/orders' },
                { name: 'Transactions', path: '/myorders' },
                { name: 'Profile', path: '/profile' }
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.path} 
                    className="group flex items-center text-white/70 hover:text-emerald-400 transition-all font-medium text-xs"
                  >
                    <div className="w-4 h-4 rounded bg-white/5 group-hover:bg-emerald-500/20 flex items-center justify-center mr-2 transition-all">
                      <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                    </div>
                    <span className="group-hover:translate-x-1 transition-transform">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Data Services - Compact */}
          <div>
            <h3 className="text-sm font-black text-white mb-3 flex items-center">
              <div className="w-1 h-4 bg-gradient-to-b from-teal-400 to-cyan-500 rounded-full mr-2"></div>
              Our Services
            </h3>
            <ul className="space-y-2">
              {[
                { name: 'MTN Data', path: '/mtnup2u', color: 'yellow' },
                { name: 'AirtelTigo Data', path: '/at-ishare', color: 'blue' },
                { name: 'Telecel Data', path: '/TELECEL', color: 'red', isNew: true },
                // { name: 'Foreign Numbers', path: '/verification-services', color: 'purple' }
              ].map((service) => (
                <li key={service.name}>
                  <Link 
                    href={service.path} 
                    className="group flex items-center text-white/70 hover:text-emerald-400 transition-all font-medium text-xs"
                  >
                    <div className={`w-4 h-4 rounded bg-white/5 group-hover:bg-${service.color}-500/20 flex items-center justify-center mr-2 transition-all`}>
                      <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                    </div>
                    <span className="group-hover:translate-x-1 transition-transform flex items-center">
                      {service.name}
                      {service.isNew && (
                        <span className="ml-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold shadow animate-pulse">
                          New
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Bottom Section - Compact */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-white/60 font-medium text-[10px]">
                &copy; {new Date().getFullYear()} CHEAPDATE. All rights reserved.
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link 
                href="/privacy" 
                className="text-white/60 hover:text-emerald-400 font-medium transition-colors text-[10px]"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="text-white/60 hover:text-emerald-400 font-medium transition-colors text-[10px]"
              >
                Terms of Service
              </Link>
              <div className="flex items-center space-x-1 text-emerald-400">
                <Flame className="w-3 h-3 animate-bounce" />
                <span className="font-bold text-[10px]">Keep Dating!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Social Media Icon Components
const TwitterIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
  </svg>
);

const FacebookIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
  </svg>
);

const InstagramIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const LinkedInIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
  </svg>
);

export default Footer;