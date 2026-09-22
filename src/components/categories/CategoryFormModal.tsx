import React, { useState, useEffect } from 'react';
import { Category } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Plus, X, Upload } from 'lucide-react';
import { uploadImageToCloudinary } from '../../lib/cloudinary';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  categoryToEdit,
}) => {
  const { addCategory, updateCategory } = useStore();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [subInput, setSubInput] = useState('');
  const [status, setStatus] = useState<Category['status']>('active');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setSlug(categoryToEdit.slug);
      setDescription(categoryToEdit.description || '');
      setImageUrl(categoryToEdit.image || '');
      setSubcategories(categoryToEdit.subcategories || []);
      setStatus(categoryToEdit.status);
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setImageUrl('');
      setSubcategories([]);
      setStatus('active');
    }
    setError(null);
  }, [categoryToEdit, isOpen]);

  // Auto-generate slug from name
  const handleNameChange = (val: string) => {
    setName(val);
    if (!categoryToEdit) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w ]+/g, '')
          .replace(/ +/g, '-')
      );
    }
  };

  const handleAddSubcategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subInput.trim()) return;
    if (!subcategories.includes(subInput.trim())) {
      setSubcategories([...subcategories, subInput.trim()]);
    }
    setSubInput('');
  };

  const handleRemoveSubcategory = (sub: string) => {
    setSubcategories(subcategories.filter((s) => s !== sub));
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadImageToCloudinary(file);
      setImageUrl(res.url);
    } catch (err: any) {
      setError(err.message || 'Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }
    if (!slug.trim()) {
      setError('Slug is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || '',
        image: imageUrl.trim() || '',
        subcategories,
        status,
      };

      if (categoryToEdit) {
        await updateCategory(categoryToEdit.id, payload);
      } else {
        await addCategory(payload);
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={categoryToEdit ? 'Edit Category' : 'Create New Category'}
      subtitle="Organize your luxury catalog and subcategories."
      size="lg"
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
            {categoryToEdit ? 'Save Changes' : 'Create Category'}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Category Name *"
            placeholder="e.g. High Jewelry"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
          />
          <Input
            label="URL Slug *"
            placeholder="high-jewelry"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Description
          </label>
          <textarea
            rows={2}
            className="w-full bg-[#121215] text-[#F4F4F5] placeholder-zinc-500 text-sm rounded-lg border border-zinc-800 focus:border-gold-primary focus:ring-1 focus:ring-gold-primary/30 p-2.5"
            placeholder="Brief overview of this luxury collection..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Category Image (Optional) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-zinc-300">
              Category Cover Image <span className="text-zinc-500 font-normal">(Optional)</span>
            </label>
            {imageUrl && (
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" />
                <span>Remove Image</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {imageUrl ? (
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-gold-primary/40 shrink-0 bg-black relative group">
                <img src={imageUrl} alt="Category" className="w-full h-full object-cover" />
              </div>
            ) : null}
            <div className="flex-1 space-y-2">
              <Input
                placeholder="Paste Image URL (optional) or choose file below"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="text-xs py-1.5"
              />
              {imageUrl.includes('ibb.co/') && !imageUrl.includes('i.ibb.co/') && (
                <p className="text-[11px] text-amber-400/90 bg-amber-950/30 border border-amber-800/50 p-2 rounded-lg leading-relaxed">
                  ⚠️ <strong>ImgBB Webpage Link Detected:</strong> Yeh ek webpage link hai. Image dikhane ke liye ImgBB par image par Right-Click karke <strong>"Copy image address"</strong> karein aur direct link daalein (jo <code>https://i.ibb.co/...</code> se shuru ho).
                </p>
              )}
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 hover:text-white hover:border-gold-primary cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-gold-primary" />
                  <span>{isUploading ? 'Uploading...' : 'Upload Image File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFile}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-zinc-500 italic">Optional</span>
              </div>
            </div>
          </div>
        </div>

        {/* Subcategories */}
        <div className="space-y-2 pt-2 border-t border-zinc-800/80">
          <label className="block text-xs font-medium text-zinc-300">
            Subcategories
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. Diamond Necklaces, Rings..."
              value={subInput}
              onChange={(e) => setSubInput(e.target.value)}
              className="text-xs"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddSubcategory}
              disabled={!subInput.trim()}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add
            </Button>
          </div>
          {subcategories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {subcategories.map((sub) => (
                <span
                  key={sub}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-700 text-xs text-zinc-200"
                >
                  {sub}
                  <button
                    type="button"
                    onClick={() => handleRemoveSubcategory(sub)}
                    className="text-zinc-400 hover:text-red-400 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Status */}
        <div className="pt-2">
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Status
          </label>
          <select
            className="w-full bg-[#121215] text-[#F4F4F5] text-sm rounded-lg border border-zinc-800 focus:border-gold-primary focus:ring-1 focus:ring-gold-primary/30 p-2"
            value={status}
            onChange={(e) => setStatus(e.target.value as Category['status'])}
          >
            <option value="active">Active (Visible)</option>
            <option value="inactive">Inactive (Hidden)</option>
          </select>
        </div>
      </form>
    </Modal>
  );
};
