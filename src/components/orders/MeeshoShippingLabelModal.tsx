import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Copy, 
  Check, 
  Scissors, 
  ShieldCheck,
  AlertCircle,
  Edit3,
  Eye,
  RotateCcw,
  Plus,
  Trash2,
  Truck,
  User,
  Store,
  FileText
} from 'lucide-react';
import { Order } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { BarcodeSVG } from './BarcodeSVG';
import { numberToWordsIndian } from '../../lib/numberToWords';
import { toast } from 'sonner';

interface InvoiceItem {
  name: string;
  sku: string;
  variant: string;
  quantity: number;
  price: number;
}

interface MeeshoShippingLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const MeeshoShippingLabelModal: React.FC<MeeshoShippingLabelModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const { settings, updateOrderStatus } = useStore();

  // Tab mode: 'preview' | 'edit'
  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');

  // Logistics / Courier state
  const [courierName, setCourierName] = useState<string>('DELHIVERY SURFACE');
  const [logisticsTag, setLogisticsTag] = useState<string>('Express Delivery Network');
  const [awbNumber, setAwbNumber] = useState<string>('');
  const [routingCode, setRoutingCode] = useState<string>('DEL/BOM/RT-04');
  const [isCopied, setIsCopied] = useState(false);

  // Deliver To (Customer) state
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerStreet, setCustomerStreet] = useState<string>('');
  const [customerCity, setCustomerCity] = useState<string>('');
  const [customerState, setCustomerState] = useState<string>('');
  const [customerZip, setCustomerZip] = useState<string>('');

  // Sold By (Seller / Return) state
  const [sellerName, setSellerName] = useState<string>('');
  const [sellerAddress, setSellerAddress] = useState<string>('');
  const [sellerGstin, setSellerGstin] = useState<string>('27AABCK1234F1Z5');
  const [returnPin, setReturnPin] = useState<string>('400002');

  // Invoice & Financials state
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [invoiceDate, setInvoiceDate] = useState<string>('');
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'COD' | 'PREPAID'>('COD');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [codCharge, setCodCharge] = useState<number>(0);
  const [shippingAmount, setShippingAmount] = useState<number>(0);

  // Items in invoice
  const [items, setItems] = useState<InvoiceItem[]>([]);

  // Function to initialize or reset fields from the current order
  const initFromOrder = () => {
    if (!order) return;

    const isCodOrder = order.paymentMethod?.toUpperCase().includes('COD') ?? false;
    setPaymentMode(isCodOrder ? 'COD' : 'PREPAID');
    setTotalAmount(order.totalAmount);
    setCodCharge(order.codCharge || 0);
    setShippingAmount(order.shippingAmount || 0);

    setCourierName('DELHIVERY SURFACE');
    setLogisticsTag('Express Delivery Network');

    const generatedAwb =
      order.trackingNumber ||
      `DEL${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    setAwbNumber(generatedAwb);

    const zip = order.shippingAddress.zip || '400001';
    const statePrefix = (order.shippingAddress.state || 'MH').slice(0, 3).toUpperCase();
    setRoutingCode(`${statePrefix}/${zip.slice(0, 3)}/RT-${Math.floor(10 + Math.random() * 89)}`);

    setSellerName(settings.storeName || 'KINORA LUXURY');
    setSellerAddress(settings.address || 'Zaveri Bazaar, Kalbadevi, Mumbai - 400002');
    setSellerGstin('27AABCK1234F1Z5');
    setReturnPin('400002');

    setCustomerName(order.customerName || '');
    setCustomerPhone(order.customerPhone || '');
    setCustomerStreet(order.shippingAddress.street || '');
    setCustomerCity(order.shippingAddress.city || '');
    setCustomerState(order.shippingAddress.state || '');
    setCustomerZip(order.shippingAddress.zip || '');

    setInvoiceNumber(`INV-${order.orderNumber.replace(/[^0-9]/g, '') || order.id.slice(0, 8).toUpperCase()}`);
    setInvoiceDate(
      order.createdAt
        ? new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : new Date().toLocaleDateString('en-IN')
    );
    setOrderNumber(order.orderNumber || '');

    setItems(
      order.items.map((item) => ({
        name: item.name,
        sku: item.sku || 'SKU',
        variant: item.variant || 'Standard',
        quantity: item.quantity,
        price: item.price,
      }))
    );
  };

  // Sync state whenever order opens
  useEffect(() => {
    if (order) {
      initFromOrder();
    }
  }, [order, settings]);

  if (!order) return null;

  const totalAmountWords = numberToWordsIndian(Number(totalAmount) || 0);

  const handlePrint = () => {
    // If tracking number was not saved, update it in background
    if (order && !order.trackingNumber && awbNumber) {
      updateOrderStatus(order.id, order.orderStatus, awbNumber).catch(() => {});
    }

    const labelElem = document.getElementById('meesho-thermal-label-container');
    if (!labelElem) {
      window.print();
      return;
    }

    // Clean up old print iframe if present
    const oldIframe = document.getElementById('thermal-print-iframe');
    if (oldIframe) {
      oldIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'thermal-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    // Collect all stylesheets from the document
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((el) => el.outerHTML)
      .join('\n');

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Label_${orderNumber || 'PRINT'}</title>
          ${styles}
          <style>
            @page {
              size: 4in 6in;
              margin: 0 !important;
            }
            *, *::before, *::after {
              box-sizing: border-box !important;
            }
            html, body {
              width: 4in !important;
              height: 6in !important;
              max-width: 4in !important;
              max-height: 6in !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden !important;
              background: #ffffff !important;
              color: #000000 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              page-break-after: avoid !important;
              page-break-before: avoid !important;
              break-after: avoid !important;
              break-before: avoid !important;
            }
            #print-wrapper {
              width: 4in !important;
              height: 6in !important;
              max-width: 4in !important;
              max-height: 6in !important;
              overflow: hidden !important;
              margin: 0 !important;
              padding: 4px !important;
              box-sizing: border-box !important;
            }
            #meesho-thermal-label-container {
              width: 100% !important;
              height: 100% !important;
              max-height: 100% !important;
              overflow: hidden !important;
              box-sizing: border-box !important;
              box-shadow: none !important;
              border: 2px solid #000000 !important;
            }
          </style>
        </head>
        <body>
          <div id="print-wrapper">
            ${labelElem.outerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    // Allow styles to apply, then trigger print
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        window.print();
      } finally {
        setTimeout(() => {
          iframe.remove();
        }, 2500);
      }
    }, 300);
  };

  const handleCopyAWB = () => {
    navigator.clipboard.writeText(awbNumber);
    setIsCopied(true);
    toast.success('AWB Number copied to clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Item management helpers
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        name: 'Additional Item',
        sku: 'SKU-EXTRA',
        variant: 'Standard',
        quantity: 1,
        price: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      toast.error('Invoice must contain at least one item');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRecalculateTotal = () => {
    const itemsSum = items.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
      0
    );
    const newTotal = itemsSum + (Number(codCharge) || 0) + (Number(shippingAmount) || 0);
    setTotalAmount(newTotal);
    toast.success(`Grand total recalculated: ₹${newTotal.toLocaleString('en-IN')}`);
  };

  // Shared 4x6 Label JSX Component for both Preview & Split Edit View
  const render4x6Label = () => (
    <div
      id="meesho-thermal-label-container"
      className="w-[384px] h-[576px] max-h-[576px] bg-white text-black font-sans text-[11px] leading-tight p-2 border-2 border-black flex flex-col justify-between shadow-2xl select-text shrink-0 overflow-hidden"
      style={{
        width: '4in',
        height: '6in',
        maxHeight: '6in',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        color: '#000000',
        overflow: 'hidden',
      }}
    >
      {/* ======================================================== */}
      {/* 1. TOP SHIPPING ZONE (COURIER & AWB BARCODE)             */}
      {/* ======================================================== */}
      <div className="border-2 border-black p-1 space-y-1">
        {/* Courier Header & Routing code */}
        <div className="flex items-center justify-between border-b-2 border-black pb-1">
          <div>
            <span className="font-extrabold text-sm tracking-tight block uppercase">
              {courierName}
            </span>
            {logisticsTag && (
              <span className="text-[9px] font-semibold text-neutral-600 uppercase">
                {logisticsTag}
              </span>
            )}
          </div>
          <div className="text-right">
            <div className="border border-black px-1.5 py-0.5 rounded text-[10px] font-extrabold tracking-wider bg-black text-white">
              {routingCode}
            </div>
            <span className="text-[10px] font-black tracking-wider block mt-0.5">
              PIN: {customerZip}
            </span>
          </div>
        </div>

        {/* Primary Scannable AWB Barcode */}
        <div className="flex flex-col items-center justify-center py-0.5 border-b-2 border-black">
          <BarcodeSVG
            value={awbNumber}
            format="CODE128"
            width={1.5}
            height={36}
            displayValue={false}
          />
          <div className="font-mono text-xs font-bold tracking-widest mt-0.5">
            AWB: {awbNumber}
          </div>
        </div>

        {/* Payment Mode Box & Sub-Order info */}
        <div className="flex items-center justify-between border-b-2 border-black py-1 px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase">Payment:</span>
            {paymentMode === 'COD' ? (
              <span className="border-2 border-black bg-black text-white font-black text-xs px-2 py-0.5 uppercase tracking-wide">
                COD: ₹{Number(totalAmount).toLocaleString('en-IN')}
              </span>
            ) : (
              <span className="border-2 border-black bg-neutral-200 text-black font-black text-xs px-2 py-0.5 uppercase tracking-wide">
                PREPAID
              </span>
            )}
          </div>
          <div className="text-right text-[10px]">
            <span className="text-neutral-600">Order ID: </span>
            <span className="font-mono font-bold">{orderNumber}</span>
          </div>
        </div>

        {/* Deliver To (Buyer) & Return To (Seller) Grid */}
        <div className="grid grid-cols-2 gap-1 border-b-2 border-black text-[10px] pt-1 pb-1">
          {/* Deliver To */}
          <div className="pr-1 border-r border-black">
            <p className="font-black uppercase text-[10px] tracking-wide border-b border-black pb-0.5 mb-1">
              Deliver To:
            </p>
            <p className="font-extrabold text-[11px] text-black line-clamp-1">
              {customerName}
            </p>
            <p className="text-[9.5px] leading-tight line-clamp-3 mt-0.5">
              {customerStreet}
            </p>
            <p className="text-[9.5px] leading-tight font-bold mt-0.5">
              {customerCity}, {customerState}
            </p>
            <p className="font-black text-xs mt-0.5">
              PIN: {customerZip}
            </p>
            <p className="font-semibold text-[9.5px] mt-0.5">
              Ph: {customerPhone || '98XXXXXXXX'}
            </p>
          </div>

          {/* Return To */}
          <div className="pl-1">
            <p className="font-black uppercase text-[9px] tracking-wide border-b border-black pb-0.5 mb-1">
              If Undelivered, Return To:
            </p>
            <p className="font-bold text-[10px] text-black">
              {sellerName}
            </p>
            <p className="text-[9px] leading-tight line-clamp-3 mt-0.5">
              {sellerAddress}
            </p>
            <p className="text-[9px] mt-0.5">
              GSTIN: <span className="font-mono font-bold">{sellerGstin}</span>
            </p>
            <p className="text-[9px] font-bold mt-0.5">
              Return PIN: {returnPin}
            </p>
          </div>
        </div>

        {/* SKU & Product Strip */}
        <div className="text-[9.5px] pt-0.5">
          <div className="grid grid-cols-6 font-bold border-b border-black pb-0.5">
            <span className="col-span-3">Item / SKU</span>
            <span className="col-span-1 text-center">Size</span>
            <span className="col-span-1 text-center">Qty</span>
            <span className="col-span-1 text-right">Price</span>
          </div>
          {items.slice(0, 2).map((item, i) => (
            <div key={i} className="grid grid-cols-6 py-0.5 border-b border-neutral-300">
              <span className="col-span-3 truncate font-medium">
                {item.sku ? `${item.sku} - ` : ''}{item.name}
              </span>
              <span className="col-span-1 text-center truncate">
                {item.variant || 'Free'}
              </span>
              <span className="col-span-1 text-center font-bold">
                {item.quantity}
              </span>
              <span className="col-span-1 text-right font-medium">
                ₹{Number(item.price) * Number(item.quantity)}
              </span>
            </div>
          ))}
          {items.length > 2 && (
            <p className="text-[8.5px] text-neutral-600 text-center pt-0.5">
              + {items.length - 2} more item(s) in package
            </p>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. PERFORATION CUT LINE (SEPARATES LABEL & INVOICE)      */}
      {/* ======================================================== */}
      <div className="relative py-1.5 my-0.5 text-center">
        <div className="border-t border-dashed border-black w-full absolute top-1/2 left-0"></div>
        <span className="bg-white px-2 relative text-[8px] font-black uppercase tracking-widest text-neutral-700 flex items-center justify-center gap-1 mx-auto w-fit">
          <Scissors className="w-3 h-3 text-black" />
          <span>FOLD OR CUT HERE FOR PACKING SLIP</span>
        </span>
      </div>

      {/* ======================================================== */}
      {/* 3. BOTTOM ZONE: RETAIL TAX INVOICE                       */}
      {/* ======================================================== */}
      <div className="border-2 border-black p-1 space-y-1">
        {/* Invoice Title & Meta */}
        <div className="flex items-center justify-between border-b border-black pb-1">
          <div>
            <span className="font-black text-xs uppercase tracking-wider block">
              TAX INVOICE
            </span>
            <span className="text-[8.5px] text-neutral-600">
              Original for Recipient
            </span>
          </div>
          <div className="text-right text-[9px] font-mono">
            <p>
              <span className="font-bold">Invoice No:</span> {invoiceNumber}
            </p>
            <p>
              <span className="font-bold">Date:</span> {invoiceDate}
            </p>
          </div>
        </div>

        {/* Order & Tax Meta */}
        <div className="grid grid-cols-2 gap-1 text-[8.5px] border-b border-black pb-1">
          <div>
            <p><span className="font-bold">Sold By:</span> {sellerName}</p>
            <p className="text-neutral-700 truncate">{sellerAddress}</p>
          </div>
          <div className="text-right">
            <p><span className="font-bold">Buyer:</span> {customerName}</p>
            <p className="text-neutral-700 font-bold">
              Mode: {paymentMode === 'COD' ? `COD (Collect ₹${Number(totalAmount).toLocaleString('en-IN')})` : 'Online Paid'}
            </p>
          </div>
        </div>

        {/* Invoice Line Items */}
        <div className="text-[8.5px]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black font-bold">
                <th className="py-0.5">Item Description</th>
                <th className="py-0.5 text-center">Qty</th>
                <th className="py-0.5 text-right">Price</th>
                <th className="py-0.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {items.slice(0, 3).map((item, idx) => (
                <tr key={idx}>
                  <td className="py-0.5 pr-1 truncate max-w-[170px]">
                    {item.name}
                  </td>
                  <td className="py-0.5 text-center font-bold">{item.quantity}</td>
                  <td className="py-0.5 text-right">₹{item.price}</td>
                  <td className="py-0.5 text-right font-bold">
                    ₹{Number(item.price) * Number(item.quantity)}
                  </td>
                </tr>
              ))}
              {Number(codCharge) > 0 && (
                <tr>
                  <td className="py-0.5 pr-1 font-semibold text-neutral-800">
                    COD Extra Handling Fee
                  </td>
                  <td className="py-0.5 text-center">1</td>
                  <td className="py-0.5 text-right">₹{codCharge}</td>
                  <td className="py-0.5 text-right font-bold">₹{codCharge}</td>
                </tr>
              )}
              {Number(shippingAmount) > 0 && (
                <tr>
                  <td className="py-0.5 pr-1 text-neutral-700">
                    Shipping Charges
                  </td>
                  <td className="py-0.5 text-center">1</td>
                  <td className="py-0.5 text-right">₹{shippingAmount}</td>
                  <td className="py-0.5 text-right font-bold">₹{shippingAmount}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Invoice Totals & Words */}
        <div className="border-t-2 border-black pt-1 mt-1 text-[9px]">
          <div className="flex justify-between font-black text-[11px] border-b border-black pb-0.5">
            <span>Grand Total:</span>
            <span>₹{Number(totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="text-[8px] italic text-neutral-700 pt-0.5">
            Amount in words: <span className="font-bold">{totalAmountWords}</span>
          </div>
        </div>

        {/* Bottom Micro Barcode & Legal Disclaimer */}
        <div className="flex items-center justify-between border-t border-neutral-300 pt-1 text-[7.5px] text-neutral-600">
          <span className="leading-tight">
            This is a computer-generated invoice and requires no physical signature.
          </span>
          <BarcodeSVG
            value={orderNumber || 'ORD'}
            format="CODE128"
            width={1.2}
            height={18}
            displayValue={false}
          />
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="4x6 Shipping Label & Tax Invoice"
      subtitle="Standard 4x6 inch (100mm x 150mm) label with scannable barcode, retail tax invoice & live editor"
      size="4xl"
      footer={
        <>
          <div className="flex items-center gap-2 mr-auto text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Exact 4x6 Thermal Print Scale (Zebra, TVS, TSC & Laser)</span>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Print 4x6 Label
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Navigation & Mode Toggle Bar */}
        <div className="p-3 rounded-xl bg-[#141418] border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'preview'
                  ? 'bg-gold-primary text-black font-semibold shadow-md'
                  : 'bg-[#1b1b22] text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Label</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'edit'
                  ? 'bg-gold-primary text-black font-semibold shadow-md'
                  : 'bg-[#1b1b22] text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Invoice & Label</span>
            </button>

            <button
              type="button"
              onClick={() => {
                initFromOrder();
                toast.info('Invoice and label restored to order defaults');
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              title="Reset all values to order defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
            >
              Print Now
            </Button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* VIEW 1: PURE PREVIEW MODE                                */}
        {/* ======================================================== */}
        {activeTab === 'preview' && (
          <div className="space-y-4">
            {/* Quick Courier Adjuster */}
            <div className="p-3 rounded-xl bg-[#141418] border border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">
                    Courier Partner
                  </label>
                  <select
                    className="bg-[#1b1b22] text-zinc-200 text-xs rounded-lg border border-zinc-700 px-2.5 py-1.5 focus:border-gold-primary"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                  >
                    <option value="DELHIVERY SURFACE">Delhivery Surface</option>
                    <option value="VALMO EXPRESS">Valmo Express</option>
                    <option value="SHADOWFAX SURFACE">Shadowfax Surface</option>
                    <option value="XPRESSBEES LOGISTICS">Xpressbees Logistics</option>
                    <option value="EKART LOGISTICS">Ekart Logistics</option>
                    <option value="DTDC PREMIUM">DTDC Premium</option>
                    <option value="BLUEDART EXPRESS">Blue Dart Express</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">
                    AWB / Tracking Number
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={awbNumber}
                      onChange={(e) => setAwbNumber(e.target.value)}
                      className="bg-[#1b1b22] font-mono text-zinc-200 text-xs rounded-lg border border-zinc-700 px-2.5 py-1.5 focus:border-gold-primary w-36"
                    />
                    <button
                      type="button"
                      onClick={handleCopyAWB}
                      className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
                      title="Copy AWB"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">
                    Routing Hub Code
                  </label>
                  <input
                    type="text"
                    value={routingCode}
                    onChange={(e) => setRoutingCode(e.target.value)}
                    className="bg-[#1b1b22] font-mono text-zinc-200 text-xs rounded-lg border border-zinc-700 px-2.5 py-1.5 focus:border-gold-primary w-28"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className="text-xs text-gold-primary hover:underline flex items-center gap-1 font-medium"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit More Fields (Address, Items, Price)</span>
              </button>
            </div>

            {/* Centered Preview Card */}
            <div className="flex justify-center bg-zinc-950/80 p-4 sm:p-6 rounded-2xl border border-zinc-800/80 overflow-x-auto">
              {render4x6Label()}
            </div>

            {/* Instruction Alert */}
            <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-900/60 text-xs text-blue-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-white">Thermal Printer Print Instructions (4x6 Inches):</p>
                <p className="text-[11px] text-blue-300 leading-relaxed">
                  Print dialog me <strong>Paper Size</strong> ko <strong>4x6 in (100x150 mm)</strong> select karein aur <strong>Scale</strong> ko <strong>100% / Actual Size</strong> rakhein. Label clean high-contrast format me bina margin ke print hoga.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: FULL EDIT MODE (WITH LIVE SIDE-BY-SIDE PREVIEW) */}
        {/* ======================================================== */}
        {activeTab === 'edit' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Left Column: Comprehensive Edit Forms */}
            <div className="xl:col-span-7 space-y-4 max-h-[72vh] overflow-y-auto pr-1">
              {/* Section 1: Courier & Logistics Header */}
              <div className="p-4 rounded-xl bg-[#141418] border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-gold-primary uppercase tracking-wider pb-1 border-b border-zinc-800">
                  <Truck className="w-4 h-4" />
                  <span>1. Logistics & Courier Details</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Courier Partner Name
                    </label>
                    <input
                      type="text"
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      placeholder="e.g. DELHIVERY SURFACE"
                      className="w-full bg-[#1b1b22] text-zinc-200 text-xs rounded-lg border border-zinc-700 px-3 py-2 focus:border-gold-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Logistics Sub-header / Partner Tag
                    </label>
                    <input
                      type="text"
                      value={logisticsTag}
                      onChange={(e) => setLogisticsTag(e.target.value)}
                      placeholder="e.g. Express Delivery Network (Leave blank if none)"
                      className="w-full bg-[#1b1b22] text-zinc-200 text-xs rounded-lg border border-zinc-700 px-3 py-2 focus:border-gold-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      AWB / Tracking Barcode Number
                    </label>
                    <input
                      type="text"
                      value={awbNumber}
                      onChange={(e) => setAwbNumber(e.target.value)}
                      className="w-full font-mono bg-[#1b1b22] text-zinc-200 text-xs rounded-lg border border-zinc-700 px-3 py-2 focus:border-gold-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Routing / Hub Code
                    </label>
                    <input
                      type="text"
                      value={routingCode}
                      onChange={(e) => setRoutingCode(e.target.value)}
                      placeholder="e.g. DEL/BOM/RT-04"
                      className="w-full font-mono bg-[#1b1b22] text-zinc-200 text-xs rounded-lg border border-zinc-700 px-3 py-2 focus:border-gold-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Deliver To (Customer) */}
              <div className="p-4 rounded-xl bg-[#141418] border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-gold-primary uppercase tracking-wider pb-1 border-b border-zinc-800">
                  <User className="w-4 h-4" />
                  <span>2. Deliver To (Customer / Buyer)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Customer Full Name
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-[#1b1b22] text-zinc-200 text-xs rounded-lg border border-zinc-700 px-3 py-2 focus:border-gold-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Customer Phone Number
                    </label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-[#1b1b22] text-zinc-200 text-xs rounded-lg border border-zinc-700 px-3 py-2 focus:border-gold-primary"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Street Address / House No. / Landmark
                    </label>
                    <input
                      type="text"
                      value={customerStreet}
                      onChange={(e) => setCustomerStreet(e.target.value)}
                      className="w-full bg-[#1b1b22] text-zinc-200 text-xs rounded-lg border border-zinc-700 px-3 py-2 focus:border-gold-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                      className="w-full bg-[#1b1b22] text-zinc-200 text-xs rounded-lg border border-zinc-700 px-3 py-2 focus:border-gold-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={customerState}
                        onChange={(e) => setCustomerState(e.target.value)}
                        className="w-full bg-[#1b1b22] text-zinc-200 text-xs rounded-lg border border-zinc-700 px-3 py-2 focus:border-gold-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        PIN Code
                      </label>
                      <input
                        type="text"
                        value={customerZip}
                        onChange={(e) => setCustomerZip(e.target.value)}
                        className="w-full font-bold bg-[#1b1b22] text-zinc-200 text-xs rounded-lg border border-zinc-700 px-3 py-2 focus:border-gold-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Sold By (Seller / Return Address) */}
              <div className="p-4 rounded-xl bg-[#141418] border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-gold-primary uppercase tracking-wider pb-1 border-b border-zinc-800">
                  <Store className="w-4 h-4" />
                  <span>3. Return To (Seller / Store Address)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Store / Seller Name
                    </label>
                    <input
                      type="text"
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      className="w-full bg-[#1b1b22] text-zinc-200 text-xs rounded-lg border border-zinc-700 px-3 py-2 focus:border-gold-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      GSTIN Number
                    </label>
                    <input
                      type="text"
                      value={sellerGstin}
                      onChange={(e) => setSellerGstin(e.target.value)}
                      className="w-full font-mono bg-[#1b1b22] text-zinc-200 text-xs rounded-lg border border-zinc-700 px-3 py-2 focus:border-gold-primary"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Return Address
                    </label>
                    <input
                      type="text"
                      value={sellerAddress}
                      onChange={(e) => setSellerAddress(e.target.value)}
                      className="w-full bg-[#1b1b22] text-zinc-200 text-xs rounded-lg border border-zinc-700 px-3 py-2 focus:border-gold-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Return PIN Code
                    </label>
                    <input
                      type="text"
                      value={returnPin}
                      onChange={(e) => setReturnPin(e.target.value)}
                      className="w-full font-bold bg-[#1b1b22] text-zinc-200 text-xs rounded-lg border border-zinc-700 px-3 py-2 focus:border-gold-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Invoice Details & Financials */}
              <div className="p-4 rounded-xl bg-[#141418] border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-gold-primary uppercase tracking-wider">
                    <FileText className="w-4 h-4" />
                    <span>4. Invoice Details & Payment</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRecalculateTotal}
                    className="text-[11px] text-gold-light hover:underline font-medium"
                  >
                    Auto-Calculate Total
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Invoice Number
                    </label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full font-mono bg-[#1b1b22] text-zinc-200 text-xs rounded-lg border border-zinc-700 px-3 py-2 focus:border-gold-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Invoice Date
                    </label>
                    <input
                      type="text"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="w-full bg-[#1b1b22] text-zinc-200 text-xs rounded-lg border border-zinc-700 px-3 py-2 focus:border-gold-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Payment Mode
                    </label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value as 'COD' | 'PREPAID')}
                      className="w-full bg-[#1b1b22] text-zinc-200 text-xs rounded-lg border border-zinc-700 px-3 py-2 focus:border-gold-primary font-semibold"
                    >
                      <option value="COD">Cash On Delivery (COD)</option>
                      <option value="PREPAID">Prepaid (Online Paid)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Grand Total Collect (₹)
                    </label>
                    <input
                      type="number"
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(Number(e.target.value) || 0)}
                      className="w-full font-bold text-emerald-400 bg-[#1b1b22] text-xs rounded-lg border border-zinc-700 px-3 py-2 focus:border-gold-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      COD Extra Handling Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={codCharge}
                      onChange={(e) => setCodCharge(Number(e.target.value) || 0)}
                      className="w-full bg-[#1b1b22] text-zinc-200 text-xs rounded-lg border border-zinc-700 px-3 py-2 focus:border-gold-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Shipping Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={shippingAmount}
                      onChange={(e) => setShippingAmount(Number(e.target.value) || 0)}
                      className="w-full bg-[#1b1b22] text-zinc-200 text-xs rounded-lg border border-zinc-700 px-3 py-2 focus:border-gold-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Invoice Items Editor */}
              <div className="p-4 rounded-xl bg-[#141418] border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-gold-primary uppercase tracking-wider">
                    <span>5. Package Items in Invoice</span>
                    <span className="text-[10px] text-zinc-400">({items.length} items)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 text-xs text-gold-primary hover:underline font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="p-2.5 rounded-lg bg-[#1b1b22] border border-zinc-800/80 grid grid-cols-12 gap-2 items-center text-xs"
                    >
                      <div className="col-span-5 sm:col-span-4">
                        <label className="block text-[9px] text-zinc-400 mb-0.5">Item Name</label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                          className="w-full bg-[#121216] text-zinc-200 text-xs rounded px-2 py-1 border border-zinc-700 focus:border-gold-primary"
                        />
                      </div>

                      <div className="col-span-3 sm:col-span-2">
                        <label className="block text-[9px] text-zinc-400 mb-0.5">SKU</label>
                        <input
                          type="text"
                          value={item.sku}
                          onChange={(e) => handleItemChange(index, 'sku', e.target.value)}
                          className="w-full font-mono bg-[#121216] text-zinc-200 text-xs rounded px-2 py-1 border border-zinc-700 focus:border-gold-primary"
                        />
                      </div>

                      <div className="col-span-4 sm:col-span-2">
                        <label className="block text-[9px] text-zinc-400 mb-0.5">Size/Variant</label>
                        <input
                          type="text"
                          value={item.variant}
                          onChange={(e) => handleItemChange(index, 'variant', e.target.value)}
                          className="w-full bg-[#121216] text-zinc-200 text-xs rounded px-2 py-1 border border-zinc-700 focus:border-gold-primary"
                        />
                      </div>

                      <div className="col-span-3 sm:col-span-1">
                        <label className="block text-[9px] text-zinc-400 mb-0.5">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value) || 1)}
                          className="w-full font-bold bg-[#121216] text-zinc-200 text-xs rounded px-2 py-1 border border-zinc-700 focus:border-gold-primary text-center"
                        />
                      </div>

                      <div className="col-span-4 sm:col-span-2">
                        <label className="block text-[9px] text-zinc-400 mb-0.5">Price (₹)</label>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, 'price', Number(e.target.value) || 0)}
                          className="w-full font-bold bg-[#121216] text-zinc-200 text-xs rounded px-2 py-1 border border-zinc-700 focus:border-gold-primary"
                        />
                      </div>

                      <div className="col-span-1 flex justify-end pt-3">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Action Footer for Edit Mode */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('preview')}
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                >
                  View Full Preview
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handlePrint}
                  leftIcon={<Printer className="w-3.5 h-3.5" />}
                >
                  Save & Print 4x6 Label
                </Button>
              </div>
            </div>

            {/* Right Column: Live Sticky 4x6 Preview */}
            <div className="xl:col-span-5 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live 4x6 Preview
                </span>
                <span className="text-[11px] text-gold-primary font-mono font-medium">
                  {items.length} items • ₹{Number(totalAmount).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="bg-zinc-950/80 p-3 sm:p-4 rounded-2xl border border-zinc-800/80 overflow-x-auto w-full flex justify-center">
                {render4x6Label()}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
