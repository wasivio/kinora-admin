import React, { useState } from 'react';
import { Customer } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { User, Mail, Phone, MapPin, ShoppingBag, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

export const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({
  isOpen,
  onClose,
  customer,
}) => {
  const { orders, updateCustomerStatus } = useStore();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!customer) return null;

  const customerOrders = orders.filter(
    (o) => o.customerId === customer.id || o.customerEmail.toLowerCase() === customer.email.toLowerCase()
  );

  const handleToggleStatus = async () => {
    setIsUpdating(true);
    try {
      const newStatus = customer.status === 'active' ? 'blocked' : 'active';
      await updateCustomerStatus(customer.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customer.name}
      subtitle={`Customer Account ID: ${customer.id}`}
      size="xl"
      footer={
        <>
          <Button
            type="button"
            variant={customer.status === 'active' ? 'danger' : 'primary'}
            size="sm"
            onClick={handleToggleStatus}
            isLoading={isUpdating}
            leftIcon={customer.status === 'active' ? <ShieldAlert className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          >
            {customer.status === 'active' ? 'Suspend / Block Customer' : 'Activate Customer'}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Customer Header Info */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-[#151519] border border-zinc-800">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gold-primary/40 bg-black shrink-0">
            {customer.avatar ? (
              <img src={customer.avatar} alt={customer.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600">
                <User className="w-8 h-8" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white truncate">{customer.name}</h3>
              <Badge variant={customer.status === 'active' ? 'success' : 'danger'}>
                {customer.status === 'active' ? 'Active VIP' : 'Blocked'}
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-zinc-500" />
              <span>{customer.email}</span>
            </p>
            {customer.phone && (
              <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-zinc-500" />
                <span>{customer.phone}</span>
              </p>
            )}
          </div>
        </div>

        {/* Customer Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-[#101013] border border-zinc-800/80">
            <p className="text-[10px] uppercase font-semibold text-zinc-400">Total Lifetime Spend</p>
            <p className="text-base font-bold text-gold-light mt-1">
              ₹{customer.totalSpent.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#101013] border border-zinc-800/80">
            <p className="text-[10px] uppercase font-semibold text-zinc-400">Orders Completed</p>
            <p className="text-base font-bold text-white mt-1">{customer.ordersCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-[#101013] border border-zinc-800/80 col-span-2 sm:col-span-1">
            <p className="text-[10px] uppercase font-semibold text-zinc-400">Member Since</p>
            <p className="text-xs font-medium text-zinc-300 mt-1">
              {new Date(customer.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Saved Address */}
        {customer.address && (
          <div className="p-4 rounded-xl bg-[#101013] border border-zinc-800/80 space-y-1">
            <p className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gold-primary" />
              <span>Registered Luxury Residence</span>
            </p>
            <p className="text-xs text-zinc-300">{customer.address}</p>
          </div>
        )}

        {/* Order History */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-gold-primary" />
            <span>Order History ({customerOrders.length})</span>
          </h4>
          {customerOrders.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-500 bg-[#101013] rounded-xl border border-zinc-800/60">
              No orders found for this customer.
            </div>
          ) : (
            <div className="border border-zinc-800/80 rounded-xl overflow-hidden divide-y divide-zinc-800/60 bg-[#101013]">
              {customerOrders.map((o) => (
                <div key={o.id} className="p-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-white">{o.orderNumber}</p>
                    <p className="text-[11px] text-zinc-400">
                      {new Date(o.createdAt).toLocaleDateString()} • {o.items.length} item(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gold-light">₹{o.totalAmount.toLocaleString('en-IN')}</p>
                    <span className="text-[10px] uppercase font-semibold text-zinc-400">
                      {o.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
