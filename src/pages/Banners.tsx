import React, { useState } from 'react';
import { Image as ImageIcon, Plus, Edit2, Trash2, Calendar, ExternalLink } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Banner } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { BannerFormModal } from '../components/banners/BannerFormModal';

export const Banners: React.FC = () => {
  const { banners, deleteBanner, updateBanner } = useStore();

  const [bannerToEdit, setBannerToEdit] = useState<Banner | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleEdit = (banner: Banner) => {
    setBannerToEdit(banner);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setBannerToEdit(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteBanner(id);
    setDeleteConfirmId(null);
  };

  const handleToggleStatus = async (banner: Banner) => {
    await updateBanner(banner.id, {
      status: banner.status === 'active' ? 'inactive' : 'active',
    });
  };

  const getPositionLabel = (pos: Banner['position']) => {
    switch (pos) {
      case 'hero':
        return 'Main Hero Slider';
      case 'top_strip':
        return 'Top Announcement Strip';
      case 'promotional':
        return 'Promotional Highlight';
      case 'sidebar':
        return 'Sidebar Feature';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            Promotional Banners & Showcases
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Curate hero exhibitions, campaign banners, and announcements across the KINORA storefront.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleAddNew}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create New Banner
        </Button>
      </div>

      {/* Banners Grid */}
      {banners.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className="w-8 h-8" />}
          title="No Banners Configured"
          description="Create your first promotional banner to showcase on the storefront."
          actionLabel="Create Banner"
          onAction={handleAddNew}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((ban) => (
            <Card
              key={ban.id}
              className="p-0 overflow-hidden flex flex-col justify-between group hover:border-gold-primary/50 transition-all shadow-card-dark"
            >
              {/* Image Preview */}
              <div className="relative h-48 bg-black overflow-hidden">
                <img
                  src={ban.imageUrl}
                  alt={ban.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-transparent to-black/30" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm border border-zinc-700/60 text-[10px] font-semibold text-zinc-200">
                    {getPositionLabel(ban.position)}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <Badge variant={ban.status === 'active' ? 'success' : 'neutral'}>
                    {ban.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {/* Bottom Headline on Image */}
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-sm font-bold text-white group-hover:text-gold-light transition-colors line-clamp-1">
                    {ban.title}
                  </h3>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                {ban.subtitle && (
                  <p className="text-xs text-zinc-400 line-clamp-2">{ban.subtitle}</p>
                )}

                {/* Destination & Dates */}
                <div className="space-y-1 text-xs text-zinc-500 pt-1">
                  {ban.linkUrl && (
                    <p className="flex items-center gap-1.5 text-zinc-400 truncate">
                      <ExternalLink className="w-3.5 h-3.5 text-gold-primary shrink-0" />
                      <span className="truncate">{ban.linkUrl}</span>
                    </p>
                  )}
                  {(ban.startDate || ban.endDate) && (
                    <p className="flex items-center gap-1.5 text-zinc-400">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span>
                        {ban.startDate ? new Date(ban.startDate).toLocaleDateString() : 'Now'} &rarr;{' '}
                        {ban.endDate ? new Date(ban.endDate).toLocaleDateString() : 'Ongoing'}
                      </span>
                    </p>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(ban)}
                    className="text-xs text-zinc-400 hover:text-white"
                  >
                    {ban.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleEdit(ban)}
                      className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-gold-primary transition-colors"
                      title="Edit Banner"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(ban.id)}
                      className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-red-400 hover:border-red-600 transition-colors"
                      title="Delete Banner"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Banner Form Modal */}
      <BannerFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setBannerToEdit(null);
        }}
        bannerToEdit={bannerToEdit}
      />

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#121215] border border-red-900/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-white">Delete Promotional Banner</h3>
            <p className="text-xs text-zinc-400">
              Are you sure you want to remove this banner from your storefront?
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
