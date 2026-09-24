import React, { useState } from 'react';
import { ShoppingBag, Search, Eye, Clock, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { OrderDetailsModal } from '../components/orders/OrderDetailsModal';

export const Orders: React.FC = () => {
  const { orders } = useStore();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Always sort newest orders on top
  const sortedOrders = [...orders].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime() || 0;
    const timeB = new Date(b.createdAt).getTime() || 0;
    return timeB - timeA;
  });

  // Tabs
  const tabs = [
    { id: 'all', label: 'All Orders', count: orders.length },
    { id: 'pending', label: 'Pending', count: orders.filter((o) => o.orderStatus === 'pending').length },
    { id: 'processing', label: 'Processing', count: orders.filter((o) => o.orderStatus === 'processing').length },
    { id: 'shipped', label: 'Shipped', count: orders.filter((o) => o.orderStatus === 'shipped').length },
    { id: 'delivered', label: 'Delivered', count: orders.filter((o) => o.orderStatus === 'delivered').length },
    { id: 'cancelled', label: 'Cancelled', count: orders.filter((o) => o.orderStatus === 'cancelled').length },
  ];

  // Filtering
  const filteredOrders = sortedOrders.filter((o) => {
    const matchesTab = activeTab === 'all' || o.orderStatus === activeTab;
    const search = (searchTerm || '').toLowerCase();
    const matchesSearch =
      (o.orderNumber?.toLowerCase() || '').includes(search) ||
      (o.customerName?.toLowerCase() || '').includes(search) ||
      (o.customerEmail?.toLowerCase() || '').includes(search) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(search));

    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: Order['orderStatus']) => {
    switch (status) {
      case 'delivered':
        return <Badge variant="success">Delivered</Badge>;
      case 'shipped':
        return <Badge variant="info">Shipped</Badge>;
      case 'processing':
        return <Badge variant="gold">Processing</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
    }
  };

  const getPaymentBadge = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Paid</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'refunded':
        return <Badge variant="neutral">Refunded</Badge>;
      case 'failed':
        return <Badge variant="danger">Failed</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            Order Management
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Track, fulfill, and manage global luxury orders and insured shipments.
          </p>
        </div>
      </div>

      {/* Tabs & Search */}
      <Card className="p-4 space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-zinc-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gold-primary text-black font-semibold shadow-gold-glow'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id ? 'bg-black text-white font-bold' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="max-w-md">
          <Input
            placeholder="Search by order ID, customer name, email, tracking..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="text-xs"
          />
        </div>
      </Card>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="No Orders Found"
          description={
            searchTerm || activeTab !== 'all'
              ? 'No orders match your selected filters.'
              : 'There are no customer orders recorded yet.'
          }
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#16161a] text-[10px] text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="p-4 font-semibold">Order ID</th>
                  <th className="p-4 font-semibold">Date & Time</th>
                  <th className="p-4 font-semibold">Client</th>
                  <th className="p-4 font-semibold">Items</th>
                  <th className="p-4 font-semibold">Payment</th>
                  <th className="p-4 font-semibold">Fulfillment</th>
                  <th className="p-4 font-semibold text-right">Total</th>
                  <th className="p-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredOrders.map((ord) => (
                  <tr
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className="hover:bg-zinc-800/30 transition-colors cursor-pointer group"
                  >
                    <td className="p-4 font-mono font-semibold text-white group-hover:text-gold-light">
                      <div className="flex items-center gap-2">
                        <span>{ord.orderNumber}</span>
                        {ord.createdAt && (Date.now() - new Date(ord.createdAt).getTime() < 86400000) && (
                          <span className="px-1.5 py-0.5 rounded-full bg-gold-primary/20 border border-gold-primary/40 text-gold-light text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5 text-gold-primary" />
                            NEW
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-200 text-xs">
                          {ord.createdAt
                            ? new Date(ord.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'N/A'}
                        </span>
                        <span className="text-[11px] text-gold-light font-mono mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gold-primary shrink-0" />
                          {ord.createdAt
                            ? new Date(ord.createdAt).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                              })
                            : '--:--'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-zinc-200">{ord.customerName}</p>
                      <p className="text-[10px] text-zinc-500">{ord.customerEmail}</p>
                    </td>
                    <td className="p-4 text-zinc-300">
                      {ord.items.length} item{ord.items.length !== 1 ? 's' : ''}
                    </td>
                    <td className="p-4">{getPaymentBadge(ord.paymentStatus)}</td>
                    <td className="p-4">{getStatusBadge(ord.orderStatus)}</td>
                    <td className="p-4 text-right font-bold text-gold-light">
                      ₹{ord.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(ord);
                        }}
                        leftIcon={<Eye className="w-3.5 h-3.5 text-gold-primary" />}
                      >
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </div>
  );
};
