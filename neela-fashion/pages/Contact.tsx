import React, { useState } from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import toast from 'react-hot-toast';

// Dynamic API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Contact: React.FC = () => {
  const { contactContent } = useCMS();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          const res = await fetch(`${API_URL}/api/contact/send`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData)
          });
          const data = await res.json();
          if(data.success) {
              toast.success("Message Sent Successfully!");
              setFormData({ name: '', email: '', subject: '', message: '' });
          } else {
              toast.error("Failed to send message.");
          }
      } catch (error) {
          toast.error("Server Error");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-white pt-40 flex flex-col">
      <div className="container mx-auto px-6 pb-24 flex-grow">
        <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-in-up">
          <span className="text-gold-600 uppercase tracking-[0.2em] text-xs font-bold mb-3 block">Customer Service</span>
          <h1 className="text-4xl md:text-5xl font-serif text-navy-900 mb-6">We're Here to Assist</h1>
          <p className="text-gray-500 font-light">Whether you need styling advice or help with an order, our concierge team is at your service.</p>
        </div>

        <div className="flex flex-col md:flex-row shadow-2xl bg-white animate-fade-in" style={{ animationDelay: '0.2s' }}>
           {/* Left: Minimal Info */}
           <div className="md:w-5/12 bg-navy-900 text-white p-12 md:p-16 flex flex-col justify-between relative overflow-hidden">
               <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${contactContent.heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
               <div className="relative z-10">
                   <h3 className="text-2xl font-serif mb-12">Contact Information</h3>
                   
                   <div className="space-y-10">
                       <div className="flex group">
                           <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-6 group-hover:bg-gold-500 transition-colors duration-300">
                                <MapPin className="text-white w-5 h-5" />
                           </div>
                           <div>
                               <p className="text-sm text-gold-500 uppercase tracking-widest mb-2">Headquarters</p>
                               <p className="font-light text-gray-300 leading-relaxed whitespace-pre-line">{contactContent.address}</p>
                           </div>
                       </div>
                       <div className="flex group">
                           <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-6 group-hover:bg-gold-500 transition-colors duration-300">
                                <Phone className="text-white w-5 h-5" />
                           </div>
                           <div>
                               <p className="text-sm text-gold-500 uppercase tracking-widest mb-2">Phone</p>
                               <p className="font-light text-gray-300">{contactContent.phone}</p>
                           </div>
                       </div>
                       <div className="flex group">
                           <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-6 group-hover:bg-gold-500 transition-colors duration-300">
                                <Mail className="text-white w-5 h-5" />
                           </div>
                           <div>
                               <p className="text-sm text-gold-500 uppercase tracking-widest mb-2">Email</p>
                               <p className="font-light text-gray-300">{contactContent.email}</p>
                           </div>
                       </div>
                   </div>
               </div>
               
               <div className="relative z-10 mt-12">
                   <p className="font-serif italic text-gray-400">"Luxury must be comfortable, otherwise it is not luxury."</p>
               </div>
           </div>

           {/* Right: Elegant Form */}
           <div className="md:w-7/12 p-12 md:p-16 bg-white">
               <form onSubmit={handleSubmit} className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="group">
                           <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Name</label>
                           <input required type="text" className="w-full border-b border-gray-200 py-2 outline-none focus:border-navy-900 transition-all bg-white text-navy-900" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                       </div>
                       <div className="group">
                           <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Email</label>
                           <input required type="email" className="w-full border-b border-gray-200 py-2 outline-none focus:border-navy-900 transition-all bg-white text-navy-900" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                       </div>
                   </div>
                   <div className="group">
                       <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Subject</label>
                       <input required type="text" className="w-full border-b border-gray-200 py-2 outline-none focus:border-navy-900 transition-all bg-white text-navy-900" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
                   </div>
                   <div className="group">
                       <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Message</label>
                       <textarea required rows={4} className="w-full border-b border-gray-200 py-2 outline-none focus:border-navy-900 transition-all bg-white resize-none text-navy-900" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
                   </div>

                   <button disabled={loading} className="bg-navy-900 border border-navy-900 text-white px-10 py-4 uppercase tracking-widest text-xs font-bold hover:bg-transparent hover:text-navy-900 transition-all duration-300 disabled:opacity-50">
                       {loading ? 'Sending...' : 'Send Inquiry'}
                   </button>
               </form>
           </div>
        </div>
      </div>

      {/* Full Width Map */}
      <div className="w-full h-96 relative grayscale hover:grayscale-0 transition-all duration-700">
        <iframe 
            src={contactContent.mapUrl} 
            width="100%" 
            height="100%" 
            style={{border:0}} 
            allowFullScreen={true} 
            loading="lazy"
            title="Map"
        ></iframe>
      </div>
    </div>
  );
};

export default Contact;