import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Copy, 
  Check, 
  Scissors, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Order } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { BarcodeSVG } from './BarcodeSVG';
import { numberToWordsIndian } from '../../lib/numberToWords';
import { toast } from 'sonner';

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

  const [courierName, setCourierName] = useState<string>('DELHIVERY SURFACE');
  const [awbNumber, setAwbNumber] = useState<string>('');
  const [routingCode, setRoutingCode] = useState<string>('DEL/BOM/RT-04');
  const [isCopied, setIsCopied] = useState(false);

  // Sync state whenever order opens
  useEffect(() => {
    if (order) {
      const generatedAwb =
        order.trackingNumber ||
        `DEL${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      setAwbNumber(generatedAwb);

      // Auto routing code based on pincode or state
      const zip = order.shippingAddress.zip || '400001';
      const statePrefix = (order.shippingAddress.state || 'MH').slice(0, 3).toUpperCase();
      setRoutingCode(`${statePrefix}/${zip.slice(0, 3)}/RT-${Math.floor(10 + Math.random() * 89)}`);
    }
  }, [order]);

  if (!order) return null;

  const isCOD = order.paymentMethod?.toUpperCase().includes('COD');
  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN');

  const invoiceNumber = `INV-${order.orderNumber.replace(/[^0-9]/g, '') || order.id.slice(0, 8).toUpperCase()}`;
  const totalAmountWords = numberToWordsIndian(order.totalAmount);

  const handlePrint = () => {
    // If tracking number was not saved, update it in background
    if (!order.trackingNumber && awbNumber) {
      updateOrderStatus(order.id, order.orderStatus, awbNumber).catch(() => {});
    }
    window.print();
  };

  const handleCopyAWB = () => {
    navigator.clipboard.writeText(awbNumber);
    setIsCopied(true);
    toast.success('AWB Number copied to clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Meesho 4x6 Shipping Label & Tax Invoice"
      subtitle="Standard 4x6 inch (100mm x 150mm) thermal label with scannable barcode & integrated tax invoice"
      size="2xl"
      footer={
        <>
          <div className="flex items-center gap-2 mr-auto text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Optimized for 4x6 Thermal & Laser Printers</span>
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
      <div className="space-y-6">
        {/* Controls Bar */}
        <div className="p-3.5 rounded-xl bg-[#141418] border border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
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
                <option value="VALMO AIR EXPRESS">Valmo (Meesho In-house Express)</option>
                <option value="SHADOWFAX SURFACE">Shadowfax Surface</option>
                <option value="XPRESSBEES LOGISTICS">Xpressbees Logistics</option>
                <option value="EKART LOGISTICS">Ekart Logistics</option>
                <option value="DTDC PREMIUM">DTDC Premium</option>
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
                Routing / Hub Code
              </label>
              <input
                type="text"
                value={routingCode}
                onChange={(e) => setRoutingCode(e.target.value)}
                className="bg-[#1b1b22] font-mono text-zinc-200 text-xs rounded-lg border border-zinc-700 px-2.5 py-1.5 focus:border-gold-primary w-28"
              />
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
          >
            Quick Print
          </Button>
        </div>

        {/* 4x6 Label Thermal Preview Container */}
        <div className="flex justify-center bg-zinc-950/80 p-4 sm:p-6 rounded-2xl border border-zinc-800/80 overflow-x-auto">
          {/* Printable 4x6 Label Card (exact 4in x 6in scale) */}
          <div
            id="meesho-thermal-label-container"
            className="w-[384px] min-h-[576px] bg-white text-black font-sans text-[11px] leading-tight p-2.5 border-2 border-black flex flex-col justify-between shadow-2xl select-text"
            style={{
              width: '4in',
              minHeight: '6in',
              boxSizing: 'border-box',
              backgroundColor: '#ffffff',
              color: '#000000',
            }}
          >
            {/* ======================================================== */}
            {/* 1. TOP SHIPPING ZONE (MEESHO STYLE COURIER & AWB BARCODE) */}
            {/* ======================================================== */}
            <div className="border-2 border-black p-1 space-y-1">
              {/* Courier Header & Routing code */}
              <div className="flex items-center justify-between border-b-2 border-black pb-1">
                <div>
                  <span className="font-extrabold text-sm tracking-tight block uppercase">
                    {courierName}
                  </span>
                  <span className="text-[9px] font-semibold text-neutral-600 uppercase">
                    Meesho Marketplace Logistics Partner
                  </span>
                </div>
                <div className="text-right">
                  <div className="border border-black px-1.5 py-0.5 rounded text-[10px] font-extrabold tracking-wider bg-black text-white">
                    {routingCode}
                  </div>
                  <span className="text-[10px] font-black tracking-wider block mt-0.5">
                    PIN: {order.shippingAddress.zip}
                  </span>
                </div>
              </div>

              {/* Primary Scannable AWB Barcode */}
              <div className="flex flex-col items-center justify-center py-0.5 border-b-2 border-black">
                <BarcodeSVG
                  value={awbNumber}
                  format="CODE128"
                  width={1.6}
                  height={44}
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
                  {isCOD ? (
                    <span className="border-2 border-black bg-black text-white font-black text-xs px-2 py-0.5 uppercase tracking-wide">
                      COD: ₹{order.totalAmount.toLocaleString('en-IN')}
                    </span>
                  ) : (
                    <span className="border-2 border-black bg-neutral-200 text-black font-black text-xs px-2 py-0.5 uppercase tracking-wide">
                      PREPAID
                    </span>
                  )}
                </div>
                <div className="text-right text-[10px]">
                  <span className="text-neutral-600">Order ID: </span>
                  <span className="font-mono font-bold">{order.orderNumber}</span>
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
                    {order.customerName}
                  </p>
                  <p className="text-[9.5px] leading-tight line-clamp-3 mt-0.5">
                    {order.shippingAddress.street}
                  </p>
                  <p className="text-[9.5px] leading-tight font-bold mt-0.5">
                    {order.shippingAddress.city}, {order.shippingAddress.state}
                  </p>
                  <p className="font-black text-xs mt-0.5">
                    PIN: {order.shippingAddress.zip}
                  </p>
                  <p className="font-semibold text-[9.5px] mt-0.5">
                    Ph: {order.customerPhone || '98XXXXXXXX'}
                  </p>
                </div>

                {/* Return To */}
                <div className="pl-1">
                  <p className="font-black uppercase text-[9px] tracking-wide border-b border-black pb-0.5 mb-1">
                    If Undelivered, Return To:
                  </p>
                  <p className="font-bold text-[10px] text-black">
                    {settings.storeName || 'KINORA LUXURY'}
                  </p>
                  <p className="text-[9px] leading-tight line-clamp-3 mt-0.5">
                    {settings.address || 'Zaveri Bazaar, Kalbadevi, Mumbai - 400002'}
                  </p>
                  <p className="text-[9px] mt-0.5">
                    GSTIN: <span className="font-mono font-bold">27AABCK1234F1Z5</span>
                  </p>
                  <p className="text-[9px] font-bold mt-0.5">
                    Return PIN: {order.shippingAddress.zip ? '400002' : '400002'}
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
                {order.items.slice(0, 2).map((item, i) => (
                  <div key={i} className="grid grid-cols-6 py-0.5 border-b border-neutral-300">
                    <span className="col-span-3 truncate font-medium">
                      {item.sku || 'SKU'} - {item.name}
                    </span>
                    <span className="col-span-1 text-center truncate">
                      {item.variant || 'Free'}
                    </span>
                    <span className="col-span-1 text-center font-bold">
                      {item.quantity}
                    </span>
                    <span className="col-span-1 text-right font-medium">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <p className="text-[8.5px] text-neutral-600 text-center pt-0.5">
                    + {order.items.length - 2} more item(s) in package
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
                    <span className="font-bold">Date:</span> {formattedDate}
                  </p>
                </div>
              </div>

              {/* Order & Tax Meta */}
              <div className="grid grid-cols-2 gap-1 text-[8.5px] border-b border-black pb-1">
                <div>
                  <p><span className="font-bold">Sold By:</span> {settings.storeName || 'KINORA LUXURY'}</p>
                  <p className="text-neutral-700 truncate">{settings.address || 'Mumbai, Maharashtra'}</p>
                </div>
                <div className="text-right">
                  <p><span className="font-bold">Buyer:</span> {order.customerName}</p>
                  <p className="text-neutral-700 font-bold">
                    Mode: {isCOD ? `COD (Collect ₹${order.totalAmount})` : 'Online Paid'}
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
                    {order.items.slice(0, 3).map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-0.5 pr-1 truncate max-w-[170px]">
                          {item.name}
                        </td>
                        <td className="py-0.5 text-center font-bold">{item.quantity}</td>
                        <td className="py-0.5 text-right">₹{item.price}</td>
                        <td className="py-0.5 text-right font-bold">
                          ₹{item.price * item.quantity}
                        </td>
                      </tr>
                    ))}
                    {order.codCharge && order.codCharge > 0 && (
                      <tr>
                        <td className="py-0.5 pr-1 font-semibold text-neutral-800">
                          COD Extra Handling Fee
                        </td>
                        <td className="py-0.5 text-center">1</td>
                        <td className="py-0.5 text-right">₹{order.codCharge}</td>
                        <td className="py-0.5 text-right font-bold">₹{order.codCharge}</td>
                      </tr>
                    )}
                    {order.shippingAmount > 0 && (
                      <tr>
                        <td className="py-0.5 pr-1 text-neutral-700">
                          Shipping Charges
                        </td>
                        <td className="py-0.5 text-center">1</td>
                        <td className="py-0.5 text-right">₹{order.shippingAmount}</td>
                        <td className="py-0.5 text-right font-bold">₹{order.shippingAmount}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Invoice Totals & Words */}
              <div className="border-t-2 border-black pt-1 mt-1 text-[9px]">
                <div className="flex justify-between font-black text-[11px] border-b border-black pb-0.5">
                  <span>Grand Total:</span>
                  <span>₹{order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
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
                  value={order.orderNumber}
                  format="CODE128"
                  width={1.2}
                  height={18}
                  displayValue={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Printer Setup & Instruction Alert */}
        <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-900/60 text-xs text-blue-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-white">Thermal Printer Print Instructions (4x6 Inches):</p>
            <p className="text-[11px] text-blue-300 leading-relaxed">
              Print dialog me <strong>Paper Size</strong> ko <strong>4x6 in (100x150 mm)</strong> select karein aur <strong>Scale</strong> ko <strong>100% / Actual Size</strong> rakhein. Background graphics toggle karne ki zaroorat nahi hai, label clean monochrome format me print hoga.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
