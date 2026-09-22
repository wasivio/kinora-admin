import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const AdminLayout: React.FC = () => {
  const { isAdmin, isLoading } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-black border border-gold-primary/50 flex items-center justify-center p-2 shadow-gold-glow-lg">
          <img src="/kinora-logo.png" alt="KINORA" className="w-full h-full object-contain animate-pulse" />
        </div>
        <LoadingSpinner size="md" label="Authenticating KINORA Admin Access..." />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-[#F4F4F5] flex overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <div className="relative z-10 w-64 h-full">
            <Sidebar isMobileOpen={isMobileNavOpen} onCloseMobile={() => setIsMobileNavOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onOpenMobileNav={() => setIsMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
