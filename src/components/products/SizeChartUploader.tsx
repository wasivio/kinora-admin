import React, { useState, useRef } from 'react';
import {
  Ruler,
  Upload,
  Link as LinkIcon,
  Trash2,
  Eye,
  RefreshCw,
  AlertCircle,
  Loader2,
  CheckCircle2,
  X,
  ExternalLink,
  Edit2,
} from 'lucide-react';
import { SizeChart } from '../../types';
import { uploadImageToCloudinary, uploadImageUrlToCloudinary } from '../../lib/cloudinary';
import { Button } from '../common/Button';
import { toast } from 'sonner';

interface SizeChartUploaderProps {
  sizeChart: SizeChart | null;
  onChange: (sizeChart: SizeChart | null) => void;
}

export const SizeChartUploader: React.FC<SizeChartUploaderProps> = ({
  sizeChart,
  onChange,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [isUrlInputVisible, setIsUrlInputVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  // Validate HTTP/HTTPS image URL format
  const isValidUrl = (urlStr: string): boolean => {
    try {
      const parsed = new URL(urlStr.trim());
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Direct file upload from device
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image MIME type
    if (!file.type.startsWith('image/')) {
      setUploadError('Invalid file type. Please upload an image file (PNG, JPG, WEBP, or SVG).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds 10MB limit. Please choose a smaller image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const res = await uploadImageToCloudinary(file, 'kinora/size-charts');
      onChange({
        url: res.url,
        publicId: res.publicId,
      });
      setIsUrlInputVisible(false);
      setUrlInput('');
      toast.success('Size chart image uploaded successfully');
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload size chart image.');
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
    }
  };

  // Add / Change via Image URL
  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = urlInput.trim();

    if (!cleanUrl) {
      setUploadError('Please provide a valid image URL.');
      return;
    }

    if (!isValidUrl(cleanUrl)) {
      setUploadError('Invalid URL protocol. URL must start with http:// or https://');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const res = await uploadImageUrlToCloudinary(cleanUrl, 'kinora/size-charts');
      onChange({
        url: res.url,
        publicId: res.publicId,
      });
      setIsUrlInputVisible(false);
      setUrlInput('');
      toast.success('Size chart image attached successfully');
    } catch (err: any) {
      setUploadError(err.message || 'Failed to attach image from URL.');
      toast.error('Failed to attach image URL');
    } finally {
      setIsUploading(false);
    }
  };

  // Remove size chart
  const handleRemove = () => {
    onChange(null);
    setIsUrlInputVisible(false);
    setUrlInput('');
    setUploadError(null);
    toast.info('Size chart removed');
  };

  // Open "Change URL" input prefilled
  const handleOpenChangeUrl = () => {
    setUrlInput(sizeChart?.url || '');
    setIsUrlInputVisible(true);
  };

  return (
    <div className="space-y-3">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
        className="hidden"
      />
      <input
        type="file"
        ref={replaceFileInputRef}
        onChange={handleFileUpload}
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
        className="hidden"
      />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-1.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-gold-primary/10 text-gold-primary">
            <Ruler className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gold-light">
              Size Chart Management
            </h4>
            <p className="text-[10px] text-zinc-400">
              Attach sizing guide table or diagram for this garment / jewelry piece
            </p>
          </div>
        </div>

        {sizeChart && (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/80">
            <CheckCircle2 className="w-3 h-3" />
            Size Chart Active
          </span>
        )}
      </div>

      {/* Error Banner */}
      {uploadError && (
        <div className="p-2.5 rounded-lg bg-red-950/50 border border-red-800/80 text-xs text-red-300 flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{uploadError}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-red-400 hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* STATE 1: NO SIZE CHART ATTACHED (UPLOAD & URL OPTIONS)   */}
      {/* ======================================================== */}
      {!sizeChart ? (
        <div className="space-y-3">
          <div className="p-5 rounded-xl border-2 border-dashed border-zinc-800 hover:border-gold-primary/40 bg-[#121215] transition-all flex flex-col items-center justify-center text-center">
            {isUploading ? (
              <div className="py-6 flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-gold-primary animate-spin" />
                <p className="text-xs font-semibold text-zinc-200">
                  Uploading size chart image to Cloudinary...
                </p>
                <p className="text-[10px] text-zinc-500">
                  Optimizing dimensions and generating secure CDN URL
                </p>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-gold-primary mb-2.5 shadow-md">
                  <Ruler className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-zinc-200 mb-1">
                  Upload Size Chart or Sizing Diagram
                </p>
                <p className="text-[11px] text-zinc-400 max-w-sm mb-4 leading-relaxed">
                  Provide customer sizing guidelines (dimensions, ring sizes, chest, waist). Supports PNG, JPG, WEBP up to 10MB.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    leftIcon={<Upload className="w-3.5 h-3.5" />}
                  >
                    Upload from Device
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsUrlInputVisible((prev) => !prev)}
                    leftIcon={<LinkIcon className="w-3.5 h-3.5" />}
                  >
                    {isUrlInputVisible ? 'Close URL Input' : 'Add via Image URL'}
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* URL Input Drawer */}
          {isUrlInputVisible && !isUploading && (
            <form
              onSubmit={handleUrlSubmit}
              className="p-3 rounded-xl bg-[#16161a] border border-zinc-800 flex flex-wrap sm:flex-nowrap items-center gap-2"
            >
              <div className="relative flex-1 w-full">
                <LinkIcon className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="https://example.com/size-charts/women-ring-chart.png"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full bg-[#1b1b22] text-xs text-zinc-200 placeholder-zinc-500 pl-8 pr-3 py-2 rounded-lg border border-zinc-700 focus:border-gold-primary focus:outline-none"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isUploading}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Attach URL
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsUrlInputVisible(false);
                  setUrlInput('');
                }}
              >
                Cancel
              </Button>
            </form>
          )}
        </div>
      ) : (
        /* ======================================================== */
        /* STATE 2: SIZE CHART ATTACHED (PREVIEW, REPLACE, REMOVE)  */
        /* ======================================================== */
        <div className="p-3.5 rounded-xl bg-[#141418] border border-zinc-800 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Thumbnail & Meta */}
            <div className="flex items-center gap-3">
              <div
                onClick={() => setIsPreviewModalOpen(true)}
                className="relative w-20 h-20 rounded-lg bg-zinc-950 border border-zinc-700 overflow-hidden shrink-0 cursor-pointer group"
                title="Click to view full preview"
              >
                <img
                  src={sizeChart.url}
                  alt="Size Chart Preview"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Eye className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5 text-gold-primary" />
                    Product Size Chart Image
                  </span>
                  {sizeChart.publicId ? (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                      Cloudinary
                    </span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                      External URL
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 font-mono truncate max-w-xs sm:max-w-md">
                  {sizeChart.url}
                </p>
                <div className="flex items-center gap-3 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setIsPreviewModalOpen(true)}
                    className="text-[11px] text-gold-primary hover:underline flex items-center gap-1 font-medium"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View Full Size</span>
                  </button>
                  <a
                    href={sizeChart.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open in new tab</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => replaceFileInputRef.current?.click()}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                title="Upload another image to replace"
                isLoading={isUploading}
              >
                Replace
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleOpenChangeUrl}
                leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                title="Change or edit URL directly"
              >
                Change URL
              </Button>

              <button
                type="button"
                onClick={handleRemove}
                className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-900/60 transition-colors"
                title="Remove size chart"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Change URL Drawer */}
          {isUrlInputVisible && (
            <form
              onSubmit={handleUrlSubmit}
              className="p-3 rounded-xl bg-[#1b1b22] border border-zinc-700/80 flex flex-wrap sm:flex-nowrap items-center gap-2 pt-3"
            >
              <div className="relative flex-1 w-full">
                <LinkIcon className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="Paste replacement size chart URL..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full bg-[#121215] text-xs text-zinc-200 placeholder-zinc-500 pl-8 pr-3 py-2 rounded-lg border border-zinc-700 focus:border-gold-primary focus:outline-none"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isUploading}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Update URL
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsUrlInputVisible(false);
                  setUrlInput('');
                }}
              >
                Cancel
              </Button>
            </form>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* LIGHTBOX MODAL: FULL PREVIEW OF SIZE CHART               */}
      {/* ======================================================== */}
      {isPreviewModalOpen && sizeChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="relative max-w-3xl w-full bg-[#121215] border border-zinc-800 rounded-2xl p-4 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-gold-primary" />
                <h3 className="text-sm font-semibold text-white">Size Chart Preview</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Viewer */}
            <div className="flex-1 overflow-auto flex items-center justify-center bg-black/40 rounded-xl p-2 border border-zinc-800/80">
              <img
                src={sizeChart.url}
                alt="Full Size Chart"
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* Footer */}
            <div className="pt-3 mt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <span className="font-mono truncate max-w-sm">{sizeChart.url}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsPreviewModalOpen(false)}
              >
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
