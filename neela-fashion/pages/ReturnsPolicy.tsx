import React from 'react';
import { RotateCcw, Truck, CreditCard, Ban, Box, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';

const ReturnsPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-sand-50 pt-32 pb-20">
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        
        {/* Page Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <span className="text-gold-600 uppercase tracking-[0.2em] text-xs font-bold mb-3 block">Customer Satisfaction</span>
          <h1 className="text-3xl md:text-5xl font-serif text-navy-900 mb-6 uppercase tracking-wide">Refund & Return Policy</h1>
          <div className="w-24 h-0.5 bg-gold-500 mx-auto"></div>
          <p className="mt-6 text-gray-500 font-light max-w-2xl mx-auto font-sans">
            Neela Fashion - Last Updated: 17-12-2025
          </p>
          <p className="mt-2 text-sm text-gray-600">
            We want our customers to be fully satisfied with their purchase. If you are not happy with your order, please review our policy below.
          </p>
        </div>

        <div className="space-y-12 font-sans">
            
            {/* 1. Refund Policy */}
            <div className="bg-white p-8 rounded-sm shadow-sm border-t-4 border-navy-900 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                    <RotateCcw className="text-gold-600" size={28} />
                    <h2 className="text-2xl font-serif text-navy-900 font-bold">Refund Policy</h2>
                </div>

                <div className="space-y-6 pl-2 md:pl-10">
                    <div>
                        <h4 className="font-bold text-navy-900 text-sm uppercase tracking-wide mb-2">1. Eligibility for Refund</h4>
                        <ul className="list-disc list-inside text-gray-600 text-sm space-y-2">
                            <li>Refund requests must be raised within <span className="font-bold">7 days</span> from the date of delivery.</li>
                            <li>The product must be unused, unwashed, undamaged, and returned in its original packaging with tags intact.</li>
                            <li>Order confirmation or order ID is mandatory.</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-navy-900 text-sm uppercase tracking-wide mb-2">2. Refund Process</h4>
                        <ul className="list-disc list-inside text-gray-600 text-sm space-y-2">
                            <li>Once we receive the returned product, it will be inspected.</li>
                            <li>After successful verification, we will notify you about approval or rejection.</li>
                            <li>If approved, the refund amount will be credited to the original payment method within <span className="font-bold">5–7 business days</span>.</li>
                            <li>Shipping charges are non-refundable, except in cases where the product was damaged or incorrect.</li>
                        </ul>
                    </div>

                    <div className="bg-red-50 p-4 rounded border border-red-100">
                        <h4 className="font-bold text-red-700 text-sm uppercase tracking-wide mb-2">3. Non-Refundable Items</h4>
                        <ul className="list-disc list-inside text-red-600 text-sm space-y-1">
                            <li>Discounted or sale products</li>
                            <li>Customized or personalized orders</li>
                            <li>Innerwear, accessories, or hygiene-sensitive items</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* 2. Return & Exchange Policy */}
            <div className="bg-white p-8 rounded-sm shadow-sm border-t-4 border-gold-500 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-3 mb-6">
                    <Box className="text-navy-900" size={28} />
                    <h2 className="text-2xl font-serif text-navy-900 font-bold">Return & Exchange Policy</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-2 md:pl-10">
                    <div>
                        <h4 className="font-bold text-navy-900 text-sm uppercase tracking-wide mb-2">1. Return Window</h4>
                        <p className="text-gray-600 text-sm">Returns are accepted within <span className="font-bold">7 days</span> from the delivery date.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-navy-900 text-sm uppercase tracking-wide mb-2">2. Return Conditions</h4>
                        <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                            <li>Product must be unused and in original condition</li>
                            <li>All tags, packaging, and freebies must be returned</li>
                            <li>Used or damaged products will be rejected</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-navy-900 text-sm uppercase tracking-wide mb-2">3. Return Shipping</h4>
                        <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                            <li>Customers must bear return shipping charges unless the product is damaged or wrongly delivered</li>
                            <li>We recommend using a trackable courier service</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-navy-900 text-sm uppercase tracking-wide mb-2">4. Exchange Policy</h4>
                        <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                            <li>Exchanges are subject to product availability</li>
                            <li>If the requested size or item is unavailable, a refund will be processed</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 pl-2 md:pl-10">
                    <h4 className="font-bold text-navy-900 text-sm uppercase tracking-wide mb-4">5. How to Initiate a Return</h4>
                    <div className="bg-gray-50 p-6 rounded border border-gray-200">
                        <p className="text-sm text-gray-600 mb-4">Please contact us via email with the following details:</p>
                        <ul className="list-disc list-inside text-gray-600 text-sm mb-4">
                            <li>Order ID</li>
                            <li>Reason for return</li>
                            <li>Clear product images (if damaged or defective)</li>
                        </ul>
                        <div className="flex items-center gap-2 font-bold text-navy-900">
                            <Mail size={18} className="text-gold-600" />
                            Email: <a href="mailto:neelafashion2020@gmail.com" className="hover:text-gold-600 transition-colors">neelafashion2020@gmail.com</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Shipping Policy */}
            <div className="bg-navy-900 text-white p-8 rounded-sm shadow-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-3 mb-6">
                    <Truck className="text-gold-500" size={28} />
                    <h2 className="text-2xl font-serif font-bold text-white">Shipping Policy</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-2 md:pl-10">
                    <div>
                        <h4 className="text-gold-400 font-bold text-xs uppercase tracking-widest mb-2">Processing Time</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Orders are processed within <span className="text-white font-bold">1–3 business days</span> (excluding Sundays and public holidays).
                        </p>
                    </div>
                    <div>
                        <h4 className="text-gold-400 font-bold text-xs uppercase tracking-widest mb-2">Delivery Time</h4>
                        <ul className="text-gray-300 text-sm space-y-1">
                            <li>Standard Shipping: 5–7 business days</li>
                            <li>Delivery timelines may vary based on location and courier partner</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-gold-400 font-bold text-xs uppercase tracking-widest mb-2">Shipping Coverage</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Currently, we ship across <span className="text-white font-bold">India only</span>.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-gold-400 font-bold text-xs uppercase tracking-widest mb-2">Tracking</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Tracking details will be shared via SMS or email once the order is shipped.
                        </p>
                    </div>
                </div>
            </div>

            {/* 4. Contact Information */}
            <div className="bg-gray-50 p-10 rounded-sm border border-gray-200 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <h3 className="text-2xl font-serif text-navy-900 font-bold mb-6">Contact Information</h3>
                <p className="text-gray-500 text-sm mb-8">
                    If you have any questions regarding refunds, returns, or shipping, feel free to contact us:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <div className="bg-white p-6 shadow-sm rounded flex flex-col items-center">
                        <Mail className="text-gold-600 mb-3" size={24} />
                        <span className="text-xs font-bold uppercase text-gray-400 mb-1">Email</span>
                        <a href="mailto:neelafashion2020@gmail.com" className="text-sm font-medium text-navy-900 hover:text-gold-600">neelafashion2020@gmail.com</a>
                    </div>
                    <div className="bg-white p-6 shadow-sm rounded flex flex-col items-center">
                        <Phone className="text-gold-600 mb-3" size={24} />
                        <span className="text-xs font-bold uppercase text-gray-400 mb-1">Phone / WhatsApp</span>
                        <a href="tel:+918610638603" className="text-sm font-medium text-navy-900 hover:text-gold-600">+91 86106 38603</a>
                    </div>
                    <div className="bg-white p-6 shadow-sm rounded flex flex-col items-center">
                        <MapPin className="text-gold-600 mb-3" size={24} />
                        <span className="text-xs font-bold uppercase text-gray-400 mb-1">Business Address</span>
                        <p className="text-sm font-medium text-navy-900 text-center">Neela Fashion, 154, muthaliyarpatti street, Srivilliputtur -626125 ,Tamil Nadu, India</p>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default ReturnsPolicy;