/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, UserCircle, LogOut, Menu, X } from 'lucide-react';
import { auth, loginWithGoogle, logout } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [user] = useAuthState(auth);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  const isAdmin = user?.email === 'juragangeprek40@gmail.com'; // Simple check for UI, rules handle security

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-700 transition-colors">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">KIPK Portal</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link 
                to="/" 
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${location.pathname === '/' ? 'text-blue-600' : 'text-neutral-600'}`}
              >
                Pendaftaran
              </Link>
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-blue-600 ${location.pathname === '/admin' ? 'text-blue-600' : 'text-neutral-600'}`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard Admin
                </Link>
              )}
              {user ? (
                <div className="flex items-center gap-4 pl-4 border-l border-neutral-200">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-semibold text-neutral-900 leading-none">{user.displayName}</span>
                    <span className="text-[10px] text-neutral-500">{user.email}</span>
                  </div>
                  <button 
                    onClick={() => logout()}
                    className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => loginWithGoogle()}
                  className="bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-all flex items-center gap-2"
                >
                  <UserCircle className="w-4 h-4" />
                  Admin Login
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-neutral-100 bg-white"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <Link 
                  to="/" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-neutral-600 hover:text-blue-600 hover:bg-blue-50"
                >
                  Pendaftaran
                </Link>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-neutral-600 hover:text-blue-600 hover:bg-blue-50"
                  >
                    Dashboard Admin
                  </Link>
                )}
                {user ? (
                  <button 
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                ) : (
                  <button 
                    onClick={() => { loginWithGoogle(); setIsMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                  >
                    <UserCircle className="w-5 h-5" />
                    Admin Login
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      <footer className="bg-white border-t border-neutral-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} Sistem Pendaftaran KIPK. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}
