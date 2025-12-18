import React from 'react';
import { Lock, Database, BarChart, Share2, Shield, Cookie, Ban, RefreshCw, FileText } from 'lucide-react';
import { useCMS } from '../context/CMSContext';

const PrivacyPolicy: React.FC = () => {
  const { globalSettings } = useCMS();

  return (
    <div className="min-h-screen bg-sand-50 pt-32 pb-20">
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="w-16 h-16 bg-navy-900 rounded-full flex items-center justify-center mx-auto mb-4 text-gold-500">
             <Lock size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-navy-900 mb-6 uppercase tracking-wider">Privacy Policy</h1>
          <div className="w-24 h-0.5 bg-gold-500 mx-auto"></div>
          <p className="mt-6 text-gray-500 font-light max-w-2xl mx-auto">
            {globalSettings.siteName} respects your privacy and is committed to protecting your personal information.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
            
            {/* 1. What Info Is Collected */}
            <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100">
                <div className="flex items-start gap-4">
                    <Database className="text-gold-600 mt-1 flex-shrink-0" size={24} />
                    <div>
                        <h3 className="text-xl font-serif text-navy-900 font-bold mb-4">1. What Info Is Collected</h3>
                        <ul className="list-disc list-inside text-gray-600 text-sm space-y-2">
                            <li><strong>Personal Data:</strong> Name, email address, phone number, shipping & billing address.</li>
                            <li><strong>Payment Info:</strong> Processed securely via third-party processors (we do not store card details).</li>
                            <li><strong>Device Data:</strong> IP address, browser type, and cookies for site functionality.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* 2. How Data Is Used */}
            <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100">
                <div className="flex items-start gap-4">
                    <BarChart className="text-navy-900 mt-1 flex-shrink-0" size={24} />
                    <div>
                        <h3 className="text-xl font-serif text-navy-900 font-bold mb-4">2. How Data Is Used</h3>
                        <ul className="list-disc list-inside text-gray-600 text-sm space-y-2">
                            <li>To process and fulfill your orders.</li>
                            <li>To provide customer support and resolve issues.</li>
                            <li>To improve our products, services, and website experience.</li>
                            <li>To send marketing communications (only if you have consented).</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* 3. Sharing With Third Parties */}
            <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100">
                <div className="flex items-start gap-4">
                    <Share2 className="text-green-600 mt-1 flex-shrink-0" size={24} />
                    <div>
                        <h3 className="text-xl font-serif text-navy-900 font-bold mb-4">3. Sharing With Third Parties</h3>
                        <p className="text-gray-600 text-sm mb-2">We may share necessary data with:</p>
                        <ul className="list-disc list-inside text-gray-600 text-sm space-y-2">
                            <li>Shipping partners (to deliver your order).</li>
                            <li>Payment gateways (to process secure transactions).</li>
                            <li>Legal authorities (if required by law enforcement).</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* 4. Security Measures */}
            <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100">
                <div className="flex items-start gap-4">
                    <Shield className="text-blue-600 mt-1 flex-shrink-0" size={24} />
                    <div>
                        <h3 className="text-xl font-serif text-navy-900 font-bold mb-4">4. Security Measures</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            We take robust steps to protect your information, including encryption (SSL) and secure servers to prevent unauthorized access, alteration, or disclosure.
                        </p>
                    </div>
                </div>
            </div>

            {/* 5. Cookies */}
            <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100">
                <div className="flex items-start gap-4">
                    <Cookie className="text-orange-500 mt-1 flex-shrink-0" size={24} />
                    <div>
                        <h3 className="text-xl font-serif text-navy-900 font-bold mb-4">5. Cookies</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            We use cookies and similar tracking technologies to track the activity on our service and hold certain information to improve user experience and website functionality.
                        </p>
                    </div>
                </div>
            </div>

            {/* 6. Children’s Privacy */}
            <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100">
                <div className="flex items-start gap-4">
                    <Ban className="text-red-500 mt-1 flex-shrink-0" size={24} />
                    <div>
                        <h3 className="text-xl font-serif text-navy-900 font-bold mb-4">6. Children’s Privacy</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Our site is not intended for use by young children. We do not knowingly collect personally identifiable information from anyone under the age of 18 without parental consent.
                        </p>
                    </div>
                </div>
            </div>

            {/* 7. Changes to Policy */}
            <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100">
                <div className="flex items-start gap-4">
                    <RefreshCw className="text-purple-600 mt-1 flex-shrink-0" size={24} />
                    <div>
                        <h3 className="text-xl font-serif text-navy-900 font-bold mb-4">7. Changes to Policy</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
                        </p>
                    </div>
                </div>
            </div>

            {/* 8. Your Rights */}
            <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100">
                <div className="flex items-start gap-4">
                    <FileText className="text-teal-600 mt-1 flex-shrink-0" size={24} />
                    <div>
                        <h3 className="text-xl font-serif text-navy-900 font-bold mb-4">8. Your Rights</h3>
                        <p className="text-gray-600 text-sm mb-2">You have the right to:</p>
                        <ul className="list-disc list-inside text-gray-600 text-sm space-y-2">
                            <li>Access the personal data we hold about you.</li>
                            <li>Request corrections to any inaccurate data.</li>
                            <li>Request deletion of your data (subject to legal obligations).</li>
                            <li>Opt-out of marketing communications.</li>
                        </ul>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;