import React, { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight, Download } from 'lucide-react';
import { CartItem, ShippingDetails } from '../types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const OrderSuccess: React.FC = () => {
  const location = useLocation();
  const invoiceRef = useRef<HTMLDivElement>(null);
  
  const state = location.state as { 
      orderId: string, 
      total: string, 
      items: CartItem[], 
      billing: ShippingDetails,
      shipping: ShippingDetails 
  } | null;
  
  const orderId = state?.orderId || 'ORD-XXXXX';
  const total = state?.total || '0.00';
  const items = state?.items || [];
  const billing = state?.billing;
  const shipping = state?.shipping;

  const handleDownloadPDF = async () => {
    if (invoiceRef.current) {
      try {
        const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`invoice_${orderId}.pdf`);
      } catch (error) {
        console.error("PDF Download Error", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 flex flex-col items-center justify-center py-20 pt-32">
      
      {/* Invoice Container */}
      <div ref={invoiceRef} className="bg-white p-12 rounded-xl shadow-2xl max-w-3xl w-full border-t-8 border-navy-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-100 rounded-full -mr-20 -mt-20 opacity-20 blur-3xl"></div>
        
        <div className="relative z-10">
            <div className="text-center mb-10">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100">
                    <CheckCircle size={40} className="text-green-600" />
                </div>
                <h1 className="text-4xl font-serif text-navy-900 mb-2">Thank You</h1>
                <p className="text-gold-600 uppercase tracking-widest text-xs font-bold">Order Confirmed</p>
            </div>

            <div className="border-b-2 border-dashed border-gray-200 mb-8"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 className="font-bold text-navy-900 uppercase text-xs tracking-wider mb-4">Billed To</h3>
                    {billing ? (
                        <p className="text-sm text-gray-500 leading-relaxed">
                            <span className="font-bold text-navy-900 block mb-1">{billing.firstName} {billing.lastName}</span>
                            {billing.address}<br/>{billing.city}, {billing.district}<br/>{billing.state} - {billing.pincode}<br/>{billing.phone}
                        </p>
                    ) : (<p className="text-sm text-gray-400">Guest Checkout</p>)}
                </div>
                <div>
                    <h3 className="font-bold text-navy-900 uppercase text-xs tracking-wider mb-4">Shipped To</h3>
                    {shipping ? (
                        <p className="text-sm text-gray-500 leading-relaxed">
                            <span className="font-bold text-navy-900 block mb-1">{shipping.firstName} {shipping.lastName}</span>
                            {shipping.address}<br/>{shipping.city}, {shipping.district}<br/>{shipping.state} - {shipping.pincode}<br/>{shipping.phone}
                        </p>
                    ) : (<p className="text-sm text-gray-400">Same as Billing</p>)}
                </div>
            </div>

            <div className="mb-8">
                 <div className="bg-gray-50 p-4 rounded text-center">
                    <h3 className="font-bold text-navy-900 uppercase text-xs tracking-wider mb-1">Order Info</h3>
                    <p className="text-sm text-gray-500 mb-1">Order #: <span className="font-mono font-bold text-navy-900">{orderId}</span></p>
                    <p className="text-sm text-gray-500 mb-1">Date: {new Date().toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500">Payment: <span className="font-bold text-green-600">Success</span></p>
                 </div>
            </div>

            <div className="mb-8">
                <h3 className="font-bold text-navy-900 uppercase text-xs tracking-wider mb-4">Items Purchased</h3>
                <div className="space-y-4">
                    {items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                            <div className="flex items-center gap-4">
                                <img src={item.image} alt={item.name} className="w-12 h-16 object-cover rounded-sm" />
                                <div>
                                    <p className="text-sm font-bold text-navy-900">{item.name}</p>
                                    <p className="text-xs text-gray-500">Qty: {item.quantity} | {item.subCategory}</p>
                                    {/* DISPLAY SIZE */}
                                    {item.selectedSize && <p className="text-xs font-bold text-navy-900 mt-1">Size: {item.selectedSize}</p>}
                                </div>
                            </div>
                            <p className="font-mono text-sm text-navy-900">₹{(item.discountPrice || item.price) * item.quantity}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-between items-center bg-navy-900 text-white p-6 rounded-lg shadow-lg">
                 <span className="font-serif text-lg">Total Paid</span>
                 <span className="font-sans text-2xl font-bold">₹{total}</span>
            </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 mb-12 flex flex-col sm:flex-row gap-4 justify-center">
            <button 
                onClick={handleDownloadPDF} 
                className="flex items-center justify-center px-8 py-3 border border-navy-900 bg-white text-navy-900 font-bold uppercase text-xs tracking-widest hover:bg-navy-900 hover:text-white transition-all duration-300 rounded-sm group shadow-lg"
            >
                <Download size={16} className="mr-2 group-hover:scale-110 transition-transform" /> Download PDF
            </button>
            
            <Link 
                to="/shop" 
                className="flex items-center justify-center px-8 py-3 bg-gold-500 text-white font-bold uppercase text-xs tracking-widest hover:bg-gold-600 transition-all duration-300 rounded-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
                Continue Shopping <ArrowRight size={16} className="ml-2" />
            </Link>
      </div>

    </div>
  );
};

export default OrderSuccess;