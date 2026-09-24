import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IndianRupee,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  Plus,
  ArrowRight,
  Clock,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useStore } from '../context/StoreContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProductFormModal } from '../components/products/ProductFormModal';
import { OrderDetailsModal } from '../components/orders/OrderDetailsModal';
import { Order } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { products, orders, customers, settings } = useStore();

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [timeRange, setTimeRange] = useState<'monthly' | 'weekly'>('monthly');

  // Calculations
  const totalRevenue = orders.reduce((acc, o) => acc + (o.paymentStatus === 'paid' ? o.totalAmount : 0), 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const totalCustomers = customers.length;

  const lowStockProducts = products.filter((p) => p.stock <= 3);
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  // Dynamically aggregate real revenue from orders
  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthIdx = d.getMonth();
      const year = d.getFullYear();
      const monthName = months[monthIdx];

      const monthOrders = orders.filter((o) => {
        const orderDate = new Date(o.createdAt);
        return orderDate.getFullYear() === year && orderDate.getMonth() === monthIdx;
      });

      const rev = monthOrders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.totalAmount : 0), 0);
      result.push({ name: monthName, revenue: rev, orders: monthOrders.length });
    }
    return result;
  };

  const getWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dayName = days[d.getDay()];
      const dayString = d.toISOString().split('T')[0];

      const dayOrders = orders.filter((o) => {
        return o.createdAt && o.createdAt.startsWith(dayString);
      });

      const rev = dayOrders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.totalAmount : 0), 0);
      result.push({ name: dayName, revenue: rev, orders: dayOrders.length });
    }
    return result;
  };

  const chartData = timeRange === 'monthly' ? getMonthlyData() : getWeeklyData();

  // Order status counts
  const orderStats = {
    delivered: orders.filter((o) => o.orderStatus === 'delivered').length,
    shipped: orders.filter((o) => o.orderStatus === 'shipped').length,
    processing: orders.filter((o) => o.orderStatus === 'processing').length,
    pending: orders.filter((o) => o.orderStatus === 'pending').length,
  };

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

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2.5">
            <span>Executive Dashboard</span>
            <span className="w-2 h-2 rounded-full bg-gold-primary animate-pulse" />
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time performance metrics and sales intelligence for {settings.storeName}.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/orders')}
          >
            View All Orders
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddProductOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Luxury Product
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="relative overflow-hidden group hover:border-gold-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Total Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-gold-primary/10 border border-gold-primary/20 flex items-center justify-center text-gold-primary">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white text-gold-gradient">
              ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h3>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Live verified revenue</span>
            </div>
          </div>
        </Card>

        {/* Total Orders */}
        <Card className="relative overflow-hidden group hover:border-gold-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Total Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white">{totalOrders}</h3>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-zinc-400">
              <span className="text-amber-400 font-semibold">{orderStats.pending}</span> pending fulfillment
            </div>
          </div>
        </Card>

        {/* Total Products */}
        <Card className="relative overflow-hidden group hover:border-gold-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Products in Vault
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white">{totalProducts}</h3>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-zinc-400">
              {lowStockProducts.length > 0 ? (
                <span className="text-red-400 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {lowStockProducts.length} low in stock
                </span>
              ) : (
                <span className="text-emerald-400">Inventory healthy</span>
              )}
            </div>
          </div>
        </Card>

        {/* Total Customers */}
        <Card className="relative overflow-hidden group hover:border-gold-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              VIP Clientele
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white">{totalCustomers}</h3>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-zinc-400">
              <span className="text-gold-light font-medium">{totalCustomers} active client(s)</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800/80">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wide">
                Revenue & Sales Trajectory
              </h3>
              <p className="text-xs text-zinc-400">
                Gross sales volume in INR (₹)
              </p>
            </div>
            <div className="flex items-center rounded-lg bg-zinc-900 p-1 border border-zinc-800">
              <button
                type="button"
                onClick={() => setTimeRange('monthly')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  timeRange === 'monthly'
                    ? 'bg-gold-primary text-black font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('weekly')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  timeRange === 'weekly'
                    ? 'bg-gold-primary text-black font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Weekly
              </button>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                <XAxis dataKey="name" stroke="#71717A" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#71717A"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => val >= 100000 ? `₹${(val / 100000).toFixed(1)}L` : val >= 1000 ? `₹${(val / 1000).toFixed(0)}k` : `₹${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#141418',
                    borderColor: '#D4AF37',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#D4AF37"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#goldGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Order Fulfillment Status Breakdown */}
        <Card className="space-y-4">
          <div className="pb-2 border-b border-zinc-800/80">
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Fulfillment Pipeline
            </h3>
            <p className="text-xs text-zinc-400">
              Live status of incoming orders
            </p>
          </div>

          <div className="space-y-3.5 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-zinc-300">Delivered</span>
                <span className="font-semibold text-emerald-400">{orderStats.delivered}</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(orderStats.delivered / (totalOrders || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-zinc-300">In Transit / Shipped</span>
                <span className="font-semibold text-sky-400">{orderStats.shipped}</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full"
                  style={{ width: `${(orderStats.shipped / (totalOrders || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-zinc-300">Processing in Vault</span>
                <span className="font-semibold text-gold-primary">{orderStats.processing}</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold-primary rounded-full"
                  style={{ width: `${(orderStats.processing / (totalOrders || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-zinc-300">Pending Review</span>
                <span className="font-semibold text-amber-400">{orderStats.pending}</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${(orderStats.pending / (totalOrders || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Stat Pill */}
          <div className="p-3 rounded-xl bg-gold-primary/5 border border-gold-primary/20 text-xs text-zinc-300 mt-4">
            <p className="font-semibold text-gold-light">Live Fulfillment Queue</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Active order pipeline synced directly with your Firebase database.
            </p>
          </div>
        </Card>
      </div>

      {/* Bottom Grid: Recent Orders & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wide">
                Recent VIP Orders
              </h3>
              <p className="text-xs text-zinc-400">Latest acquisitions placed on KINORA</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/orders')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              View All
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="pb-3 font-semibold">Order</th>
                  <th className="pb-3 font-semibold">Date & Time</th>
                  <th className="pb-3 font-semibold">Client</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {recentOrders.map((ord) => (
                  <tr
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className="hover:bg-zinc-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 font-mono font-medium text-white">{ord.orderNumber}</td>
                    <td className="py-3 whitespace-nowrap">
                      <p className="text-zinc-200 text-xs font-medium">
                        {ord.createdAt
                          ? new Date(ord.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                            })
                          : 'N/A'}
                      </p>
                      <p className="text-[10px] text-gold-light/90 font-mono mt-0.5 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-gold-primary shrink-0" />
                        {ord.createdAt
                          ? new Date(ord.createdAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })
                          : '--:--'}
                      </p>
                    </td>
                    <td className="py-3">
                      <p className="font-medium text-zinc-200">{ord.customerName}</p>
                      <p className="text-[10px] text-zinc-500">{ord.items.length} item(s)</p>
                    </td>
                    <td className="py-3">{getStatusBadge(ord.orderStatus)}</td>
                    <td className="py-3 text-right font-bold text-gold-light">
                      ₹{ord.totalAmount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Low Stock Warning Card */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Inventory Alerts</span>
              </h3>
              <p className="text-xs text-zinc-400">Vault stock requiring attention</p>
            </div>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              All inventory levels are fully stocked.
            </div>
          ) : (
            <div className="space-y-2.5">
              {lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-[#151519] border border-zinc-800/80 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-black border border-zinc-800 overflow-hidden shrink-0">
                      {p.images[0]?.url ? (
                        <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
                          -
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{p.name}</p>
                      <p className="text-[10px] text-zinc-400">{p.category}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        p.stock === 0
                          ? 'bg-red-950/60 text-red-400 border border-red-800/50'
                          : 'bg-amber-950/60 text-amber-400 border border-amber-800/50'
                      }`}
                    >
                      {p.stock === 0 ? 'Out of Stock' : `${p.stock} left`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={() => navigate('/admin/products')}
          >
            Manage Vault Inventory
          </Button>
        </Card>
      </div>

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
      />

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </div>
  );
};
