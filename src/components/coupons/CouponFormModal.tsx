import React, { useState, useEffect } from 'react';
import { Coupon } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface CouponFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  couponToEdit?: Coupon | null;
}

export const CouponFormModal: React.FC<CouponFormModalProps> = ({
  isOpen,
  onClose,
  couponToEdit,
}) => {
  const { addCoupon, updateCoupon } = useStore();
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<Coupon['discountType']>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minPurchase, setMinPurchase] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [status, setStatus] = useState<Coupon['status']>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (couponToEdit) {
      setCode(couponToEdit.code);
      setDiscountType(couponToEdit.discountType);
      setDiscountValue(couponToEdit.discountValue.toString());
      setMinPurchase(couponToEdit.minPurchase.toString());
      setMaxDiscount(couponToEdit.maxDiscount ? couponToEdit.maxDiscount.toString() : '');
      setStartDate(couponToEdit.startDate || '');
      setExpiryDate(couponToEdit.expiryDate);
      setUsageLimit(couponToEdit.usageLimit ? couponToEdit.usageLimit.toString() : '');
      setStatus(couponToEdit.status);
    } else {
      setCode('');
      setDiscountType('percentage');
      setDiscountValue('10');
      setMinPurchase('1000');
      setMaxDiscount('');
      setStartDate(new Date().toISOString().split('T')[0]);
      // Default expiry 30 days ahead
      const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
      setExpiryDate(nextMonth);
      setUsageLimit('100');
      setStatus('active');
    }
    setError(null);
  }, [couponToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Coupon code is required.');
      return;
    }
    if (!discountValue || isNaN(Number(discountValue)) || Number(discountValue) <= 0) {
      setError('Please provide a valid discount value.');
      return;
    }
    if (!expiryDate) {
      setError('Expiration date is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minPurchase: Number(minPurchase) || 0,
        maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
        startDate: startDate || undefined,
        expiryDate,
        usageLimit: usageLimit ? Number(usageLimit) : undefined,
        usageCount: couponToEdit ? couponToEdit.usageCount : 0,
        status,
      };

      if (couponToEdit) {
        await updateCoupon(couponToEdit.id, payload);
      } else {
        await addCoupon(payload);
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save coupon.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={couponToEdit ? 'Edit Coupon Code' : 'Generate New Coupon Code'}
      subtitle="Define discount rules, minimum order thresholds, and limits."
      size="md"
      footer={
        <>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            {couponToEdit ? 'Save Changes' : 'Create Coupon'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-800 text-xs text-red-300">
            {error}
          </div>
        )}

        <Input
          label="Coupon Code *"
          placeholder="e.g. KINORAVIP10"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Discount Type
            </label>
            <select
              className="w-full bg-[#121215] text-[#F4F4F5] text-sm rounded-lg border border-zinc-800 p-2 focus:border-gold-primary"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as Coupon['discountType'])}
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </select>
          </div>

          <Input
            label={discountType === 'percentage' ? 'Percentage Off (%) *' : 'Fixed Discount (₹) *'}
            type="number"
            placeholder={discountType === 'percentage' ? '15' : '250'}
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Minimum Cart Spend (₹)"
            type="number"
            placeholder="1000"
            value={minPurchase}
            onChange={(e) => setMinPurchase(e.target.value)}
          />

          <Input
            label="Max Discount Cap (₹)"
            type="number"
            placeholder="500 (optional)"
            value={maxDiscount}
            onChange={(e) => setMaxDiscount(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <Input
            label="Expiration Date *"
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Total Usage Limit"
            type="number"
            placeholder="100"
            value={usageLimit}
            onChange={(e) => setUsageLimit(e.target.value)}
          />

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Status
            </label>
            <select
              className="w-full bg-[#121215] text-[#F4F4F5] text-sm rounded-lg border border-zinc-800 p-2 focus:border-gold-primary"
              value={status}
              onChange={(e) => setStatus(e.target.value as Coupon['status'])}
            >
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
};
