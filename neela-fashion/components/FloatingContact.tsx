import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { useCMS } from '../context/CMSContext';

const FloatingContact: React.FC = () => {
  const { globalSettings } = useCMS();

  const handleWhatsApp = () => {
    const number = globalSettings.whatsappNumber || '919876543210'; // Fallback
    window.open(`https://wa.me/${number.replace('+', '')}`, '_blank');
  };

  const handleCall = () => {
    const number = globalSettings.contactNumber || '919876543210'; // Fallback
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="fixed right-6 bottom-6 z-50 flex flex-col gap-4">
      {/* Phone Call Icon */}
      <button 
        onClick={handleCall}
        className="group relative flex items-center justify-center w-14 h-14 bg-navy-900 text-white rounded-full shadow-2xl hover:bg-gold-500 transition-all duration-300 hover:scale-110 border border-gold-500/20"
        title="Call Us"
      >
        <div className="absolute inset-0 rounded-full bg-gold-500 opacity-0 group-hover:animate-ping"></div>
        <Phone size={24} className="relative z-10" />
        <span className="absolute right-full mr-3 bg-white text-navy-900 text-xs font-bold px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Call Us
        </span>
      </button>

      {/* WhatsApp Icon - Blinking */}
      <button 
        onClick={handleWhatsApp}
        className="group relative flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 animate-blink border-2 border-white"
        title="Chat on WhatsApp"
      >
        <MessageCircle size={28} fill="white" className="text-[#25D366]" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
        <span className="absolute right-full mr-3 bg-white text-navy-900 text-xs font-bold px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Chat with us
        </span>
      </button>
    </div>
  );
};

export default FloatingContact;