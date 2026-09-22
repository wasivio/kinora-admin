import React, { useState, useEffect } from 'react';
import { Banner } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Upload } from 'lucide-react';
import { uploadImageToCloudinary } from '../../lib/cloudinary';

interface BannerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  bannerToEdit?: Banner | null;
}

export const BannerFormModal: React.FC<BannerFormModalProps> = ({
  isOpen,
  onClose,
  bannerToEdit,
}) => {
  const { addBanner, updateBanner } = useStore();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [position, setPosition] = useState<Banner['position']>('hero');
  const [status, setStatus] = useState<Banner['status']>('active');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bannerToEdit) {
      setTitle(bannerToEdit.title);
      setSubtitle(bannerToEdit.subtitle || '');
      setImageUrl(bannerToEdit.imageUrl);
      setLinkUrl(bannerToEdit.linkUrl || '');
      setPosition(bannerToEdit.position);
      setStatus(bannerToEdit.status);
      setStartDate(bannerToEdit.startDate || '');
      setEndDate(bannerToEdit.endDate || '');
    } else {
      setTitle('');
      setSubtitle('');
      setImageUrl('');
      setLinkUrl('');
      setPosition('hero');
      setStatus('active');
      setStartDate('');
      setEndDate('');
    }
    setError(null);
  }, [bannerToEdit, isOpen]);

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
    if (!title.trim()) {
      setError('Banner title is required.');
      return;
    }
    if (!imageUrl.trim()) {
      setError('Banner image is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        imageUrl: imageUrl.trim(),
        linkUrl: linkUrl.trim() || undefined,
        position,
        status,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      if (bannerToEdit) {
        await updateBanner(bannerToEdit.id, payload);
      } else {
        await addBanner(payload);
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save banner.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={bannerToEdit ? 'Edit Promotional Banner' : 'Create New Banner'}
      subtitle="Configure luxury hero showcases and announcements."
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
            {bannerToEdit ? 'Save Changes' : 'Publish Banner'}
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
          label="Banner Headline *"
          placeholder="e.g. Autumn / Winter Haute Couture 2026"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Input
          label="Subtitle / Description"
          placeholder="e.g. The Gilded Majesty Collection — Handwoven silks..."
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
        />

        {/* Image upload & URL */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-zinc-300">
            Banner Image *
          </label>
          {imageUrl && (
            <div className="relative w-full h-36 rounded-xl overflow-hidden border border-gold-primary/30 bg-black">
              <img src={imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="Paste image URL..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="text-xs"
              required
            />
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 hover:text-white hover:border-gold-primary cursor-pointer shrink-0 transition-colors">
              <Upload className="w-3.5 h-3.5 text-gold-primary" />
              <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFile}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Placement Position
            </label>
            <select
              className="w-full bg-[#121215] text-[#F4F4F5] text-sm rounded-lg border border-zinc-800 p-2 focus:border-gold-primary"
              value={position}
              onChange={(e) => setPosition(e.target.value as Banner['position'])}
            >
              <option value="hero">Main Hero Slider</option>
              <option value="top_strip">Top Announcement Strip</option>
              <option value="promotional">Promotional Highlight</option>
              <option value="sidebar">Sidebar Feature</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Status
            </label>
            <select
              className="w-full bg-[#121215] text-[#F4F4F5] text-sm rounded-lg border border-zinc-800 p-2 focus:border-gold-primary"
              value={status}
              onChange={(e) => setStatus(e.target.value as Banner['status'])}
            >
              <option value="active">Active (Visible)</option>
              <option value="inactive">Inactive (Hidden)</option>
            </select>
          </div>
        </div>

        <Input
          label="Destination URL / Link"
          placeholder="e.g. /collections/haute-couture"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Schedule Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="Schedule End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};
