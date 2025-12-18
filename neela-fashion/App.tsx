import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Contact from './pages/Contact';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import ReturnsPolicy from './pages/ReturnsPolicy';
import PrivacyPolicy from './pages/PrivacyPolicy'; // IMPORT NEW PRIVACY PAGE
import Terms from './pages/Terms'; // IMPORT NEW TERMS PAGE
import FloatingContact from './components/FloatingContact';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CMSProvider } from './context/CMSContext';
import { Toaster } from 'react-hot-toast';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const RedirectToHomeOnMount = () => {
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        if (location.pathname !== '/') {
             // navigate('/'); 
        }
    }, []); 
    return null;
}

const App: React.FC = () => {
  return (
    <Router>
      <CMSProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Toaster 
                position="top-center" 
                reverseOrder={false} 
                toastOptions={{
                   style: {
                     borderRadius: '10px',
                     background: '#333',
                     color: '#fff',
                     fontSize: '14px',
                   },
                }}
              />
              <ScrollToTop />
              <RedirectToHomeOnMount />
              <div className="flex flex-col min-h-screen">
                <ConditionalNavbar />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-success" element={<OrderSuccess />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/admin" element={<Admin />} />
                    
                    {/* LEGAL ROUTES */}
                    <Route path="/returns" element={<ReturnsPolicy />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<Terms />} />
                  </Routes>
                </main>
                <ConditionalFooter />
                <ConditionalFloatingContact />
              </div>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </CMSProvider>
    </Router>
  );
};

const ConditionalNavbar = () => {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;
  return <Navbar />;
}

const ConditionalFooter = () => {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;
  return <Footer />;
}

const ConditionalFloatingContact = () => {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;
  return <FloatingContact />;
}

export default App;