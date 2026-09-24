import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Star,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { ProductFormModal } from '../components/products/ProductFormModal';

export const Products: React.FC = () => {
  const { products, categories, deleteProduct, updateProduct } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const search = (searchTerm || '').toLowerCase();
    const matchesSearch =
      (p.name?.toLowerCase() || '').includes(search) ||
      (p.SKU?.toLowerCase() || '').includes(search) ||
      (p.category?.toLowerCase() || '').includes(search);

    const matchesCategory =
      selectedCategory === 'all' || p.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'all' || p.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleEdit = (prod: Product) => {
    setProductToEdit(prod);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
    setDeleteConfirmId(null);
  };

  const handleToggleFeatured = async (prod: Product) => {
    await updateProduct(prod.id, { featured: !prod.featured });
  };

  const getStatusBadge = (status: Product['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'draft':
        return <Badge variant="neutral">Draft</Badge>;
      case 'out_of_stock':
        return <Badge variant="danger">Out of Stock</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            Product Vault & Inventory
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Manage your high jewelry, timepieces, leather goods, and haute couture catalog.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleAddNew}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add New Product
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search by title, SKU, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              className="text-xs"
            />
          </div>

          {/* Filters & View Modes */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter */}
            <select
              className="bg-[#16161a] text-xs text-zinc-200 rounded-lg border border-zinc-700 px-3 py-2 focus:border-gold-primary"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              className="bg-[#16161a] text-xs text-zinc-200 rounded-lg border border-zinc-700 px-3 py-2 focus:border-gold-primary"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center rounded-lg bg-zinc-900 border border-zinc-800 p-1">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md ${
                  viewMode === 'table' ? 'bg-gold-primary text-black' : 'text-zinc-400 hover:text-white'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md ${
                  viewMode === 'grid' ? 'bg-gold-primary text-black' : 'text-zinc-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Content: Empty or Products */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={<Package className="w-8 h-8" />}
          title="No Products Found"
          description={
            searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
              ? 'No products matched your specific search or filter criteria.'
              : 'Your vault catalog is currently empty. Add your first luxury product.'
          }
          actionLabel="Add New Product"
          onAction={handleAddNew}
        />
      ) : viewMode === 'table' ? (
        /* Luxury Table View */
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#16161a] text-[10px] text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="p-4 font-semibold">Product</th>
                  <th className="p-4 font-semibold">SKU</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Price</th>
                  <th className="p-4 font-semibold">Stock</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-center">Featured</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredProducts.map((prod) => {
                  const primaryImg = prod.images.find((img) => img.isPrimary) || prod.images[0];
                  return (
                    <tr
                      key={prod.id}
                      className="hover:bg-zinc-800/30 transition-colors group"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-black border border-zinc-800 overflow-hidden shrink-0 group-hover:border-gold-primary/50 transition-colors">
                            {primaryImg?.url ? (
                              <img
                                src={primaryImg.url}
                                alt={prod.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <p className="font-semibold text-white truncate text-xs">{prod.name}</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5 truncate">
                              {prod.variants?.length || 0} variant(s) • {prod.images?.length || 0} image(s)
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-zinc-300">{prod.SKU}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300">
                          {prod.category}
                        </span>
                      </td>
                      <td className="p-4">
                        {prod.discount ? (
                          <div>
                            <span className="font-bold text-gold-light">
                              ₹{prod.discount.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-zinc-500 line-through ml-1.5">
                              ₹{prod.price.toLocaleString('en-IN')}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-white">
                            ₹{prod.price.toLocaleString('en-IN')}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`font-semibold ${
                            prod.stock === 0
                              ? 'text-red-400'
                              : prod.stock <= 3
                              ? 'text-amber-400'
                              : 'text-zinc-300'
                          }`}
                        >
                          {prod.stock} units
                        </span>
                      </td>
                      <td className="p-4">{getStatusBadge(prod.status)}</td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(prod)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            prod.featured
                              ? 'text-gold-primary bg-gold-primary/10'
                              : 'text-zinc-600 hover:text-zinc-400'
                          }`}
                          title={prod.featured ? 'Featured on Homepage' : 'Click to Feature'}
                        >
                          <Star className={`w-4 h-4 ${prod.featured ? 'fill-gold-primary' : ''}`} />
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEdit(prod)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(prod.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
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
      ) : (
        /* Luxury Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((prod) => {
            const primaryImg = prod.images.find((img) => img.isPrimary) || prod.images[0];
            return (
              <Card
                key={prod.id}
                className="p-0 overflow-hidden flex flex-col group hover:border-gold-primary/50 transition-all shadow-card-dark"
              >
                {/* Image Box */}
                <div className="relative aspect-square bg-zinc-950 overflow-hidden">
                  {primaryImg?.url ? (
                    <img
                      src={primaryImg.url}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700">
                      <Package className="w-12 h-12" />
                    </div>
                  )}

                  {/* Featured Star Badge */}
                  {prod.featured && (
                    <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-gold-primary to-amber-600 text-black text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                      <Star className="w-2.5 h-2.5 fill-black" />
                      <span>Featured</span>
                    </div>
                  )}

                  {/* Status Overlay */}
                  <div className="absolute top-2.5 right-2.5">
                    {getStatusBadge(prod.status)}
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                      <span>{prod.category}</span>
                      <span className="font-mono">{prod.SKU}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-gold-light transition-colors">
                      {prod.name}
                    </h4>
                  </div>

                  <div className="flex items-end justify-between pt-2 border-t border-zinc-800">
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-zinc-500">Price</p>
                      {prod.discount ? (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-bold text-gold-light">
                            ₹{prod.discount.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-zinc-500 line-through">
                            ₹{prod.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-base font-bold text-white">
                          ₹{prod.price.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(prod)}
                        className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-gold-primary transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(prod.id)}
                        className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-red-400 hover:border-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#121215] border border-red-900/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-800 text-red-400 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Remove Product from Vault</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Are you sure you want to permanently delete this product? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(deleteConfirmId)}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
