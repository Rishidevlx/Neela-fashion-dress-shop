import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, ChevronDown, LogOut, Heart, LayoutDashboard, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCMS } from '../context/CMSContext';
import { Product } from '../types';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const location = useLocation();
  
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { globalSettings, categories, products } = useCMS();
  const navigate = useNavigate();

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Refs for outside click detection
  const searchRef = useRef<HTMLDivElement>(null);       // Desktop Search Ref
  const mobileSearchRef = useRef<HTMLDivElement>(null); // Mobile Search Ref

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowSuggestions(false);
  }, [location]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle outside click to close suggestions (Updated for both Mobile & Desktop)
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          const clickedDesktop = searchRef.current && searchRef.current.contains(event.target as Node);
          const clickedMobile = mobileSearchRef.current && mobileSearchRef.current.contains(event.target as Node);

          if (!clickedDesktop && !clickedMobile) {
              setShowSuggestions(false);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchQuery(query);
      if (query.length > 1) {
          const matches = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
          setSearchSuggestions(matches.slice(0, 5)); // Limit to 5 suggestions
          setShowSuggestions(true);
      } else {
          setSearchSuggestions([]);
          setShowSuggestions(false);
      }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
          navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
          setShowSuggestions(false);
          setMobileMenuOpen(false); // Close mobile menu if open
      }
  };

  const handleSuggestionClick = (id: number) => {
      navigate(`/product/${id}`);
      setSearchQuery('');
      setShowSuggestions(false);
      setMobileMenuOpen(false); // Close mobile menu if open
  };

  return (
    <>
      <nav 
        className={`fixed w-full z-50 transition-all duration-700 ${
          isScrolled ? 'bg-white/95 backdrop-blur-md text-navy-900 shadow-sm py-3' : 'bg-transparent text-navy-900 py-6'
        }`}
      >
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-3 items-center">
            
            {/* Left: Links (Desktop) / Burger (Mobile) */}
            <div className="flex items-center justify-start">
               <button 
                className="md:hidden focus:outline-none mr-4 text-navy-900 hover:text-gold-600 transition-colors"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu size={28} />
              </button>

              <div className="hidden md:flex items-center space-x-8">
                  <Link to="/" className="text-xs font-semibold uppercase tracking-[0.15em] hover:text-gold-600 transition-colors">
                    Home
                  </Link>
                  <Link to="/about" className="text-xs font-semibold uppercase tracking-[0.15em] hover:text-gold-600 transition-colors">
                    About
                  </Link>
                  <Link to="/contact" className="text-xs font-semibold uppercase tracking-[0.15em] hover:text-gold-600 transition-colors">
                    Contact
                  </Link>
              </div>
            </div>

            {/* Center: Luxury Logo (Dynamic) */}
            <div className="flex justify-center relative">
              <Link to="/" className="flex flex-col items-center group">
                 <div 
                    className={`relative transition-all duration-500 flex items-center justify-center`}
                    style={{ width: isScrolled ? '40px' : globalSettings.logoWidth || '80px' }}
                 >
                     {globalSettings.logoUrl ? (
                        <img 
                          src={globalSettings.logoUrl} 
                          alt={globalSettings.siteName} 
                          className="w-full h-auto object-contain drop-shadow-md"
                        />
                     ) : (
                        <span className="font-serif font-bold text-2xl text-navy-900">NF</span>
                     )}
                 </div>
                 <div className={`mt-1 text-center transition-all duration-500 ${isScrolled ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
                     <span className="block text-[0.5rem] uppercase tracking-[0.4em] text-gold-600 font-bold mt-1">{globalSettings.siteName}</span>
                 </div>
              </Link>
            </div>

            {/* Right: Icons & Search */}
            <div className="flex items-center justify-end space-x-6">
               
               {/* Professional Search Bar (Desktop) */}
               <div ref={searchRef} className="hidden md:block relative group">
                   <form onSubmit={handleSearchSubmit} className="relative flex items-center border-b border-navy-900/20 focus-within:border-navy-900 transition-colors w-48 focus-within:w-64 duration-300">
                       <input 
                           type="text" 
                           placeholder="Search..." 
                           value={searchQuery}
                           onChange={handleSearchChange}
                           className="w-full bg-transparent py-1 pr-6 text-sm text-navy-900 outline-none placeholder-gray-400 font-sans"
                       />
                       <button type="submit" className="absolute right-0 top-1 text-navy-900 hover:text-gold-600">
                           <Search size={16} />
                       </button>
                   </form>

                   {/* Desktop Auto-Suggestions Dropdown */}
                   {showSuggestions && searchSuggestions.length > 0 && (
                       <div className="absolute top-full right-0 w-64 bg-white shadow-xl border border-gray-100 rounded-b-sm mt-2 overflow-hidden z-[60] animate-fade-in">
                           <ul>
                               {searchSuggestions.map(product => (
                                   <li key={product.id}>
                                       <button 
                                           onClick={() => handleSuggestionClick(product.id)}
                                           className="flex items-center w-full p-3 hover:bg-gray-50 transition-colors text-left"
                                       >
                                           <img src={product.image} alt="" className="w-8 h-10 object-cover rounded-sm mr-3" />
                                           <div>
                                               <p className="text-xs font-bold text-navy-900 truncate w-40">{product.name}</p>
                                               <p className="text-[10px] text-gray-500">{product.category}</p>
                                           </div>
                                       </button>
                                   </li>
                               ))}
                           </ul>
                       </div>
                   )}
               </div>

               {/* Desktop Mega Menu Trigger Link */}
               <div 
                className="hidden md:block relative h-full"
                onMouseEnter={() => setShopMenuOpen(true)}
                onMouseLeave={() => setShopMenuOpen(false)}
              >
                <button 
                  className="flex items-center hover:text-gold-600 transition-colors text-xs font-semibold uppercase tracking-[0.15em] focus:outline-none py-2"
                  onClick={() => navigate('/shop')}
                >
                  Shop <ChevronDown size={12} className="ml-1 opacity-70" />
                </button>

                {/* Mega Menu Dropdown */}
                <div 
                  className={`absolute right-0 top-full pt-6 w-[80vw] max-w-6xl transition-all duration-500 origin-top-right z-50 ${
                    shopMenuOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
                  }`}
                  style={{ right: '-100px' }}
                >
                   <div className="bg-white shadow-2xl border-t-4 border-gold-500 p-10 grid grid-cols-4 gap-x-8 gap-y-12 relative max-h-[80vh] overflow-y-auto custom-scrollbar">
                      {Object.entries(categories).map(([category, subs]) => (
                        <div key={category} className="space-y-4 group/cat break-inside-avoid">
                          <Link 
                            to={`/shop?category=${encodeURIComponent(category)}`} 
                            className="block font-serif font-bold text-lg text-navy-900 border-b border-gray-100 pb-2 group-hover/cat:text-gold-600 transition-colors"
                          >
                            {category}
                          </Link>
                          <div className="flex flex-col space-y-2">
                            {(subs as string[]).map((sub) => (
                              <Link 
                                key={sub} 
                                to={`/shop?search=${encodeURIComponent(sub)}`}
                                className="text-sm text-gray-500 hover:text-gold-600 transition-colors font-light hover:translate-x-2 duration-300"
                              >
                                {sub}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
              
              <Link to="/wishlist" className="relative hover:text-gold-600 transition-colors hidden sm:block group">
                  <Heart size={20} strokeWidth={1} className="group-hover:scale-110 transition-transform duration-300" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gold-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {wishlistCount}
                    </span>
                  )}
              </Link>

              {isAuthenticated ? (
                <div className="flex items-center space-x-4 relative group">
                   {isAdmin ? (
                     <Link to="/admin" className="hover:text-gold-600 transition-colors text-navy-900 flex items-center gap-1" title="Admin Dashboard">
                        <LayoutDashboard size={20} strokeWidth={1} />
                     </Link>
                   ) : (
                     <Link to="/profile" className="hover:text-gold-600 transition-colors" title="My Profile">
                        <User size={20} strokeWidth={1} />
                     </Link>
                   )}
                   
                   <button onClick={handleLogout} className="hover:text-gold-600 transition-colors" title="Logout">
                     <LogOut size={20} strokeWidth={1} />
                   </button>
                </div>
              ) : (
                <Link to="/login" className="hover:text-gold-600 transition-colors">
                  <User size={20} strokeWidth={1} />
                </Link>
              )}

              <Link to="/cart" className="relative hover:text-gold-600 transition-colors group">
                <ShoppingBag size={20} strokeWidth={1} className="transition-all" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-navy-900 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-lg">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Improved Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Drawer */}
          <div className="relative w-4/5 max-w-sm h-full bg-white shadow-2xl flex flex-col transition-transform duration-300 animate-slide-in-right overflow-hidden">
             {/* Header */}
             <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <span className="font-serif font-bold text-xl text-navy-900">Menu</span>
                <button 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="p-2 rounded-full hover:bg-gray-100 text-navy-900 transition-colors"
                >
                    <X size={24} />
                </button>
             </div>

             {/* Mobile Content Scrollable Area */}
             <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* NEW: Mobile Search Bar */}
                <div ref={mobileSearchRef} className="relative">
                    <form onSubmit={handleSearchSubmit} className="relative">
                        <input 
                            type="text" 
                            placeholder="Search collections..." 
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-4 pr-10 outline-none text-navy-900 focus:border-navy-900 transition-colors font-sans text-sm"
                        />
                        <button type="submit" className="absolute right-3 top-3 text-gray-400">
                            <Search size={18} />
                        </button>
                    </form>
                    
                    {/* Mobile Suggestions */}
                    {showSuggestions && searchSuggestions.length > 0 && (
                       <div className="absolute top-full left-0 w-full bg-white shadow-lg border border-gray-100 z-10 rounded-b-lg mt-1">
                           <ul>
                               {searchSuggestions.map(product => (
                                   <li key={product.id}>
                                       <button 
                                           onClick={() => handleSuggestionClick(product.id)}
                                           className="flex items-center w-full p-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
                                       >
                                           <img src={product.image} alt="" className="w-10 h-12 object-cover rounded-sm mr-3" />
                                           <div>
                                               <p className="text-xs font-bold text-navy-900 truncate w-48">{product.name}</p>
                                               <p className="text-[10px] text-gray-500">{product.category}</p>
                                           </div>
                                       </button>
                                   </li>
                               ))}
                           </ul>
                       </div>
                   )}
                </div>

                <Link to="/" className="block text-2xl font-serif text-navy-900 hover:text-gold-600 transition-colors border-b border-gray-50 pb-2">Home</Link>
                <Link to="/shop" className="block text-2xl font-serif text-navy-900 hover:text-gold-600 transition-colors border-b border-gray-50 pb-2">Collections</Link>
                
                {/* Mobile Categories (Accordion style or list) */}
                <div className="pl-4 border-l-2 border-gold-100 space-y-3">
                   {Object.keys(categories).slice(0, 5).map(cat => (
                      <Link key={cat} to={`/shop?category=${encodeURIComponent(cat)}`} className="block text-sm text-gray-500 hover:text-navy-900 uppercase tracking-widest">{cat}</Link>
                   ))}
                   <Link to="/shop" className="block text-sm text-gold-600 font-bold uppercase tracking-widest mt-2">View All Categories &rarr;</Link>
                </div>

                <Link to="/wishlist" className="block text-2xl font-serif text-navy-900 hover:text-gold-600 transition-colors border-b border-gray-50 pb-2">My Wishlist</Link>
                
                {isAuthenticated ? (
                   <Link to={isAdmin ? "/admin" : "/profile"} className="block text-2xl font-serif text-navy-900 hover:text-gold-600 transition-colors border-b border-gray-50 pb-2">
                     {isAdmin ? 'Dashboard' : 'My Profile'}
                   </Link>
                ) : (
                   <Link to="/login" className="block text-2xl font-serif text-navy-900 hover:text-gold-600 transition-colors border-b border-gray-50 pb-2">Login / Sign Up</Link>
                )}
                
                <Link to="/about" className="block text-2xl font-serif text-navy-900 hover:text-gold-600 transition-colors border-b border-gray-50 pb-2">Our Story</Link>
                <Link to="/contact" className="block text-2xl font-serif text-navy-900 hover:text-gold-600 transition-colors border-b border-gray-50 pb-2">Contact Us</Link>
             </div>

             {/* Footer */}
             <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-widest">{globalSettings.siteName}</p>
             </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;