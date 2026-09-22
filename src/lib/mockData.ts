import { Product, Category, Order, Customer, Banner, Coupon, AdminNotification, StoreSettings } from '../types';

export const initialCategories: Category[] = [];
export const initialProducts: Product[] = [];
export const initialOrders: Order[] = [];
export const initialCustomers: Customer[] = [];
export const initialBanners: Banner[] = [];
export const initialCoupons: Coupon[] = [];
export const initialNotifications: AdminNotification[] = [];

export const initialSettings: StoreSettings = {
  storeName: 'KINORA Luxury Maison',
  storeEmail: 'admin@kinora.com',
  storePhone: '+1 (800) 546-6721',
  currency: 'INR',
  currencySymbol: '₹',
  taxRate: 8.0,
  shippingFee: 0,
  freeShippingThreshold: 5000,
  address: 'KINORA Flagship Store',
  maintenanceMode: false,
  supportEmail: 'admin@kinora.com',
};
