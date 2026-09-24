import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { 
  Product, 
  Category, 
  Order, 
  Customer, 
  Banner, 
  Coupon, 
  AdminNotification, 
  StoreSettings 
} from '../types';
import { initialSettings } from '../lib/mockData';
import { toast } from 'sonner';

// Luxury two-tone audio chime for new incoming orders
export const playOrderChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;
    
    // First tone (E5 - 659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.35, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.6);

    // Second tone (A5 - 880 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.15);
    gain2.gain.setValueAtTime(0.4, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.9);
  } catch (err) {
    console.debug('Audio chime skipped:', err);
  }
};

interface StoreContextType {
  products: Product[];
  categories: Category[];
  orders: Order[];
  customers: Customer[];
  banners: Banner[];
  coupons: Coupon[];
  notifications: AdminNotification[];
  settings: StoreSettings;
  isLoading: boolean;
  isSyncing: boolean;
  
  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  // Category actions
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Order actions
  updateOrderStatus: (orderId: string, status: Order['orderStatus'], trackingNumber?: string) => Promise<void>;
  updatePaymentStatus: (orderId: string, status: Order['paymentStatus']) => Promise<void>;

  // Customer actions
  updateCustomerStatus: (customerId: string, status: Customer['status']) => Promise<void>;

  // Banner actions
  addBanner: (banner: Omit<Banner, 'id' | 'createdAt'>) => Promise<void>;
  updateBanner: (id: string, updates: Partial<Banner>) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;

  // Coupon actions
  addCoupon: (coupon: Omit<Coupon, 'id' | 'createdAt'>) => Promise<void>;
  updateCoupon: (id: string, updates: Partial<Coupon>) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;

  // Notification actions
  addNotification: (notification: Omit<AdminNotification, 'id' | 'createdAt'>) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;

  // Settings actions
  updateSettings: (updates: Partial<StoreSettings>) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'kinora_products',
  CATEGORIES: 'kinora_categories',
  ORDERS: 'kinora_orders',
  CUSTOMERS: 'kinora_customers',
  BANNERS: 'kinora_banners',
  COUPONS: 'kinora_coupons',
  NOTIFICATIONS: 'kinora_notifications',
  SETTINGS: 'kinora_settings',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isFb = isFirebaseConfigured() && db !== null;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // States - initialized from localStorage and synced with Firestore
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      const parsed = saved ? JSON.parse(saved) : [];
      if (Array.isArray(parsed)) {
        return parsed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      return [];
    } catch {
      return [];
    }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((c) => ({
          id: c?.id || `cust-${Date.now()}`,
          name: c?.name || c?.displayName || 'Patron',
          email: c?.email || '',
          phone: c?.phone || '',
          avatar: c?.avatar || undefined,
          ordersCount: typeof c?.ordersCount === 'number' ? c.ordersCount : 0,
          totalSpent: typeof c?.totalSpent === 'number' ? c.totalSpent : 0,
          status: c?.status === 'blocked' ? 'blocked' : 'active',
          address: c?.address || '',
          createdAt: c?.createdAt || new Date().toISOString(),
          lastOrderAt: c?.lastOrderAt || undefined,
        }));
      }
      return [];
    } catch {
      return [];
    }
  });

  const [banners, setBanners] = useState<Banner[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BANNERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COUPONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [notifications, setNotifications] = useState<AdminNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : initialSettings;
    } catch {
      return initialSettings;
    }
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
  }, [banners]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Real-time Firestore Listeners
  useEffect(() => {
    if (!isFb || !db) {
      setIsLoading(false);
      return;
    }

    setIsSyncing(true);

    const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
      const loaded: Product[] = [];
      snap.forEach((d) => loaded.push({ id: d.id, ...d.data() } as Product));
      if (loaded.length > 0) {
        setProducts(loaded);
      }
      setIsLoading(false);
      setIsSyncing(false);
    }, (err) => {
      console.warn('Firestore products listener error:', err);
      setIsLoading(false);
      setIsSyncing(false);
    });

    const unsubCategories = onSnapshot(collection(db, 'categories'), (snap) => {
      const loaded: Category[] = [];
      snap.forEach((d) => loaded.push({ id: d.id, ...d.data() } as Category));
      if (loaded.length > 0) {
        setCategories(loaded);
      }
    }, (err) => console.warn('Firestore categories listener error:', err));

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    let isInitialOrdersLoad = true;
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
      const loaded: Order[] = [];
      snap.forEach((d) => loaded.push({ id: d.id, ...d.data() } as Order));
      
      // Sort newest orders first
      loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      if (loaded.length > 0) {
        setOrders(loaded);
      }

      // Check for newly added orders arriving in real-time
      if (!isInitialOrdersLoad) {
        snap.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const newOrd = { id: change.doc.id, ...change.doc.data() } as Order;
            // Play luxury audio chime
            playOrderChime();

            // Trigger visual toast
            toast.success(`🎉 New Order: #${newOrd.orderNumber || change.doc.id}`, {
              description: `${newOrd.customerName || 'Client'} placed an order of ₹${(Number(newOrd.totalAmount) || 0).toLocaleString('en-IN')}`,
              duration: 9000,
            });

            // Browser desktop notification
            if ('Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification(`New Order #${newOrd.orderNumber || change.doc.id}`, {
                  body: `${newOrd.customerName || 'Client'} - ₹${(Number(newOrd.totalAmount) || 0).toLocaleString('en-IN')}`,
                  icon: '/kinora-logo.png',
                });
              } catch {}
            }

            // Persist notification in state & Firestore
            addNotification({
              title: `New Order: #${newOrd.orderNumber || change.doc.id}`,
              message: `${newOrd.customerName || 'Patron'} placed an order of ₹${(Number(newOrd.totalAmount) || 0).toLocaleString('en-IN')}`,
              type: 'order',
              read: false,
              link: '/admin/orders',
            }).catch(() => {});
          }
        });
      }
      isInitialOrdersLoad = false;
    }, (err) => console.warn('Firestore orders listener error:', err));

    const unsubCustomers = onSnapshot(collection(db, 'users'), (snap) => {
      const loaded: Customer[] = [];
      snap.forEach((d) => {
        const data = d.data();
        loaded.push({
          id: d.id,
          name: data.name || data.displayName || data.fullName || 'Patron',
          email: data.email || '',
          phone: data.phone || data.phoneNumber || '',
          avatar: data.avatar || data.photoURL || undefined,
          ordersCount: typeof data.ordersCount === 'number' ? data.ordersCount : 0,
          totalSpent: typeof data.totalSpent === 'number' ? data.totalSpent : 0,
          status: data.status === 'blocked' ? 'blocked' : 'active',
          address: data.address || '',
          createdAt: data.createdAt || new Date().toISOString(),
          lastOrderAt: data.lastOrderAt || undefined,
        });
      });
      if (loaded.length > 0) {
        setCustomers(loaded);
      }
    }, (err) => console.warn('Firestore users listener error:', err));

    const unsubBanners = onSnapshot(collection(db, 'banners'), (snap) => {
      const loaded: Banner[] = [];
      snap.forEach((d) => loaded.push({ id: d.id, ...d.data() } as Banner));
      if (loaded.length > 0) {
        setBanners(loaded);
      }
    }, (err) => console.warn('Firestore banners listener error:', err));

    const unsubCoupons = onSnapshot(collection(db, 'coupons'), (snap) => {
      const loaded: Coupon[] = [];
      snap.forEach((d) => loaded.push({ id: d.id, ...d.data() } as Coupon));
      if (loaded.length > 0) {
        setCoupons(loaded);
      }
    }, (err) => console.warn('Firestore coupons listener error:', err));

    const unsubNotifs = onSnapshot(collection(db, 'notifications'), (snap) => {
      const loaded: AdminNotification[] = [];
      snap.forEach((d) => loaded.push({ id: d.id, ...d.data() } as AdminNotification));
      if (loaded.length > 0) {
        setNotifications(loaded);
      }
    }, (err) => console.warn('Firestore notifications listener error:', err));

    const unsubSettings = onSnapshot(doc(db, 'settings', 'general'), (snap) => {
      if (snap.exists()) {
        setSettings((prev) => ({ ...prev, ...(snap.data() as StoreSettings) }));
      }
    }, (err) => console.warn('Firestore settings listener error:', err));

    return () => {
      unsubProducts();
      unsubCategories();
      unsubOrders();
      unsubCustomers();
      unsubBanners();
      unsubCoupons();
      unsubNotifs();
      unsubSettings();
    };
  }, [isFb]);

  // Helper to remove undefined fields for Firestore
  const cleanData = <T extends Record<string, any>>(data: T): Partial<T> => {
    const result: Record<string, any> = {};
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined) {
        result[key] = data[key];
      }
    });
    return result as Partial<T>;
  };

  // Products
  const addProduct = async (prodData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    // Update state and localStorage immediately
    setProducts((prev) => {
      const updated = [newProduct, ...prev];
      try { localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated)); } catch {}
      return updated;
    });

    if (isFb && db) {
      try {
        const docRef = await addDoc(collection(db, 'products'), cleanData({
          ...prodData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }));
        newProduct.id = docRef.id;
        setProducts((prev) => {
          const updated = prev.map((p) => (p.id === newProduct.id ? { ...p, id: docRef.id } : p));
          try { localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated)); } catch {}
          return updated;
        });
      } catch (err) {
        console.warn('Firestore addProduct warning:', err);
      }
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const now = new Date().toISOString();
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: now } : p));
      try { localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated)); } catch {}
      return updated;
    });

    if (isFb && db) {
      try {
        await updateDoc(doc(db, 'products', id), cleanData({
          ...updates,
          updatedAt: serverTimestamp(),
        }));
      } catch (err) {
        console.warn('Firestore updateProduct warning:', err);
      }
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try { localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated)); } catch {}
      return updated;
    });

    if (isFb && db) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (err) {
        console.warn('Firestore deleteProduct warning:', err);
      }
    }
  };

  // Categories
  const addCategory = async (catData: Omit<Category, 'id' | 'createdAt'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    // Update state and localStorage immediately
    setCategories((prev) => {
      const updated = [...prev, newCat];
      try { localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated)); } catch {}
      return updated;
    });

    if (isFb && db) {
      try {
        const docRef = await addDoc(collection(db, 'categories'), cleanData({
          ...catData,
          createdAt: serverTimestamp(),
        }));
        newCat.id = docRef.id;
        setCategories((prev) => {
          const updated = prev.map((c) => (c.id === newCat.id ? { ...c, id: docRef.id } : c));
          try { localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated)); } catch {}
          return updated;
        });
      } catch (err) {
        console.warn('Firestore addCategory warning:', err);
      }
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    setCategories((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      try { localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated)); } catch {}
      return updated;
    });

    if (isFb && db) {
      try {
        await updateDoc(doc(db, 'categories', id), cleanData(updates));
      } catch (err) {
        console.warn('Firestore updateCategory warning:', err);
      }
    }
  };

  const deleteCategory = async (id: string) => {
    setCategories((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      try { localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated)); } catch {}
      return updated;
    });

    if (isFb && db) {
      try {
        await deleteDoc(doc(db, 'categories', id));
      } catch (err) {
        console.warn('Firestore deleteCategory warning:', err);
      }
    }
  };

  // Orders
  const updateOrderStatus = async (
    orderId: string, 
    status: Order['orderStatus'], 
    trackingNumber?: string
  ) => {
    const now = new Date().toISOString();
    const updates: Partial<Order> = { orderStatus: status, updatedAt: now };
    if (trackingNumber) updates.trackingNumber = trackingNumber;

    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o));
      try { localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated)); } catch {}
      return updated;
    });

    if (isFb && db) {
      try {
        await updateDoc(doc(db, 'orders', orderId), updates);
      } catch (err) {
        console.warn('Firestore updateOrderStatus warning:', err);
      }
    }
  };

  const updatePaymentStatus = async (orderId: string, status: Order['paymentStatus']) => {
    const now = new Date().toISOString();
    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: status, updatedAt: now } : o));
      try { localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated)); } catch {}
      return updated;
    });

    if (isFb && db) {
      try {
        await updateDoc(doc(db, 'orders', orderId), {
          paymentStatus: status,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Firestore updatePaymentStatus warning:', err);
      }
    }
  };

  // Customers
  const updateCustomerStatus = async (customerId: string, status: Customer['status']) => {
    setCustomers((prev) => {
      const updated = prev.map((c) => (c.id === customerId ? { ...c, status } : c));
      try { localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updated)); } catch {}
      return updated;
    });

    if (isFb && db) {
      try {
        await updateDoc(doc(db, 'users', customerId), { status });
      } catch (err) {
        console.warn('Firestore updateCustomerStatus warning:', err);
      }
    }
  };

  // Banners
  const addBanner = async (bannerData: Omit<Banner, 'id' | 'createdAt'>) => {
    const newBanner: Banner = {
      ...bannerData,
      id: `ban-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setBanners((prev) => {
      const updated = [newBanner, ...prev];
      try { localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(updated)); } catch {}
      return updated;
    });

    if (isFb && db) {
      try {
        const docRef = await addDoc(collection(db, 'banners'), cleanData({
          ...bannerData,
          createdAt: serverTimestamp(),
        }));
        newBanner.id = docRef.id;
        setBanners((prev) => {
          const updated = prev.map((b) => (b.id === newBanner.id ? { ...b, id: docRef.id } : b));
          try { localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(updated)); } catch {}
          return updated;
        });
      } catch (err) {
        console.warn('Firestore addBanner warning:', err);
      }
    }
  };

  const updateBanner = async (id: string, updates: Partial<Banner>) => {
    setBanners((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, ...updates } : b));
      try { localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(updated)); } catch {}
      return updated;
    });

    if (isFb && db) {
      try {
        await updateDoc(doc(db, 'banners', id), cleanData(updates));
      } catch (err) {
        console.warn('Firestore updateBanner warning:', err);
      }
    }
  };

  const deleteBanner = async (id: string) => {
    setBanners((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      try { localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(updated)); } catch {}
      return updated;
    });

    if (isFb && db) {
      try {
        await deleteDoc(doc(db, 'banners', id));
      } catch (err) {
        console.warn('Firestore deleteBanner warning:', err);
      }
    }
  };

  // Coupons
  const addCoupon = async (couponData: Omit<Coupon, 'id' | 'createdAt'>) => {
    const newCoupon: Coupon = {
      ...couponData,
      id: `coup-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setCoupons((prev) => {
      const updated = [newCoupon, ...prev];
      try { localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(updated)); } catch {}
      return updated;
    });

    if (isFb && db) {
      try {
        const docRef = await addDoc(collection(db, 'coupons'), cleanData({
          ...couponData,
          createdAt: serverTimestamp(),
        }));
        newCoupon.id = docRef.id;
        setCoupons((prev) => {
          const updated = prev.map((c) => (c.id === newCoupon.id ? { ...c, id: docRef.id } : c));
          try { localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(updated)); } catch {}
          return updated;
        });
      } catch (err) {
        console.warn('Firestore addCoupon warning:', err);
      }
    }
  };

  const updateCoupon = async (id: string, updates: Partial<Coupon>) => {
    setCoupons((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      try { localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(updated)); } catch {}
      return updated;
    });

    if (isFb && db) {
      try {
        await updateDoc(doc(db, 'coupons', id), cleanData(updates));
      } catch (err) {
        console.warn('Firestore updateCoupon warning:', err);
      }
    }
  };

  const deleteCoupon = async (id: string) => {
    setCoupons((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      try { localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(updated)); } catch {}
      return updated;
    });

    if (isFb && db) {
      try {
        await deleteDoc(doc(db, 'coupons', id));
      } catch (err) {
        console.warn('Firestore deleteCoupon warning:', err);
      }
    }
  };

  // Notifications
  const addNotification = async (notifData: Omit<AdminNotification, 'id' | 'createdAt'>) => {
    const now = new Date().toISOString();
    const newNotif: AdminNotification = {
      ...notifData,
      id: `notif-${Date.now()}`,
      createdAt: now,
    };

    setNotifications((prev) => {
      const updated = [newNotif, ...prev];
      try { localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated)); } catch {}
      return updated;
    });

    if (isFb && db) {
      try {
        const docRef = await addDoc(collection(db, 'notifications'), cleanData({
          ...notifData,
          createdAt: serverTimestamp(),
        }));
        newNotif.id = docRef.id;
        setNotifications((prev) => {
          const updated = prev.map((n) => (n.id === newNotif.id ? { ...n, id: docRef.id } : n));
          try { localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated)); } catch {}
          return updated;
        });
      } catch (err) {
        console.warn('Firestore addNotification warning:', err);
      }
    }
  };

  const markNotificationAsRead = async (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      try { localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated)); } catch {}
      return updated;
    });

    if (isFb && db) {
      try {
        await updateDoc(doc(db, 'notifications', id), { read: true });
      } catch (err) {
        console.warn('Firestore markNotificationAsRead warning:', err);
      }
    }
  };

  const markAllNotificationsAsRead = async () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      try { localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const deleteNotification = async (id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      try { localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated)); } catch {}
      return updated;
    });

    if (isFb && db) {
      try {
        await deleteDoc(doc(db, 'notifications', id));
      } catch (err) {
        console.warn('Firestore deleteNotification warning:', err);
      }
    }
  };

  // Settings
  const updateSettings = async (updates: Partial<StoreSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...updates };
      try { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated)); } catch {}
      return updated;
    });

    if (isFb && db) {
      try {
        await setDoc(doc(db, 'settings', 'general'), cleanData(updates), { merge: true });
      } catch (err) {
        console.warn('Firestore updateSettings warning:', err);
      }
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        orders,
        customers,
        banners,
        coupons,
        notifications,
        settings,
        isLoading,
        isSyncing,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        updateOrderStatus,
        updatePaymentStatus,
        updateCustomerStatus,
        addBanner,
        updateBanner,
        deleteBanner,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        updateSettings,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
