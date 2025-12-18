import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube, MapPin, Mail, Phone } from 'lucide-react';
import { useCMS } from '../context/CMSContext';

const Footer: React.FC = () => {
  const { contactContent, globalSettings } = useCMS();

  return (
    <footer className="bg-navy-900 text-white pt-16 pb-24 md:pb-8"> 
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Brand */}
          <div>
            <div className="flex items-center mb-6">
              {globalSettings.logoUrl && (
                <img src={globalSettings.logoUrl} alt="Logo" className="h-12 w-auto brightness-0 invert" />
              )}
              <span className="ml-3 font-serif font-bold text-2xl tracking-wider">{globalSettings.siteName}</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Redefining elegance with our exclusive collection of ethnic and modern wear. 
              Quality fabrics, timeless designs, and the perfect fit for every occasion.
            </p>
            <div className="flex space-x-4">
              {globalSettings.instagramUrl && (
                  <a href={globalSettings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><Instagram size={20} /></a>
              )}
              {globalSettings.youtubeUrl && (
                  <a href={globalSettings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><Youtube size={20} /></a>
              )}
            </div>
          </div>

          {/* Quick Links & Legal (CORRECTED ORDER) */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-gold-500">Links & Policies</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors">Home</Link></li>
              <li><Link to="/shop" className="text-gray-400 hover:text-white text-sm transition-colors">Shop Collection</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white text-sm transition-colors">Our Story</Link></li>
              
              {/* NEW ORDER: Terms -> Privacy -> Refund */}
              <li><Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy-policy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link to="/returns" className="text-gray-400 hover:text-gold-400 text-sm transition-colors flex items-center gap-2">Refund & Return Policy <span className="text-[9px] bg-gold-600/20 text-gold-500 px-1 rounded border border-gold-600/30">Info</span></Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-gold-500">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start text-gray-400 text-sm">
                <MapPin size={18} className="mr-3 mt-0.5 shrink-0" />
                <span className="whitespace-pre-wrap">{contactContent.address}</span>
              </li>
              <li className="flex items-center text-gray-400 text-sm">
                <Phone size={18} className="mr-3 shrink-0" />
                <span>{contactContent.phone}</span>
              </li>
              <li className="flex items-center text-gray-400 text-sm">
                <Mail size={18} className="mr-3 shrink-0" />
                <span>{contactContent.email}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Updated Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-center items-center text-center text-gray-500 text-sm gap-4 md:gap-8">
          <p>
            &copy; {new Date().getFullYear()} {globalSettings.siteName}. All rights reserved.
          </p>
          <span className="hidden md:block text-gray-700">|</span>
          <p>
            Developed By{' '}
            <a 
              href="http://skeneticdigital.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-bold text-white hover:text-gold-500 transition-colors"
            >
              Skenetic Digital
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;