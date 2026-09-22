import React, { useState, useEffect } from 'react';
import { Product, ProductImage, ProductVariant } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { ProductImageUploader } from './ProductImageUploader';
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
    }
    setError(null);
  }, [productToEdit, isOpen, categories]);

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

    setIsSubmitting(true);
    setError(null);

    try {
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
        status,
        featured,
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

        {/* Section 4: Variants */}
        <div className="space-y-4 pt-2">
          <ProductVariantManager variants={variants} onChange={setVariants} />
        </div>
      </form>
    </Modal>
  );
};
