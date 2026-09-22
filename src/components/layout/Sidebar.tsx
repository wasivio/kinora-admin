import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Image as ImageIcon,
  TicketPercent,
  Bell,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { notifications, isSyncing } = useStore();
  const { adminUser, isFirebaseActive } = useAuth();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Banners', path: '/admin/banners', icon: ImageIcon },
    { name: 'Coupons', path: '/admin/coupons', icon: TicketPercent },
    {
      name: 'Notifications',
      path: '/admin/notifications',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0B0B0D] border-r border-zinc-800/80 flex flex-col h-full shrink-0 select-none">
      {/* Brand Header with Official KINORA Logo */}
      <div className="px-6 py-5 border-b border-zinc-800/80 flex items-center justify-between">
        <NavLink
          to="/admin/dashboard"
          className="flex items-center gap-3 group"
          onClick={onCloseMobile}
        >
          <div className="relative w-10 h-10 rounded-lg bg-black border border-gold-primary/40 flex items-center justify-center overflow-hidden p-1 shadow-gold-glow group-hover:border-gold-primary transition-all">
            <img
              src="/kinora-logo.png"
              alt="KINORA Official Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="text-sm font-bold tracking-[0.2em] text-white block uppercase group-hover:text-gold-light transition-colors">
              KINORA
            </span>
            <span className="text-[10px] tracking-widest text-gold-primary font-medium uppercase block">
              Admin Portal
            </span>
          </div>
        </NavLink>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Management
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-gold-primary/15 to-transparent text-gold-light border-l-2 border-gold-primary font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && (
                <span className="bg-gold-primary text-black font-bold text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* System Status & Admin Badge */}
      <div className="p-3 border-t border-zinc-800/80 bg-[#0E0E11]">
        <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-zinc-800/60 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isFirebaseActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="text-zinc-400 text-[11px]">
              {isFirebaseActive ? 'Firebase Live' : 'Demo Mode'}
            </span>
          </div>
          {isSyncing && (
            <span className="text-[10px] text-gold-primary animate-pulse">Syncing...</span>
          )}
        </div>

        {/* Current Admin User info */}
        {adminUser && (
          <div className="mt-2.5 px-2 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-gold-primary/30 flex items-center justify-center overflow-hidden shrink-0">
              {adminUser.photoURL ? (
                <img src={adminUser.photoURL} alt="Admin" className="w-full h-full object-cover" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-gold-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{adminUser.displayName || 'Admin'}</p>
              <p className="text-[10px] text-zinc-500 truncate">{adminUser.email}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
