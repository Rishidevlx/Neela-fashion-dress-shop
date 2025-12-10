import React from 'react';
import { useCMS } from '../context/CMSContext';
import { Award, Heart, Users, PenTool } from 'lucide-react';

const About: React.FC = () => {
  const { aboutContent } = useCMS();

  return (
    <div className="min-h-screen bg-white">
      {/* Parallax Hero */}
      <div className="relative h-[70vh] overflow-hidden">
         <div 
            className="absolute inset-0 bg-cover bg-center bg-fixed transform scale-110 transition-transform duration-[10s] hover:scale-100"
            style={{ backgroundImage: `url(${aboutContent.heroImage})` }}
         ></div>
         <div className="absolute inset-0 bg-navy-900/60 mix-blend-multiply"></div>
         <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
             <span className="text-gold-400 uppercase tracking-[0.5em] text-xs font-bold mb-4 animate-fade-in-up">Est. 2024</span>
             <h1 className="text-5xl md:text-8xl font-serif text-white mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>The Legacy</h1>
             <div className="w-24 h-1 bg-gold-500 animate-fade-in-up" style={{ animationDelay: '0.4s' }}></div>
         </div>
      </div>

      {/* Story Section */}
      <div className="container mx-auto px-6 py-32">
        <div className="flex flex-col md:flex-row gap-20 items-center">
            <div className="md:w-1/2 relative">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-sand-100 rounded-full opacity-50 z-0"></div>
                <img 
                  src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000" 
                  className="w-full shadow-2xl rounded-sm relative z-10 grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out" 
                  alt="Craftsmanship" 
                />
                <div className="absolute -bottom-10 -right-10 w-full h-full border-2 border-gold-500/30 z-0"></div>
            </div>
            <div className="md:w-1/2">
                <h2 className="text-4xl md:text-5xl font-serif text-navy-900 mb-8 leading-tight">{aboutContent.title}</h2>
                <p className="text-gray-500 leading-loose font-light text-lg whitespace-pre-line text-justify border-l-4 border-gold-500 pl-8">
                    {aboutContent.description}
                </p>
            </div>
        </div>
      </div>

      {/* Values Parallax */}
      <div className="bg-navy-900 text-white py-32 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>
          <div className="container mx-auto px-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                  <div className="group p-8 border border-white/10 hover:border-gold-500 transition-colors duration-500 rounded-sm">
                      <div className="w-16 h-16 mx-auto bg-navy-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 text-gold-500">
                          <Award size={32} strokeWidth={1} />
                      </div>
                      <h3 className="text-2xl font-serif mb-4">Authenticity</h3>
                      <p className="text-gray-400 font-light leading-relaxed">Genuine fabrics sourced directly from master weavers across India.</p>
                  </div>
                  <div className="group p-8 border border-white/10 hover:border-gold-500 transition-colors duration-500 rounded-sm">
                      <div className="w-16 h-16 mx-auto bg-navy-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 text-gold-500">
                          <Heart size={32} strokeWidth={1} />
                      </div>
                      <h3 className="text-2xl font-serif mb-4">Passion</h3>
                      <p className="text-gray-400 font-light leading-relaxed">Every thread tells a story of love, dedication, and timeless art.</p>
                  </div>
                  <div className="group p-8 border border-white/10 hover:border-gold-500 transition-colors duration-500 rounded-sm">
                      <div className="w-16 h-16 mx-auto bg-navy-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 text-gold-500">
                          <Users size={32} strokeWidth={1} />
                      </div>
                      <h3 className="text-2xl font-serif mb-4">Community</h3>
                      <p className="text-gray-400 font-light leading-relaxed">Empowering over 500 artisan families with fair trade practices.</p>
                  </div>
              </div>
          </div>
      </div>
      
      {/* Signature Section */}
      <div className="py-24 bg-sand-50 text-center">
          <PenTool size={40} className="mx-auto text-navy-900 mb-6 opacity-20" />
          <h3 className="text-3xl font-serif text-navy-900 italic mb-2">"Luxury is in each detail."</h3>
          <p className="text-xs font-bold uppercase tracking-widest text-gold-600">Neela Fashion House</p>
      </div>
    </div>
  );
};

export default About;