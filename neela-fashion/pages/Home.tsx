
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, ShieldCheck, Clock, MoveRight, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useCMS } from '../context/CMSContext';
import { Product } from '../types';

// Marquee Component
const LuxuryMarquee = ({ texts }: { texts: string[] }) => {
    const items = [...texts, "•"];
    
    return (
        <div className="bg-navy-900 text-gold-300 py-4 overflow-hidden border-y border-gold-800/30 relative z-20 shadow-2xl">
            <div className="flex animate-marquee whitespace-nowrap">
                {[...items, ...items, ...items, ...items].map((text, index) => (
                    <span key={index} className="mx-10 text-xs uppercase tracking-[0.4em] font-bold">
                        {text}
                    </span>
                ))}
            </div>
        </div>
    );
};

const TestimonialSlider = () => {
  const { homeContent } = useCMS();
  const { testimonials } = homeContent;
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
      const handleResize = () => {
          if (window.innerWidth < 768) setVisibleCount(1);
          else setVisibleCount(3);
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = () => {
    setStartIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setStartIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Calculate visible items with wrapping
  const visibleTestimonials = [];
  if (testimonials.length > 0) {
      for (let i = 0; i < visibleCount; i++) {
          visibleTestimonials.push(testimonials[(startIndex + i) % testimonials.length]);
      }
  }

  return (
    <div className="relative w-full">
      {testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {visibleTestimonials.map((t, idx) => (
                <div key={`${t.id}-${idx}`} className="bg-white p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center h-full">
                    <div className="flex justify-center mb-4 text-gold-500">
                        {[...Array(5)].map((_, k) => <Star key={k} size={16} fill="currentColor" className="mx-0.5" />)}
                    </div>
                    <div className="mb-6 flex-grow">
                        <p className="font-serif text-navy-900 italic leading-relaxed">
                            "{t.text}"
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gold-100 mb-3 flex items-center justify-center text-xl font-serif text-gold-600 font-bold">
                        {t.author.charAt(0)}
                    </div>
                    <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">{t.author}</h4>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase">{t.role}</p>
                </div>
            ))}
          </div>
      ) : (
          <div className="text-center text-gray-400">No testimonials available.</div>
      )}

      {/* Custom Navigation Buttons */}
      {testimonials.length > 3 && (
        <div className="flex justify-center mt-12 gap-4">
            <button 
                onClick={prevSlide}
                className="w-12 h-12 border border-gray-300 rounded-full flex items-center justify-center hover:bg-navy-900 hover:text-white hover:border-navy-900 transition-all duration-300"
            >
                <ChevronLeft size={20} />
            </button>
            <button 
                onClick={nextSlide}
                className="w-12 h-12 border border-gray-300 rounded-full flex items-center justify-center hover:bg-navy-900 hover:text-white hover:border-navy-900 transition-all duration-300"
            >
                <ChevronRight size={20} />
            </button>
        </div>
      )}
    </div>
  );
};

const Home: React.FC = () => {
  const { products, homeContent } = useCMS();
  const latestProducts = products.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen bg-sand-50 overflow-x-hidden">
      
      {/* Split Hero Section */}
      <section className="relative min-h-screen flex flex-col md:flex-row pt-20 md:pt-0">
         {/* Left Content */}
         <div className="md:w-1/2 bg-sand-50 flex flex-col justify-center px-8 md:px-20 py-20 relative order-2 md:order-1 z-10">
             <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                 <span className="text-gold-600 uppercase tracking-[0.4em] text-xs font-bold mb-6 block relative pl-12">
                    <span className="absolute left-0 top-1/2 h-px w-8 bg-gold-600"></span>
                    New Collection
                 </span>
                 <h1 className="text-6xl md:text-8xl font-serif text-navy-900 leading-[1] mb-8 whitespace-pre-line">
                     {homeContent.heroTitle}
                 </h1>
                 <p className="text-gray-500 text-lg md:text-xl font-light leading-relaxed max-w-md mb-12 border-l-2 border-gold-400 pl-6">
                     {homeContent.heroSubtitle}
                 </p>
                 
                 <div className="flex gap-6">
                     <Link 
                        to="/shop" 
                        className="relative overflow-hidden group bg-navy-900 text-white border border-navy-900 px-10 py-4 uppercase tracking-widest text-sm font-bold transition-all duration-500 hover:shadow-xl hover:bg-transparent hover:text-navy-900"
                    >
                        <span className="relative z-10 transition-colors">Shop Now</span>
                     </Link>
                     <Link 
                        to="/about" 
                        className="relative overflow-hidden group border border-navy-900 text-navy-900 px-10 py-4 uppercase tracking-widest text-sm font-bold hover:bg-navy-900 hover:text-white transition-all duration-300"
                     >
                        <span className="relative z-10 transition-colors">Discover</span>
                     </Link>
                 </div>
             </div>
         </div>
         
         {/* Right Image */}
         <div className="md:w-1/2 relative h-[50vh] md:h-auto order-1 md:order-2 overflow-hidden group clip-path-slant">
             <img 
                src={homeContent.heroImage}
                alt="Luxury Saree" 
                className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
             />
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-sand-50/40 mix-blend-multiply"></div>
         </div>
      </section>

      <LuxuryMarquee texts={homeContent.marqueeText} />

      {/* Curated Trends - Bento Style */}
      <section className="py-24 container mx-auto px-6">
          <div className="text-center mb-16">
              <h2 className="text-5xl font-serif text-navy-900 mb-4">{homeContent.sectionTitleTrends || "Curated Trends"}</h2>
              <div className="w-24 h-0.5 bg-gold-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-auto md:h-[800px]">
              {/* Large Feature */}
              <div className="md:col-span-2 md:row-span-2 relative overflow-hidden group rounded-sm cursor-pointer">
                  <img src={homeContent.trendImages.large} alt="Model" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                  <div className="absolute bottom-12 left-12 text-white transform translate-y-8 group-hover:translate-y-0 transition-transform duration-700">
                      <h3 className="text-4xl font-serif italic mb-4">The Royal Edit</h3>
                      <Link to="/shop?category=Saree" className="inline-flex items-center text-gold-400 uppercase tracking-widest text-xs font-bold hover:text-white transition-colors border-b border-gold-400 pb-1">
                          Explore Collection <MoveRight className="ml-2 w-4 h-4" />
                      </Link>
                  </div>
              </div>

              {/* Top Right */}
              <div className="md:col-span-2 bg-white p-10 flex flex-col justify-center items-start hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-gold-50 rounded-full filter blur-3xl opacity-50 -mr-10 -mt-10"></div>
                   <h3 className="text-3xl font-serif text-navy-900 mb-4 relative z-10">Everyday Elegance</h3>
                   <p className="text-gray-500 mb-8 text-sm leading-relaxed max-w-xs relative z-10">Comfortable blends perfect for the modern workplace.</p>
                   <div className="flex gap-4 w-full overflow-hidden relative z-10">
                      <img src={homeContent.trendImages.topRight} className="w-24 h-32 object-cover rounded-sm shadow-lg transform group-hover:-translate-y-2 transition-transform duration-500" alt="thumb" />
                      <img src="https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=200&q=80" className="w-24 h-32 object-cover rounded-sm shadow-lg transform group-hover:-translate-y-4 transition-transform duration-500 delay-100" alt="thumb" />
                   </div>
              </div>

              {/* Bottom Right */}
              <div className="md:col-span-2 relative overflow-hidden group rounded-sm">
                   <img src={homeContent.trendImages.bottomRight} alt="Silk" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
                   <div className="absolute inset-0 bg-navy-900/30 group-hover:bg-navy-900/10 transition-colors duration-500"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                       <div className="border-2 border-white/30 backdrop-blur-sm px-8 py-6 text-center transform transition-transform duration-500 group-hover:scale-110">
                           <h3 className="text-white font-serif text-3xl uppercase tracking-widest">Silk & Stone</h3>
                           <p className="text-gold-300 text-xs mt-2 font-bold tracking-[0.2em]">LIMITED EDITION</p>
                       </div>
                   </div>
              </div>
          </div>
      </section>

      {/* Featured Stripe */}
      <section className="py-24 bg-white relative">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-900/20 to-transparent"></div>
          <div className="container mx-auto px-6">
             <div className="flex justify-between items-end mb-12">
                 <h2 className="text-4xl font-serif text-navy-900">{homeContent.sectionTitleFeatured || "Trending Now"}</h2>
                 <Link to="/shop" className="text-sm uppercase tracking-widest text-gold-600 hover:text-navy-900 transition-colors flex items-center font-bold">
                    View All <ArrowRight size={16} className="ml-2" />
                 </Link>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                 {latestProducts.map((product, idx) => (
                     <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.15}s` }}>
                        <ProductCard product={product} />
                     </div>
                 ))}
             </div>
          </div>
      </section>

      {/* Luxury Video/Parallax Banner */}
      <section className="relative h-[70vh] bg-fixed bg-center bg-cover flex items-center justify-center overflow-hidden" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1550614000-4b9519e021b9?q=80&w=2000")' }}>
          <div className="absolute inset-0 bg-navy-900/50 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-navy-900 opacity-80"></div>
          
          <div className="relative z-10 text-center text-white max-w-5xl px-4">
              <div className="mb-6 animate-float">
                <Quote size={40} className="mx-auto text-gold-500 opacity-80" />
              </div>
              <h2 className="text-5xl md:text-7xl font-serif mb-8 leading-tight">"Fashion is the armor to survive the reality of everyday life."</h2>
              <p className="text-gold-400 uppercase tracking-[0.3em] text-sm font-bold">— Bill Cunningham</p>
          </div>
      </section>

      {/* Testimonials Section (Carousel) */}
      <section className="py-24 bg-sand-50">
        <div className="container mx-auto px-6">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-serif text-navy-900">{homeContent.sectionTitleTestimonials || "Voices of Elegance"}</h2>
              <div className="w-24 h-0.5 bg-gold-500 mx-auto mt-4"></div>
            </div>
            <TestimonialSlider />
        </div>
      </section>

      {/* Services */}
      <section className="py-20 border-t border-gray-200 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-12 md:gap-32 text-center">
            <div className="group cursor-pointer">
               <div className="w-20 h-20 mx-auto rounded-full bg-sand-50 border border-gray-100 flex items-center justify-center mb-6 group-hover:bg-gold-500 group-hover:text-white group-hover:scale-110 transition-all duration-500">
                  <Truck size={28} strokeWidth={1} />
               </div>
               <h4 className="uppercase tracking-widest text-xs font-bold text-navy-900 mb-2">Global Shipping</h4>
               <p className="text-xs text-gray-500">Free over ₹5000</p>
            </div>
            <div className="group cursor-pointer">
               <div className="w-20 h-20 mx-auto rounded-full bg-sand-50 border border-gray-100 flex items-center justify-center mb-6 group-hover:bg-gold-500 group-hover:text-white group-hover:scale-110 transition-all duration-500">
                  <ShieldCheck size={28} strokeWidth={1} />
               </div>
               <h4 className="uppercase tracking-widest text-xs font-bold text-navy-900 mb-2">Secure Checkout</h4>
               <p className="text-xs text-gray-500">256-bit Encryption</p>
            </div>
            <div className="group cursor-pointer">
               <div className="w-20 h-20 mx-auto rounded-full bg-sand-50 border border-gray-100 flex items-center justify-center mb-6 group-hover:bg-gold-500 group-hover:text-white group-hover:scale-110 transition-all duration-500">
                  <Clock size={28} strokeWidth={1} />
               </div>
               <h4 className="uppercase tracking-widest text-xs font-bold text-navy-900 mb-2">24/7 Support</h4>
               <p className="text-xs text-gray-500">Always here for you</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
