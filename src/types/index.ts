export interface ProductImage {
  id?: string;
  url: string;
  publicId?: string;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  options: string[];
  price?: number;
  stock?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  categoryId?: string;
  subcategory?: string;
  price: number;
  discount?: number;
  stock: number;
  SKU: string;
  images: ProductImage[];
  variants: ProductVariant[];
  status: 'active' | 'draft' | 'out_of_stock';
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  subcategories: string[];
  productCount?: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: string;
  sku?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItem[];
  totalAmount: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  ordersCount: number;
  totalSpent: number;
  status: 'active' | 'blocked';
  address?: string;
  createdAt: string;
  lastOrderAt?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  publicId?: string;
  linkUrl?: string;
  position: 'hero' | 'top_strip' | 'sidebar' | 'promotional';
  status: 'active' | 'inactive';
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
  startDate?: string;
  expiryDate: string;
  usageLimit?: number;
  usageCount: number;
  status: 'active' | 'expired' | 'disabled';
  createdAt: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'stock' | 'customer' | 'system';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  currency: string;
  currencySymbol: string;
  taxRate: number;
  shippingFee: number;
  freeShippingThreshold: number;
  address: string;
  maintenanceMode: boolean;
  supportEmail: string;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'super_admin' | 'admin' | 'editor';
  createdAt?: string;
}
