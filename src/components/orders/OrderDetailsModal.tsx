import React, { useState } from 'react';
import { Order } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Input } from '../common/Input';
import { Printer, Truck, CreditCard } from 'lucide-react';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const { updateOrderStatus, updatePaymentStatus } = useStore();
  const [selectedStatus, setSelectedStatus] = useState<Order['orderStatus']>(order?.orderStatus || 'pending');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<Order['paymentStatus']>(order?.paymentStatus || 'paid');
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || '');
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync state when order changes
  React.useEffect(() => {
    if (order) {
      setSelectedStatus(order.orderStatus);
      setSelectedPaymentStatus(order.paymentStatus);
      setTrackingNumber(order.trackingNumber || '');
    }
  }, [order]);

  if (!order) return null;

  const handleSaveChanges = async () => {
    setIsUpdating(true);
    try {
      await updateOrderStatus(order.id, selectedStatus, trackingNumber.trim() || undefined);
      await updatePaymentStatus(order.id, selectedPaymentStatus);
      onClose();
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
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
      default:
        return <Badge variant="neutral">{status}</Badge>;
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order ${order.orderNumber}`}
      subtitle={`Placed on ${new Date(order.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`}
      size="2xl"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Print Invoice
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSaveChanges}
            isLoading={isUpdating}
          >
            Update Order
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Status & Quick Actions Bar */}
        <div className="p-4 rounded-xl bg-[#151519] border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-[10px] uppercase font-semibold text-zinc-400">
                Order Status
              </p>
              <div className="mt-1">{getStatusBadge(order.orderStatus)}</div>
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-zinc-400">
                Payment Status
              </p>
              <div className="mt-1">{getPaymentBadge(order.paymentStatus)}</div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[10px] uppercase font-semibold text-zinc-400">
              Total Value
            </p>
            <p className="text-lg font-bold text-gold-light mt-0.5">
              ₹{order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Status Update Controls */}
        <div className="p-4 rounded-xl bg-[#101013] border border-zinc-800/80 space-y-3">
          <h4 className="text-xs font-semibold text-gold-light uppercase tracking-wider">
            Update Fulfillment & Tracking
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Fulfillment Status
              </label>
              <select
                className="w-full bg-[#16161a] text-sm text-zinc-200 rounded-lg border border-zinc-700 p-2 focus:border-gold-primary"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as Order['orderStatus'])}
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing (In Vault)</option>
                <option value="shipped">Shipped (In Transit)</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Payment Status
              </label>
              <select
                className="w-full bg-[#16161a] text-sm text-zinc-200 rounded-lg border border-zinc-700 p-2 focus:border-gold-primary"
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value as Order['paymentStatus'])}
              >
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="refunded">Refunded</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <Input
                label="Tracking Number"
                placeholder="e.g. FDX-9823471029"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Customer & Shipping Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#101013] border border-zinc-800/80 space-y-2">
            <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-gold-primary" />
              <span>Customer Details</span>
            </h4>
            <p className="text-sm font-semibold text-white">{order.customerName}</p>
            <p className="text-xs text-zinc-400">{order.customerEmail}</p>
            {order.customerPhone && (
              <p className="text-xs text-zinc-400">{order.customerPhone}</p>
            )}
            <p className="text-xs text-zinc-500 pt-1">
              Payment Method: <span className="text-zinc-300 font-medium">{order.paymentMethod}</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#101013] border border-zinc-800/80 space-y-2">
            <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-gold-primary" />
              <span>Shipping Destination</span>
            </h4>
            <p className="text-xs text-zinc-300">{order.shippingAddress.street}</p>
            <p className="text-xs text-zinc-300">
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
            </p>
            <p className="text-xs text-zinc-300">{order.shippingAddress.country}</p>
            {order.trackingNumber && (
              <p className="text-xs text-gold-light pt-1">
                Tracking: <span className="font-mono">{order.trackingNumber}</span>
              </p>
            )}
          </div>
        </div>

        {/* Itemized Order Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Items Ordered ({order.items.length})
          </h4>
          <div className="border border-zinc-800/80 rounded-xl overflow-hidden divide-y divide-zinc-800/60 bg-[#101013]">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-black border border-zinc-800 overflow-hidden shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xs">
                        No img
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{item.name}</p>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                      {item.sku && <span>SKU: {item.sku}</span>}
                      {item.variant && <span>• Variant: {item.variant}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-zinc-300">
                    ₹{item.price.toLocaleString('en-IN')} &times; {item.quantity}
                  </p>
                  <p className="text-xs font-semibold text-gold-light mt-0.5">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}

            {/* Totals Breakdown */}
            <div className="p-4 bg-[#141418] space-y-1.5 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-zinc-200">₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount Applied</span>
                  <span>-₹{order.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Tax</span>
                <span className="text-zinc-200">₹{order.taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Insured White-Glove Shipping</span>
                <span className="text-zinc-200">
                  {order.shippingAmount === 0 ? 'Complimentary' : `₹${order.shippingAmount.toLocaleString('en-IN')}`}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-zinc-800 text-sm font-bold text-white">
                <span>Total</span>
                <span className="text-gold-light">₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
