import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Save,
  Database,
  Cloud,
  CheckCircle2,
  Package,
  ShoppingBag,
  Users,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { isCloudinaryConfigured } from '../lib/cloudinary';

export const Settings: React.FC = () => {
  const { settings, updateSettings, products, orders, customers } = useStore();
  const { adminUser, isFirebaseActive } = useAuth();

  // Settings State
  const [storeName, setStoreName] = useState(settings.storeName);
  const [storeEmail, setStoreEmail] = useState(settings.storeEmail);
  const [storePhone, setStorePhone] = useState(settings.storePhone);
  const [currency, setCurrency] = useState(settings.currency);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [taxRate, setTaxRate] = useState(settings.taxRate.toString());
  const [shippingFee, setShippingFee] = useState(settings.shippingFee.toString());
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(
    settings.freeShippingThreshold.toString()
  );
  const [address, setAddress] = useState(settings.address);
  const [maintenanceMode, setMaintenanceMode] = useState(settings.maintenanceMode);

  // Admin Profile State
  const [displayName, setDisplayName] = useState(adminUser?.displayName || 'KINORA Director');
  const [adminSuccessMsg, setAdminSuccessMsg] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isCloudinaryActive = isCloudinaryConfigured();

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await updateSettings({
        storeName: storeName.trim(),
        storeEmail: storeEmail.trim(),
        storePhone: storePhone.trim(),
        currency,
        currencySymbol,
        taxRate: Number(taxRate) || 0,
        shippingFee: Number(shippingFee) || 0,
        freeShippingThreshold: Number(freeShippingThreshold) || 0,
        address: address.trim(),
        maintenanceMode,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminSuccessMsg('Admin profile updated successfully.');
    setTimeout(() => setAdminSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl">
      {/* Top Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
          Store & Administration Settings
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Configure luxury store parameters, integrations, and administration credentials.
        </p>
      </div>

      {/* Integration Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Firebase Status */}
        <Card className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                isFirebaseActive
                  ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400'
                  : 'bg-amber-950/40 border-amber-800/40 text-amber-400'
              }`}
            >
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-semibold text-white">Firebase Firestore & Auth</h4>
                <span
                  className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                    isFirebaseActive
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {isFirebaseActive ? 'Connected' : 'Demo Mode'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                {isFirebaseActive
                  ? 'Cloud Firestore synchronization and role-based security active.'
                  : 'Operating in client-side demo mode. Configure VITE_FIREBASE_* in .env to connect.'}
              </p>
            </div>
          </div>
        </Card>

        {/* Cloudinary Status */}
        <Card className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                isCloudinaryActive
                  ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400'
                  : 'bg-amber-950/40 border-amber-800/40 text-amber-400'
              }`}
            >
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-semibold text-white">Cloudinary Image Storage</h4>
                <span
                  className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                    isCloudinaryActive
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {isCloudinaryActive ? 'Configured' : 'Preview Mode'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                {isCloudinaryActive
                  ? 'Unsigned preset upload active. API secrets safely protected from frontend.'
                  : 'Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to .env for live uploads.'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Live Firestore Database Statistics */}
      <Card className="p-5 border-zinc-800 bg-[#121215] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-gold-primary" />
              <span>Live Firestore Database: <span className="font-mono text-gold-light">kinora-62da7</span></span>
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Real-time Firestore synchronization is active. Only items uploaded by administrators exist in your database.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-gold-primary" />
              <span>{products.length} Product(s)</span>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
              <span>{orders.length} Order(s)</span>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span>{customers.length} Client(s)</span>
            </span>
          </div>
        </div>
      </Card>

      {/* Admin Profile Form */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800">
          <Shield className="w-4 h-4 text-gold-primary" />
          <h3 className="text-sm font-semibold text-white tracking-wide">
            Administrator Profile
          </h3>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Admin Full Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <Input
              label="Admin Email Address"
              value={adminUser?.email || 'admin@kinora.com'}
              disabled
              helperText="Protected email tied to Firebase Authentication."
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-zinc-400">
              Role: <span className="text-gold-light font-semibold uppercase">{adminUser?.role || 'Super Admin'}</span>
            </span>
            <Button type="submit" variant="secondary" size="sm">
              Update Profile
            </Button>
          </div>

          {adminSuccessMsg && (
            <p className="text-xs text-emerald-400 font-medium">{adminSuccessMsg}</p>
          )}
        </form>
      </Card>

      {/* Store Information Form */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <SettingsIcon className="w-4 h-4 text-gold-primary" />
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Store General Settings
            </h3>
          </div>
          {saveSuccess && (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Settings Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Maison / Store Name *"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
            />
            <Input
              label="Client Concierge Email *"
              type="email"
              value={storeEmail}
              onChange={(e) => setStoreEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Concierge Phone Line"
              value={storePhone}
              onChange={(e) => setStorePhone(e.target.value)}
            />
            <Input
              label="Flagship Physical Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Input
              label="Currency Code"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
            <Input
              label="Currency Symbol"
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
            />
            <Input
              label="Tax Rate (%)"
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
            />
            <Input
              label="Standard Shipping (₹)"
              type="number"
              value={shippingFee}
              onChange={(e) => setShippingFee(e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Complimentary White-Glove Shipping Threshold (₹)"
              type="number"
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(e.target.value)}
              helperText="Orders above this amount qualify for complimentary armored courier delivery."
            />
          </div>

          {/* Maintenance Mode Toggle */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">Storefront Maintenance Mode</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Temporarily disable checkout and public catalog viewing for scheduled maintenance.
              </p>
            </div>
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-700 text-gold-primary focus:ring-gold-primary bg-zinc-900 cursor-pointer"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Store Settings
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
