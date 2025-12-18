import React from 'react';
import { Scale, CheckCircle, Globe, User, Package, CreditCard, RotateCcw, AlertCircle, ShieldAlert, FileText, ShieldCheck } from 'lucide-react';
import { useCMS } from '../context/CMSContext';

const Terms: React.FC = () => {
  const { globalSettings } = useCMS();

  return (
    <div className="min-h-screen bg-sand-50 pt-32 pb-20">
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <Scale size={40} className="mx-auto text-gold-600 mb-4" />
          <h1 className="text-4xl md:text-5xl font-serif text-navy-900 mb-6 uppercase tracking-wider">Terms & Conditions</h1>
          <div className="w-24 h-0.5 bg-gold-500 mx-auto"></div>
          <p className="mt-6 text-gray-500 font-light max-w-2xl mx-auto">
            {globalSettings.siteName}
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Please read these terms carefully before using our website.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
            
            {/* 1. Acceptance */}
            <div className="bg-white p-8 rounded-sm shadow-sm border-l-4 border-navy-900">
                <div className="flex items-start gap-4">
                    <CheckCircle className="text-navy-900 mt-1 flex-shrink-0" size={24} />
                    <div>
                        <h3 className="text-xl font-serif text-navy-900 font-bold mb-3">1. Acceptance of Terms</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            By accessing, browsing, or using this website, you acknowledge that you have read, understood, and agree to be bound by these terms. If you do not agree, please do not use our site.
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. Use of Website */}
            <div className="bg-white p-8 rounded-sm shadow-sm border-l-4 border-gold-500">
                <div className="flex items-start gap-4">
                    <Globe className="text-gold-600 mt-1 flex-shrink-0" size={24} />
                    <div>
                        <h3 className="text-xl font-serif text-navy-900 font-bold mb-3">2. Use of the Website</h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-2">
                            You agree to use this site for lawful purposes only.
                        </p>
                        <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                            <li>Personal use only (no commercial resale without permission).</li>
                            <li>Do not copy, reproduce, or resell content.</li>
                            <li>Do not use the site for any illegal or unauthorized purpose.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* 3. User Accounts */}
            <div className="bg-white p-8 rounded-sm shadow-sm border-l-4 border-navy-900">
                <div className="flex items-start gap-4">
                    <User className="text-navy-900 mt-1 flex-shrink-0" size={24} />
                    <div>
                        <h3 className="text-xl font-serif text-navy-900 font-bold mb-3">3. User Accounts</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            If you create an account, you are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
                        </p>
                    </div>
                </div>
            </div>

            {/* 4. Order Process */}
            <div className="bg-white p-8 rounded-sm shadow-sm border-l-4 border-gold-500">
                <div className="flex items-start gap-4">
                    <Package className="text-gold-600 mt-1 flex-shrink-0" size={24} />
                    <div>
                        <h3 className="text-xl font-serif text-navy-900 font-bold mb-3">4. Order Process</h3>
                        <ul className="list-disc list-inside text-gray-600 text-sm space-y-2 leading-relaxed">
                            <li>Orders are subject to acceptance and availability.</li>
                            <li>We reserve the right to cancel or refuse any order for any reason.</li>
                            <li>Order confirmation via email/SMS does not signify our acceptance of your order, but rather a confirmation that we have received it.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* 5. Pricing & Payments */}
            <div className="bg-white p-8 rounded-sm shadow-sm border-l-4 border-navy-900">
                <div className="flex items-start gap-4">
                    <CreditCard className="text-navy-900 mt-1 flex-shrink-0" size={24} />
                    <div>
                        <h3 className="text-xl font-serif text-navy-900 font-bold mb-3">5. Pricing & Payments</h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-2">
                            All prices are listed in INR and include applicable taxes unless stated otherwise.
                        </p>
                        <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                            <li>Prices are subject to change without notice.</li>
                            <li>Payment must be received in full before dispatch.</li>
                            <li>We use secure third-party payment gateways.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* 6. Returns / Refunds */}
            <div className="bg-white p-8 rounded-sm shadow-sm border-l-4 border-gold-500">
                <div className="flex items-start gap-4">
                    <RotateCcw className="text-gold-600 mt-1 flex-shrink-0" size={24} />
                    <div>
                        <h3 className="text-xl font-serif text-navy-900 font-bold mb-3">6. Returns & Refunds</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Please refer to our dedicated <span className="font-bold">Refund & Return Policy</span> page for detailed information on how and when you can return products, shipping costs, and processing times.
                        </p>
                    </div>
                </div>
            </div>

            {/* 7. User Obligations */}
            <div className="bg-white p-8 rounded-sm shadow-sm border-l-4 border-navy-900">
                <div className="flex items-start gap-4">
                    <AlertCircle className="text-navy-900 mt-1 flex-shrink-0" size={24} />
                    <div>
                        <h3 className="text-xl font-serif text-navy-900 font-bold mb-3">7. User Obligations</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            You agree to provide accurate and current information. You agree not to violate any laws in your jurisdiction or infringe on our intellectual property rights while using our service.
                        </p>
                    </div>
                </div>
            </div>

            {/* 8. Liability Limitation */}
            <div className="bg-white p-8 rounded-sm shadow-sm border-l-4 border-gold-500">
                <div className="flex items-start gap-4">
                    <ShieldAlert className="text-gold-600 mt-1 flex-shrink-0" size={24} />
                    <div>
                        <h3 className="text-xl font-serif text-navy-900 font-bold mb-3">8. Liability Limitation</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Neela Fashion shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our products or website. Our liability is limited to the value of the product purchased.
                        </p>
                    </div>
                </div>
            </div>

            {/* 9. Governing Law */}
            <div className="bg-white p-8 rounded-sm shadow-sm border-l-4 border-navy-900 md:col-span-2">
                <div className="flex items-start gap-4">
                    <FileText className="text-navy-900 mt-1 flex-shrink-0" size={24} />
                    <div>
                        <h3 className="text-xl font-serif text-navy-900 font-bold mb-3">9. Governing Law</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of these terms shall be subject to the exclusive jurisdiction of the courts in Tamil Nadu, India.
                        </p>
                    </div>
                </div>
            </div>

        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
                <ShieldCheck size={14} /> Neela Fashion Official Terms
            </p>
        </div>

      </div>
    </div>
  );
};

export default Terms;