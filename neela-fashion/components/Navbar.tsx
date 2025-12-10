
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, ChevronDown, LogOut, Heart, LayoutDashboard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCMS } from '../context/CMSContext';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const location = useLocation();
  
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { globalSettings, categories } = useCMS();
  const navigate = useNavigate();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
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
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
               {/* Use dynamic width from settings */}
               <div 
                  className={`relative transition-all duration-500 flex items-center justify-center`}
                  style={{ width: isScrolled ? '40px' : globalSettings.logoWidth || '80px' }}
               >
                   <img 
                    src={globalSettings.logoUrl} 
                    alt={globalSettings.siteName} 
                    className="w-full h-auto object-contain drop-shadow-md"
                   />
               </div>
               <div className={`mt-1 text-center transition-all duration-500 ${isScrolled ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
                   <span className="block text-[0.5rem] uppercase tracking-[0.4em] text-gold-600 font-bold mt-1">{globalSettings.siteName}</span>
               </div>
            </Link>
          </div>

          {/* Right: Icons */}
          <div className="flex items-center justify-end space-x-6">
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
                          {subs.map(sub => (
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

      {/* Mobile Menu */}
      <div className={`md:hidden fixed inset-0 bg-white z-[60] transition-transform duration-500 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-end p-6">
            <button onClick={() => setMobileMenuOpen(false)} className="text-navy-900 hover:text-gold-600 transition-colors">
                <X size={32} />
            </button>
        </div>
        <div className="flex flex-col items-center space-y-8 pt-10 text-navy-900 h-full overflow-y-auto pb-20">
            <Link to="/" className="text-3xl font-serif hover:text-gold-600 transition-colors">Home</Link>
            <Link to="/shop" className="text-3xl font-serif hover:text-gold-600 transition-colors">Collections</Link>
            <Link to="/wishlist" className="text-3xl font-serif hover:text-gold-600 transition-colors">Wishlist</Link>
            {isAuthenticated && (
               <Link to={isAdmin ? "/admin" : "/profile"} className="text-3xl font-serif hover:text-gold-600 transition-colors">
                 {isAdmin ? 'Dashboard' : 'My Profile'}
               </Link>
            )}
            <Link to="/about" className="text-3xl font-serif hover:text-gold-600 transition-colors">About</Link>
            <Link to="/contact" className="text-3xl font-serif hover:text-gold-600 transition-colors">Contact</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
