import React, { useState } from 'react';
import { TicketPercent, Plus, Edit2, Trash2, Copy, Check, Calendar } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Coupon } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { CouponFormModal } from '../components/coupons/CouponFormModal';

export const Coupons: React.FC = () => {
  const { coupons, deleteCoupon, updateCoupon } = useStore();

  const [couponToEdit, setCouponToEdit] = useState<Coupon | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleEdit = (coupon: Coupon) => {
    setCouponToEdit(coupon);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setCouponToEdit(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteCoupon(id);
    setDeleteConfirmId(null);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    const nextStatus = coupon.status === 'active' ? 'disabled' : 'active';
    await updateCoupon(coupon.id, { status: nextStatus });
  };

  const getStatusBadge = (status: Coupon['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'expired':
        return <Badge variant="danger">Expired</Badge>;
      case 'disabled':
        return <Badge variant="neutral">Disabled</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            Coupon & Privilege Codes
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Create bespoke promotional codes, VIP discount vouchers, and seasonal campaign incentives.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleAddNew}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Coupon
        </Button>
      </div>

      {/* Coupon Grid */}
      {coupons.length === 0 ? (
        <EmptyState
          icon={<TicketPercent className="w-8 h-8" />}
          title="No Coupons Created"
          description="Offer your clients an exclusive incentive by creating your first promotional coupon."
          actionLabel="Create Coupon"
          onAction={handleAddNew}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {coupons.map((coupon) => (
            <Card
              key={coupon.id}
              className="p-5 flex flex-col justify-between group hover:border-gold-primary/50 transition-all space-y-4"
            >
              {/* Header with Code & Copy */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-gold-light tracking-wider bg-gold-primary/10 border border-gold-primary/30 px-3 py-1 rounded-lg">
                      {coupon.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(coupon.code)}
                      className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                      title="Copy Coupon Code"
                    >
                      {copiedCode === coupon.code ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-zinc-400 mt-2 font-medium">
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountValue}% Off Entire Order`
                      : `₹${coupon.discountValue.toLocaleString('en-IN')} Fixed Discount`}
                  </p>
                </div>
                <div>{getStatusBadge(coupon.status)}</div>
              </div>

              {/* Requirements & Limits */}
              <div className="space-y-1.5 text-xs text-zinc-400 pt-2 border-t border-zinc-800/80">
                <div className="flex justify-between">
                  <span>Minimum Cart:</span>
                  <span className="text-zinc-200 font-medium">
                    {coupon.minPurchase > 0 ? `₹${coupon.minPurchase.toLocaleString('en-IN')}` : 'No Minimum'}
                  </span>
                </div>
                {coupon.maxDiscount && (
                  <div className="flex justify-between">
                    <span>Discount Cap:</span>
                    <span className="text-zinc-200 font-medium">
                      ₹{coupon.maxDiscount.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Usage Count:</span>
                  <span className="text-zinc-200 font-medium">
                    {coupon.usageCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : 'times'}
                  </span>
                </div>
                <div className="flex justify-between pt-1 text-[11px] text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Expires:</span>
                  </span>
                  <span>{new Date(coupon.expiryDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(coupon)}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  {coupon.status === 'active' ? 'Disable Code' : 'Enable Code'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleEdit(coupon)}
                    className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-gold-primary transition-colors"
                    title="Edit Coupon"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(coupon.id)}
                    className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-red-400 hover:border-red-600 transition-colors"
                    title="Delete Coupon"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Coupon Modal */}
      <CouponFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCouponToEdit(null);
        }}
        couponToEdit={couponToEdit}
      />

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#121215] border border-red-900/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-white">Delete Coupon Code</h3>
            <p className="text-xs text-zinc-400">
              Are you sure you want to permanently delete this coupon? Patrons will no longer be able to apply it during checkout.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(deleteConfirmId)}>
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
