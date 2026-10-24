import React, { useState, useEffect } from 'react';
import { Banknote, CreditCard, ShieldCheck } from 'lucide-react';
import { Product, ProductImage, ProductVariant, SizeChart } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { ProductImageUploader } from './ProductImageUploader';
import { SizeChartUploader, sanitizeImageUrl } from './SizeChartUploader';
import { ProductVariantManager } from './ProductVariantManager';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { categories, addProduct, updateProduct } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [price, setPrice] = useState<string>('');
  const [discount, setDiscount] = useState<string>('');
  const [stock, setStock] = useState<string>('');
  const [sku, setSku] = useState('');
  const [status, setStatus] = useState<Product['status']>('active');
  const [featured, setFeatured] = useState(false);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [sizeChart, setSizeChart] = useState<SizeChart | null>(null);

  // Payment Settings State
  const [allowCOD, setAllowCOD] = useState<boolean>(true);
  const [allowUPI, setAllowUPI] = useState<boolean>(true);
  const [codCharge, setCodCharge] = useState<string>('0');
  const [codPreset, setCodPreset] = useState<'0' | '50' | '100' | 'custom'>('0');

  // Selected Category's subcategories
  const selectedCatObj = categories.find((c) => c.name === category);

  // Reset or prefill on open/change
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setDescription(productToEdit.description);
      setCategory(productToEdit.category);
      setSubcategory(productToEdit.subcategory || '');
      setPrice(productToEdit.price.toString());
      setDiscount(productToEdit.discount ? productToEdit.discount.toString() : '');
      setStock(productToEdit.stock.toString());
      setSku(productToEdit.SKU);
      setStatus(productToEdit.status);
      setFeatured(productToEdit.featured);
      setImages(productToEdit.images || []);
      setVariants(productToEdit.variants || []);

      const editSizeChart =
        productToEdit.sizeChart && productToEdit.sizeChart.url
          ? { url: sanitizeImageUrl(productToEdit.sizeChart.url), publicId: productToEdit.sizeChart.publicId }
          : productToEdit.sizeChartUrl
          ? { url: sanitizeImageUrl(productToEdit.sizeChartUrl), publicId: productToEdit.sizeChartPublicId || undefined }
          : null;
      setSizeChart(editSizeChart);

      const editAllowCOD =
        productToEdit.allowCOD ?? productToEdit.paymentSettings?.allowCOD ?? true;
      const editAllowUPI =
        productToEdit.allowUPI ?? productToEdit.paymentSettings?.allowUPI ?? true;
      const editCodCharge =
        productToEdit.codCharge ?? productToEdit.paymentSettings?.codCharge ?? 0;

      setAllowCOD(editAllowCOD);
      setAllowUPI(editAllowUPI);
      setCodCharge(editCodCharge.toString());

      if (editCodCharge === 0) setCodPreset('0');
      else if (editCodCharge === 50) setCodPreset('50');
      else if (editCodCharge === 100) setCodPreset('100');
      else setCodPreset('custom');
    } else {
      setName('');
      setDescription('');
      setCategory(categories[0]?.name || '');
      setSubcategory('');
      setPrice('');
      setDiscount('');
      setStock('10');
      setSku(`KN-${Math.floor(1000 + Math.random() * 9000)}`);
      setStatus('active');
      setFeatured(false);
      setImages([]);
      setVariants([]);
      setSizeChart(null);
      setAllowCOD(true);
      setAllowUPI(true);
      setCodCharge('0');
      setCodPreset('0');
    }
    setError(null);
  }, [productToEdit, isOpen, categories]);

  const handleSelectPreset = (preset: '0' | '50' | '100' | 'custom') => {
    setCodPreset(preset);
    if (preset === '0') setCodCharge('0');
    else if (preset === '50') setCodCharge('50');
    else if (preset === '100') setCodCharge('100');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      setError('Please provide a valid price.');
      return;
    }
    if (stock === '' || isNaN(Number(stock)) || Number(stock) < 0) {
      setError('Please provide a valid stock quantity.');
      return;
    }
    if (!category) {
      setError('Please select a category.');
      return;
    }
    if (!allowCOD && !allowUPI) {
      setError('At least one payment method (Cash on Delivery or UPI / Online) must be enabled.');
      return;
    }
    if (allowCOD && (codCharge === '' || isNaN(Number(codCharge)) || Number(codCharge) < 0)) {
      setError('Please enter a valid COD extra charge (₹0 or greater).');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const numericCodCharge = allowCOD ? Math.max(0, Number(codCharge) || 0) : 0;
      const cleanSizeChartUrl = sizeChart?.url ? sanitizeImageUrl(sizeChart.url) : null;
      const cleanSizeChart = cleanSizeChartUrl
        ? {
            url: cleanSizeChartUrl,
            publicId: sizeChart?.publicId || 'url_external',
          }
        : null;

      const prodPayload = {
        name: name.trim(),
        description: description.trim(),
        category,
        categoryId: selectedCatObj?.id,
        subcategory: subcategory || undefined,
        price: Number(price),
        discount: discount ? Number(discount) : undefined,
        stock: Number(stock),
        SKU: sku.trim() || `KN-${Math.floor(1000 + Math.random() * 9000)}`,
        images,
        variants,
        sizeChart: cleanSizeChart,
        sizeChartUrl: cleanSizeChartUrl,
        sizeChartPublicId: cleanSizeChart?.publicId || null,
        status,
        featured,
        allowCOD,
        allowUPI,
        codCharge: numericCodCharge,
        paymentSettings: {
          allowCOD,
          allowUPI,
          codCharge: numericCodCharge,
        },
      };

      if (productToEdit) {
        await updateProduct(productToEdit.id, prodPayload);
      } else {
        await addProduct(prodPayload);
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={productToEdit ? 'Edit Luxury Product' : 'Add New Luxury Product'}
      subtitle="Configure product details, Cloudinary imagery, pricing, and variants."
      size="2xl"
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
            {productToEdit ? 'Save Changes' : 'Publish Product'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-800 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Section 1: General Details */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gold-light border-b border-zinc-800 pb-1.5">
            General Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Product Title *"
                placeholder="e.g. KINORA Royal Aurelia 18K Gold Diamond Choker"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                label="SKU (Stock Keeping Unit) *"
                placeholder="KN-JW-001"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Category *
              </label>
              <select
                className="w-full bg-[#121215] text-[#F4F4F5] text-sm rounded-lg border border-zinc-800 focus:border-gold-primary focus:ring-1 focus:ring-gold-primary/30 p-2"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSubcategory('');
                }}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedCatObj && selectedCatObj.subcategories.length > 0 && (
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Subcategory
                </label>
                <select
                  className="w-full bg-[#121215] text-[#F4F4F5] text-sm rounded-lg border border-zinc-800 focus:border-gold-primary focus:ring-1 focus:ring-gold-primary/30 p-2"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                >
                  <option value="">None / General</option>
                  {selectedCatObj.subcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Product Description
              </label>
              <textarea
                rows={3}
                className="w-full bg-[#121215] text-[#F4F4F5] placeholder-zinc-500 text-sm rounded-lg border border-zinc-800 focus:border-gold-primary focus:ring-1 focus:ring-gold-primary/30 p-3"
                placeholder="Detailed craftmanship, materials, carat weight, origin..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Pricing & Inventory */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gold-light border-b border-zinc-800 pb-1.5">
            Pricing & Inventory
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Regular Price (₹) *"
              type="number"
              placeholder="12500"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <Input
              label="Discount Price (₹)"
              type="number"
              placeholder="11200 (optional)"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
            <Input
              label="Stock Quantity *"
              type="number"
              placeholder="10"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Status
              </label>
              <select
                className="w-full bg-[#121215] text-[#F4F4F5] text-sm rounded-lg border border-zinc-800 focus:border-gold-primary focus:ring-1 focus:ring-gold-primary/30 p-2"
                value={status}
                onChange={(e) => setStatus(e.target.value as Product['status'])}
              >
                <option value="active">Active (Visible in Store)</option>
                <option value="draft">Draft (Hidden)</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="featured-toggle"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 text-gold-primary focus:ring-gold-primary bg-zinc-900 cursor-pointer"
              />
              <label
                htmlFor="featured-toggle"
                className="text-xs font-medium text-zinc-300 cursor-pointer"
              >
                Feature on KINORA Homepage & Hero Showcases
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Cloudinary Image Management */}
        <div className="space-y-4 pt-2">
          <ProductImageUploader images={images} onChange={setImages} />
        </div>

        {/* Section 4: Size Chart Management */}
        <div className="space-y-4 pt-2">
          <SizeChartUploader sizeChart={sizeChart} onChange={setSizeChart} />
        </div>

        {/* Section 5: Variants */}
        <div className="space-y-4 pt-2">
          <ProductVariantManager variants={variants} onChange={setVariants} />
        </div>

        {/* Section 6: Payment & Checkout Settings */}
        <div className="space-y-4 pt-2">
          <div className="border-b border-zinc-800 pb-1.5 flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gold-light">
              Payment & Checkout Settings
            </h4>
            <span className="text-[10px] text-zinc-500">Per-product gateways & delivery charges</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* COD Toggle Box */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                allowCOD
                  ? 'bg-zinc-900/60 border-gold-primary/40'
                  : 'bg-zinc-950/40 border-zinc-800/80 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`p-2 rounded-lg ${
                      allowCOD ? 'bg-gold-primary/20 text-gold-light' : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Cash on Delivery (COD)</span>
                    <span className="text-[10px] text-zinc-400">Allow customers to pay upon delivery</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowCOD}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      if (!checked && !allowUPI) {
                        setError('Cannot disable both COD and UPI. At least one payment method must remain active.');
                        return;
                      }
                      setError(null);
                      setAllowCOD(checked);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-primary"></div>
                </label>
              </div>

              {/* COD Extra Charge Controls (Only shown if allowCOD is true) */}
              {allowCOD && (
                <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-medium text-zinc-300">COD Extra Handling Fee:</span>
                    <span className="text-[11px] font-bold text-gold-light font-mono">
                      {Number(codCharge) === 0 ? 'Free (₹0)' : `+₹${Number(codCharge).toLocaleString('en-IN')}`}
                    </span>
                  </div>

                  {/* Preset Pills */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['0', '50', '100', 'custom'] as const).map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all text-center border ${
                          codPreset === preset
                            ? 'bg-gold-primary text-black border-gold-primary shadow-sm'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        {preset === '0' ? '₹0' : preset === '50' ? '₹50' : preset === '100' ? '₹100' : 'Custom'}
                      </button>
                    ))}
                  </div>

                  {/* Custom Charge Input */}
                  {codPreset === 'custom' && (
                    <div className="pt-1">
                      <Input
                        label="Custom COD Fee (₹)"
                        type="number"
                        placeholder="Enter custom COD charge amount"
                        value={codCharge}
                        onChange={(e) => setCodCharge(e.target.value)}
                        min="0"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* UPI & Online Payment Toggle Box */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                allowUPI
                  ? 'bg-zinc-900/60 border-gold-primary/40'
                  : 'bg-zinc-950/40 border-zinc-800/80 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`p-2 rounded-lg ${
                      allowUPI ? 'bg-gold-primary/20 text-gold-light' : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">UPI / Online Payment</span>
                    <span className="text-[10px] text-zinc-400">Razorpay, UPI, NetBanking, Cards</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowUPI}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      if (!checked && !allowCOD) {
                        setError('Cannot disable both COD and UPI. At least one payment method must remain active.');
                        return;
                      }
                      setError(null);
                      setAllowUPI(checked);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-primary"></div>
                </label>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/80">
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    {allowUPI
                      ? 'Online payments eligible via Razorpay 256-bit gateway'
                      : 'Online payment disabled for this product'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};
