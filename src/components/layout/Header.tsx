import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Bell,
  LogOut,
  Settings,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

interface HeaderProps {
  onOpenMobileNav: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileNav }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminUser, logout } = useAuth();
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useStore();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = notifications.filter((n) => !n.read);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Title based on path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard Overview';
    if (path.includes('products')) return 'Product Catalog';
    if (path.includes('categories')) return 'Categories & Collections';
    if (path.includes('orders')) return 'Order Management';
    if (path.includes('customers')) return 'Customer Directory';
    if (path.includes('banners')) return 'Promotional Banners';
    if (path.includes('coupons')) return 'Coupon Discounts';
    if (path.includes('notifications')) return 'Admin Notifications';
    if (path.includes('settings')) return 'Store & Admin Settings';
    return 'Admin Portal';
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <header className="h-16 bg-[#0E0E10]/90 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-sm sm:text-base font-semibold text-white tracking-wide flex items-center gap-2">
            <span>{getPageTitle()}</span>
          </h1>
          <p className="text-[11px] text-zinc-400 hidden sm:block">
            KINORA Luxury E-Commerce Operations
          </p>
        </div>
      </div>

      {/* Right: Actions, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className="relative p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-gold-primary ring-2 ring-[#0E0E10] animate-pulse" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#141418] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-[#18181D]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white uppercase tracking-wider">
                    Notifications
                  </span>
                  {unreadNotifs.length > 0 && (
                    <span className="bg-gold-primary/20 text-gold-light text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadNotifs.length} new
                    </span>
                  )}
                </div>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={() => markAllNotificationsAsRead()}
                    className="text-[11px] text-gold-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-zinc-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-zinc-500">
                    No notifications at this time.
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        if (n.link) navigate(n.link);
                        setIsNotifOpen(false);
                      }}
                      className={`p-3.5 hover:bg-zinc-800/40 cursor-pointer transition-colors ${
                        !n.read ? 'bg-gold-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs ${!n.read ? 'font-semibold text-gold-light' : 'text-zinc-300'}`}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-gold-primary shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-zinc-800 bg-[#18181D] text-center">
                <Link
                  to="/admin/notifications"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs text-gold-primary hover:text-gold-light font-medium block py-1"
                >
                  View all notifications &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-zinc-800/80 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-black border border-gold-primary/40 flex items-center justify-center overflow-hidden shadow-gold-glow">
              {adminUser?.photoURL ? (
                <img src={adminUser.photoURL} alt="Admin" className="w-full h-full object-cover" />
              ) : (
                <Shield className="w-4 h-4 text-gold-primary" />
              )}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-semibold text-white leading-tight">
                {adminUser?.displayName || 'Admin'}
              </p>
              <p className="text-[10px] text-gold-primary uppercase tracking-wider font-semibold">
                {adminUser?.role || 'Super Admin'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden md:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#141418] border border-zinc-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in duration-150">
              <div className="px-3 py-2 border-b border-zinc-800/80 mb-1">
                <p className="text-xs font-semibold text-white truncate">
                  {adminUser?.displayName || 'KINORA Administrator'}
                </p>
                <p className="text-[10px] text-zinc-400 truncate">{adminUser?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-gold-primary/10 border border-gold-primary/30 text-gold-light text-[9px] font-bold tracking-wider uppercase">
                  Authorized Admin
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  navigate('/admin/settings');
                  setIsProfileOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/70 transition-colors"
              >
                <Settings className="w-4 h-4 text-zinc-400" />
                <span>Store Settings</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors mt-1"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
