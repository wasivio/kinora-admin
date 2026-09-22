import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, ShoppingBag, AlertTriangle, Users, Info, ExternalLink } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { AdminNotification } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';

export const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } = useStore();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifs = notifications.filter((n) => (filter === 'all' ? true : !n.read));

  const getTypeIcon = (type: AdminNotification['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-emerald-400" />;
      case 'stock':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'customer':
        return <Users className="w-4 h-4 text-sky-400" />;
      case 'system':
      default:
        return <Info className="w-4 h-4 text-gold-primary" />;
    }
  };

  const handleNotificationClick = async (notif: AdminNotification) => {
    if (!notif.read) {
      await markNotificationAsRead(notif.id);
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            Notifications Center
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time audit log of acquisitions, inventory movements, and system events.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllNotificationsAsRead()}
            leftIcon={<CheckCheck className="w-4 h-4 text-gold-primary" />}
          >
            Mark All as Read
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === 'all'
              ? 'bg-gold-primary text-black font-semibold shadow-gold-glow'
              : 'text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === 'unread'
              ? 'bg-gold-primary text-black font-semibold shadow-gold-glow'
              : 'text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800'
          }`}
        >
          Unread ({notifications.filter((n) => !n.read).length})
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifs.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-8 h-8" />}
          title="No Notifications"
          description={
            filter === 'unread'
              ? 'You have addressed all pending notifications.'
              : 'No activity has been logged yet.'
          }
        />
      ) : (
        <Card className="p-0 overflow-hidden divide-y divide-zinc-800/60">
          {filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-4 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                !notif.read ? 'bg-gold-primary/5 hover:bg-gold-primary/10' : 'hover:bg-zinc-800/30'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0 mt-0.5">
                  {getTypeIcon(notif.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-xs ${
                        !notif.read ? 'font-bold text-white' : 'font-medium text-zinc-300'
                      }`}
                    >
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-gold-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">{notif.message}</p>
                  <p className="text-[10px] text-zinc-500 mt-2">
                    {new Date(notif.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {notif.link && (
                  <span className="text-xs text-gold-primary hover:underline flex items-center gap-1 hidden sm:flex">
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif.id);
                  }}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                  title="Delete Notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};
