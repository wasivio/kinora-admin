import React, { useState, useRef } from 'react';
import {
  Upload,
  Link as LinkIcon,
  Trash2,
  Star,
  Eye,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { ProductImage } from '../../types';
import { uploadImageToCloudinary, uploadImageUrlToCloudinary, isCloudinaryConfigured } from '../../lib/cloudinary';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface ProductImageUploaderProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
}

export const ProductImageUploader: React.FC<ProductImageUploaderProps> = ({
  images,
  onChange,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isConfigured = isCloudinaryConfigured();

  // Handle direct file upload from device
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const newUploadedImages: ProductImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          throw new Error(`File ${file.name} is not an image.`);
        }
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds 10MB limit.`);
        }

        const res = await uploadImageToCloudinary(file);
        newUploadedImages.push({
          url: res.url,
          publicId: res.publicId,
          isPrimary: images.length === 0 && newUploadedImages.length === 0, // First image is default primary
        });
      }

      onChange([...images, ...newUploadedImages]);
    } catch (err: any) {
      setUploadError(err.message || 'Error uploading file(s).');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle adding image via URL
  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const res = await uploadImageUrlToCloudinary(urlInput.trim());
      const newImage: ProductImage = {
        url: res.url,
        publicId: res.publicId,
        isPrimary: images.length === 0,
      };
      onChange([...images, newImage]);
      setUrlInput('');
    } catch (err: any) {
      setUploadError(err.message || 'Failed to add image from URL.');
    } finally {
      setIsUploading(false);
    }
  };

  // Set primary image
  const setPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    onChange(updated);
  };

  // Delete image
  const deleteImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    // If the deleted image was primary, make the first remaining image primary
    if (images[index]?.isPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    }
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
          Product Imagery
        </label>
        <span className="text-[11px] text-zinc-500">
          {images.length} image{images.length !== 1 ? 's' : ''} uploaded
        </span>
      </div>

      {/* Cloudinary Security Notice */}
      <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 flex items-start gap-2.5">
        <div className="text-gold-primary mt-0.5">
          <ImageIcon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-zinc-200 font-medium">Cloudinary Secure Upload</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Images are uploaded securely via Cloudinary Unsigned Presets. API secrets are never exposed to the client.
            {!isConfigured && ' (Currently running in Mock/Preview mode until Cloudinary credentials are added to .env)'}
          </p>
        </div>
      </div>

      {/* Upload Controls (Device + URL) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Device File Upload Drag & Drop */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-zinc-800 hover:border-gold-primary/60 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-[#101013] hover:bg-[#15151a] group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700 group-hover:border-gold-primary flex items-center justify-center text-zinc-400 group-hover:text-gold-primary mb-2 transition-colors">
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-gold-primary" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
          </div>
          <p className="text-xs font-semibold text-zinc-200 group-hover:text-gold-light">
            Upload from Device
          </p>
          <p className="text-[10px] text-zinc-500 mt-0.5">
            PNG, JPG, WEBP up to 10MB (Multiple supported)
          </p>
        </div>

        {/* Add via URL */}
        <div className="border border-zinc-800 rounded-xl p-4 bg-[#101013] flex flex-col justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-gold-primary" />
              <span>Add via Image URL</span>
            </p>
            <p className="text-[10px] text-zinc-500">
              Paste a public image link directly from the web
            </p>
          </div>
          <div className="flex gap-2 mt-3">
            <Input
              placeholder="https://example.com/image.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="text-xs py-1.5"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddUrl}
              isLoading={isUploading}
              disabled={!urlInput.trim()}
            >
              Add
            </Button>
          </div>
          {urlInput.includes('ibb.co/') && !urlInput.includes('i.ibb.co/') && (
            <p className="text-[11px] text-amber-400/90 bg-amber-950/30 border border-amber-800/50 p-2 rounded-lg leading-relaxed mt-2">
              ⚠️ <strong>ImgBB Webpage Link Detected:</strong> Yeh ek webpage link hai. Image open karne ke liye ImgBB page par image par Right-Click karke <strong>"Copy image address"</strong> karein (jaise: <code>https://i.ibb.co/.../image.png</code>).
            </p>
          )}
        </div>
      </div>

      {uploadError && (
        <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Image Gallery & Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Uploaded Images (Click star to set as primary)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img, index) => (
              <div
                key={index}
                className={`relative group rounded-xl overflow-hidden border transition-all ${
                  img.isPrimary
                    ? 'border-gold-primary ring-2 ring-gold-primary/30 shadow-gold-glow'
                    : 'border-zinc-800 hover:border-zinc-700'
                } bg-zinc-950 aspect-square`}
              >
                <img
                  src={img.url}
                  alt={`Product ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Primary Tag */}
                {img.isPrimary && (
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-gold-primary to-amber-600 text-black text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-black" />
                    <span>Primary</span>
                  </div>
                )}

                {/* Action Overlay */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  {/* Preview */}
                  <button
                    type="button"
                    onClick={() => setPreviewImage(img.url)}
                    className="p-1.5 rounded-lg bg-zinc-800 text-zinc-200 hover:text-white hover:bg-zinc-700 transition-colors"
                    title="Preview Image"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* Set as Primary */}
                  {!img.isPrimary && (
                    <button
                      type="button"
                      onClick={() => setPrimary(index)}
                      className="p-1.5 rounded-lg bg-zinc-800 text-gold-primary hover:text-gold-light hover:bg-zinc-700 transition-colors"
                      title="Set as Primary Image"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => deleteImage(index)}
                    className="p-1.5 rounded-lg bg-zinc-800 text-red-400 hover:text-red-300 hover:bg-red-950 transition-colors"
                    title="Delete Image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Lightbox Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden border border-gold-primary/40 shadow-2xl">
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 bg-black/80 hover:bg-black text-white p-2 rounded-full border border-zinc-700"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
