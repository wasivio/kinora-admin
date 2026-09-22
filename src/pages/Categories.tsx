import React, { useState } from 'react';
import { FolderTree, Plus, Edit2, Trash2, Layers, Search, LayoutGrid, List } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Category } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { EmptyState } from '../components/common/EmptyState';
import { CategoryFormModal } from '../components/categories/CategoryFormModal';

export const Categories: React.FC = () => {
  const { categories, products, deleteCategory } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.subcategories.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (cat: Category) => {
    setCategoryToEdit(cat);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setCategoryToEdit(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteCategory(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            Categories & Subcategories
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Structure your luxury collections and fine department hierarchies.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleAddNew}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Category
        </Button>
      </div>

      {/* Search & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#121215] border border-zinc-800/80 p-2.5 rounded-xl">
        <div className="w-full sm:max-w-sm">
          <Input
            placeholder="Search categories or subcategories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-3.5 h-3.5" />}
            className="text-xs py-1.5"
          />
        </div>
        <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-lg border border-zinc-800 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`px-2.5 py-1 rounded-md text-xs flex items-center gap-1.5 transition-colors ${
              viewMode === 'grid'
                ? 'bg-gold-primary text-black font-semibold shadow-gold-glow'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Compact Grid"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="text-[11px]">Grid</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-2.5 py-1 rounded-md text-xs flex items-center gap-1.5 transition-colors ${
              viewMode === 'list'
                ? 'bg-gold-primary text-black font-semibold shadow-gold-glow'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Compact Table List"
          >
            <List className="w-3.5 h-3.5" />
            <span className="text-[11px]">List</span>
          </button>
        </div>
      </div>

      {/* Category Grid or List */}
      {filteredCategories.length === 0 ? (
        <EmptyState
          icon={<FolderTree className="w-8 h-8" />}
          title="No Categories Found"
          description="Create your first luxury department or refine your search."
          actionLabel="Add Category"
          onAction={handleAddNew}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-3.5">
          {filteredCategories.map((cat) => {
            const catProductCount = products.filter((p) => p.category === cat.name).length;
            return (
              <Card
                key={cat.id}
                className="p-0 overflow-hidden flex flex-col justify-between group hover:border-gold-primary/50 transition-all shadow-card-dark rounded-xl"
              >
                {/* Compact Header Image */}
                <div className="relative h-24 sm:h-28 bg-zinc-950 overflow-hidden">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700 bg-[#141418]">
                      <FolderTree className="w-6 h-6 text-zinc-600" />
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-black/20 to-black/40" />

                  {/* Top Status */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider ${
                        cat.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800/80 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      {cat.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Category Title on Image */}
                  <div className="absolute bottom-1.5 left-2.5 right-2.5">
                    <h3 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-gold-light transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[9px] text-zinc-400 font-mono truncate">/{cat.slug}</p>
                  </div>
                </div>

                {/* Compact Details Body */}
                <div className="p-2.5 flex-1 flex flex-col justify-between gap-2 bg-[#121215]">
                  {cat.description && (
                    <p className="text-[10px] text-zinc-400 line-clamp-1" title={cat.description}>
                      {cat.description}
                    </p>
                  )}

                  {/* Subcategories (Compact badges) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[9px] text-zinc-500 uppercase font-semibold tracking-wider">
                      <span className="flex items-center gap-1">
                        <Layers className="w-2.5 h-2.5 text-gold-primary" />
                        Sub ({cat.subcategories.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {cat.subcategories.length > 0 ? (
                        <>
                          {cat.subcategories.slice(0, 2).map((sub) => (
                            <span
                              key={sub}
                              className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 truncate max-w-[90px]"
                            >
                              {sub}
                            </span>
                          ))}
                          {cat.subcategories.length > 2 && (
                            <span className="px-1.5 py-0.5 rounded bg-zinc-800/60 text-[9px] text-zinc-400">
                              +{cat.subcategories.length - 2}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-[10px] text-zinc-600 italic">None</span>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions & Counts */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/70 mt-1">
                    <span className="text-[10px] font-semibold text-gold-light">
                      {catProductCount} {catProductCount === 1 ? 'item' : 'items'}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(cat)}
                        className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-gold-primary transition-colors"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(cat.id)}
                        className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-600 transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Compact List / Table View */
        <Card className="p-0 overflow-hidden rounded-xl border border-zinc-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/60 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3 sm:px-4">Category</th>
                  <th className="py-2.5 px-3">Slug</th>
                  <th className="py-2.5 px-3">Subcategories</th>
                  <th className="py-2.5 px-3">Products</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 sm:px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredCategories.map((cat) => {
                  const catProductCount = products.filter((p) => p.category === cat.name).length;
                  return (
                    <tr key={cat.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-2 px-3 sm:px-4 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center">
                          {cat.image ? (
                            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                          ) : (
                            <FolderTree className="w-4 h-4 text-zinc-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-xs">{cat.name}</p>
                          {cat.description && (
                            <p className="text-[10px] text-zinc-500 line-clamp-1">{cat.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3 font-mono text-[10px] text-zinc-400">/{cat.slug}</td>
                      <td className="py-2 px-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {cat.subcategories.slice(0, 3).map((sub) => (
                            <span key={sub} className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300">
                              {sub}
                            </span>
                          ))}
                          {cat.subcategories.length > 3 && (
                            <span className="text-[10px] text-zinc-500">+{cat.subcategories.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3 font-semibold text-gold-light text-xs">{catProductCount}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase ${
                            cat.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-zinc-800/80 text-zinc-400 border border-zinc-700'
                          }`}
                        >
                          {cat.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-2 px-3 sm:px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEdit(cat)}
                            className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-gold-primary transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(cat.id)}
                            className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Category Modal */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCategoryToEdit(null);
        }}
        categoryToEdit={categoryToEdit}
      />

      {/* Delete Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#121215] border border-red-900/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-white">Delete Category</h3>
            <p className="text-xs text-zinc-400">
              Are you sure you want to remove this category? Products assigned to it will remain in your vault.
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
