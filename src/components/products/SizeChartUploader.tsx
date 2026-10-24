import React, { useState, useRef, useEffect } from 'react';
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
  ClipboardPaste,
} from 'lucide-react';
import { SizeChart } from '../../types';
import { uploadImageToCloudinary, uploadImageUrlToCloudinary } from '../../lib/cloudinary';
import { Button } from '../common/Button';
import { toast } from 'sonner';

interface SizeChartUploaderProps {
  sizeChart: SizeChart | null;
  onChange: (sizeChart: SizeChart | null) => void;
}

// Clean and strip quotes, spaces from raw URL input
export const sanitizeImageUrl = (raw: string): string => {
  if (!raw) return '';
  return raw
    .trim()
    .replace(/^["'`]+|["'`]+$/g, '')
    .trim();
};

export const isValidHttpUrl = (raw: string): boolean => {
  const clean = sanitizeImageUrl(raw);
  if (!clean) return false;
  try {
    const parsed = new URL(clean);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const SizeChartUploader: React.FC<SizeChartUploaderProps> = ({
  sizeChart,
  onChange,
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'url'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  // Sync urlInput when sizeChart changes
  useEffect(() => {
    if (sizeChart?.url) {
      setUrlInput(sizeChart.url);
    }
  }, [sizeChart]);

  // Handle direct file upload from device
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Invalid file type. Please upload an image (PNG, JPG, WEBP, or SVG).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
      return;
    }

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
      setUrlInput(res.url);
      setIsEditingUrl(false);
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

  // Attach URL (Sanitizes quotes, validates URL, saves to product)
  const handleAttachUrl = async (overrideUrl?: string) => {
    const targetUrl = sanitizeImageUrl(overrideUrl !== undefined ? overrideUrl : urlInput);

    if (!targetUrl) {
      setUploadError('Please provide an image URL.');
      return;
    }

    if (!isValidHttpUrl(targetUrl)) {
      setUploadError('Invalid URL protocol. URL must start with http:// or https://');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const res = await uploadImageUrlToCloudinary(targetUrl, 'kinora/size-charts');
      onChange({
        url: res.url,
        publicId: res.publicId,
      });
      setUrlInput(res.url);
      setIsEditingUrl(false);
      toast.success('Size chart image attached successfully');
    } catch (err: any) {
      // Fallback directly to the targetUrl so user is never blocked
      onChange({
        url: targetUrl,
        publicId: `url_${Date.now()}`,
      });
      setUrlInput(targetUrl);
      setIsEditingUrl(false);
      toast.success('Size chart URL attached');
    } finally {
      setIsUploading(false);
    }
  };

  // Paste from clipboard helper
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const clean = sanitizeImageUrl(text);
      if (clean) {
        setUrlInput(clean);
        if (isValidHttpUrl(clean)) {
          handleAttachUrl(clean);
        }
      }
    } catch {
      toast.info('Please paste the image URL into the input box.');
    }
  };

  // Remove size chart
  const handleRemove = () => {
    onChange(null);
    setUrlInput('');
    setIsEditingUrl(false);
    setUploadError(null);
    toast.info('Size chart removed');
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

        {sizeChart?.url && (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/80">
            <CheckCircle2 className="w-3 h-3" />
            Size Chart Active
          </span>
        )}
      </div>

      {/* Error Alert Banner */}
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
      {/* STATE 1: ACTIVE SIZE CHART PREVIEW                       */}
      {/* ======================================================== */}
      {sizeChart?.url ? (
        <div className="p-3.5 rounded-xl bg-[#141418] border border-zinc-800 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Thumbnail & Info */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                onClick={() => setIsPreviewModalOpen(true)}
                className="relative w-20 h-20 rounded-lg bg-zinc-950 border border-zinc-700 overflow-hidden shrink-0 cursor-pointer group shadow-md"
                title="Click to view full preview"
              >
                <img
                  src={sizeChart.url}
                  alt="Size Chart Preview"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    // Fallback visual if URL fails to load in browser
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Eye className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5 text-gold-primary" />
                    Product Size Chart Image
                  </span>
                  {sizeChart.publicId?.startsWith('url') ? (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                      Image URL
                    </span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                      Cloudinary
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 font-mono truncate max-w-[200px] sm:max-w-md">
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

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => replaceFileInputRef.current?.click()}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                title="Upload image from device to replace"
                isLoading={isUploading}
              >
                Replace
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsEditingUrl((prev) => !prev);
                  setUrlInput(sizeChart.url);
                }}
                leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                title="Change image URL"
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

          {/* Change URL Input Drawer */}
          {isEditingUrl && (
            <div className="p-3 rounded-xl bg-[#1b1b22] border border-zinc-700/80 flex flex-wrap sm:flex-nowrap items-center gap-2 pt-3">
              <div className="relative flex-1 w-full">
                <LinkIcon className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Paste replacement size chart URL..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAttachUrl();
                    }
                  }}
                  className="w-full bg-[#121215] text-xs text-zinc-200 placeholder-zinc-500 pl-8 pr-3 py-2 rounded-lg border border-zinc-700 focus:border-gold-primary focus:outline-none"
                  autoFocus
                />
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleAttachUrl()}
                isLoading={isUploading}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Update URL
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingUrl(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* ======================================================== */
        /* STATE 2: NO SIZE CHART ATTACHED (TABBED INPUT)          */
        /* ======================================================== */
        <div className="p-4 rounded-xl border border-zinc-800 bg-[#121215] space-y-3">
          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-2 p-1 bg-[#18181c] rounded-lg border border-zinc-800 w-fit">
            <button
              type="button"
              onClick={() => {
                setActiveMode('url');
                setUploadError(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeMode === 'url'
                  ? 'bg-gold-primary text-black font-semibold shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Image URL</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveMode('upload');
                setUploadError(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeMode === 'upload'
                  ? 'bg-gold-primary text-black font-semibold shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File</span>
            </button>
          </div>

          {/* TAB 1: ADD VIA IMAGE URL */}
          {activeMode === 'url' && (
            <div className="space-y-2.5">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="https://i.ibb.co/.../size-chart.jpg"
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      setUploadError(null);
                    }}
                    onBlur={() => {
                      const clean = sanitizeImageUrl(urlInput);
                      if (clean && isValidHttpUrl(clean) && !sizeChart) {
                        handleAttachUrl(clean);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAttachUrl();
                      }
                    }}
                    className="w-full bg-[#1b1b22] text-xs text-zinc-200 placeholder-zinc-500 pl-8 pr-3 py-2 rounded-lg border border-zinc-700 focus:border-gold-primary focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handlePasteClipboard}
                    leftIcon={<ClipboardPaste className="w-3.5 h-3.5" />}
                    title="Paste URL from clipboard"
                  >
                    Paste
                  </Button>

                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => handleAttachUrl()}
                    isLoading={isUploading}
                    disabled={!urlInput.trim()}
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    Attach URL
                  </Button>
                </div>
              </div>

              {/* Informative Guidance */}
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Paste direct link from ImgBB (e.g. <code>https://i.ibb.co/...</code>), Cloudinary, or AWS S3. Quotes will be stripped automatically.
              </p>

              {/* Warning if ImgBB page URL is pasted instead of direct image URL */}
              {urlInput.includes('ibb.co/') && !urlInput.includes('i.ibb.co/') && (
                <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-[11px] text-amber-300 leading-relaxed">
                  ⚠️ <strong>ImgBB Webpage Link Detected:</strong> Direct image address use karein jaise <code>https://i.ibb.co/.../image.jpg</code>. ImgBB page par image par right-click karke <em>"Copy Image Address"</em> karein.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UPLOAD DIRECTLY FROM DEVICE */}
          {activeMode === 'upload' && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-6 rounded-xl border-2 border-dashed border-zinc-800 hover:border-gold-primary/50 bg-[#16161a] transition-all flex flex-col items-center justify-center text-center cursor-pointer group"
            >
              {isUploading ? (
                <div className="py-4 flex flex-col items-center gap-2">
                  <Loader2 className="w-7 h-7 text-gold-primary animate-spin" />
                  <p className="text-xs font-semibold text-zinc-200">
                    Uploading size chart image to Cloudinary...
                  </p>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700 group-hover:border-gold-primary flex items-center justify-center text-zinc-400 group-hover:text-gold-primary mb-2 transition-colors">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-zinc-200 group-hover:text-gold-light">
                    Click to select Size Chart image from device
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    PNG, JPG, WEBP, or SVG up to 10MB
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* LIGHTBOX MODAL: FULL PREVIEW OF SIZE CHART               */}
      {/* ======================================================== */}
      {isPreviewModalOpen && sizeChart?.url && (
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
