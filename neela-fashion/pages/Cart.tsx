import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShieldCheck, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCMS } from '../context/CMSContext';
import ProductCard from '../components/ProductCard';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, taxAmount, finalTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const { globalSettings, products } = useCMS();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState(products.slice(0, 4));
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  useEffect(() => {
      if (products.length > 0) {
          const shuffled = [...products].sort(() => 0.5 - Math.random());
          setRecommendations(shuffled.slice(0, 4));
      }
  }, [products]);

  const handleProceedToCheckout = () => {
      if (isAuthenticated) {
          navigate('/checkout');
      } else {
          setShowLoginPopup(true);
      }
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-sand-50 flex flex-col items-center justify-center pt-20">
        <div className="text-center animate-fade-in-up">
            <h2 className="text-4xl font-serif text-navy-900 mb-6">Your Bag is Empty</h2>
            <p className="text-gray-500 mb-8 font-light">Indulge in our latest luxury collections.</p>
            <Link to="/shop" className="bg-navy-900 border border-navy-900 text-white px-10 py-4 uppercase tracking-widest text-xs font-bold hover:bg-transparent hover:text-navy-900 transition-colors shadow-lg">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 pt-40 pb-20 relative">
      {/* Login Modal */}
      {showLoginPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center relative">
                  <button onClick={() => setShowLoginPopup(false)} className="absolute top-4 right-4 text-gray-400 hover:text-navy-900"><X size={24} /></button>
                  <h3 className="text-2xl font-serif text-navy-900 mb-4">Please Login</h3>
                  <p className="text-gray-500 mb-8">You need to be logged in to proceed with checkout.</p>
                  <div className="flex flex-col gap-3">
                      <button onClick={() => navigate('/login')} className="w-full bg-navy-900 text-white py-3 uppercase font-bold tracking-widest text-xs hover:bg-gold-600 transition-colors">Login</button>
                      <button onClick={() => navigate('/signup')} className="w-full border border-navy-900 text-navy-900 py-3 uppercase font-bold tracking-widest text-xs hover:bg-gray-50 transition-colors">Create Account</button>
                  </div>
              </div>
          </div>
      )}

      <div className="container mx-auto px-6 md:px-12">
        <h1 className="text-4xl font-serif text-navy-900 mb-12 text-center">Shopping Bag</h1>

        <div className="flex flex-col lg:flex-row gap-16 mb-24">
          <div className="lg:w-2/3">
             <div className="space-y-8">
                 {cart.map((item, index) => (
                     <div key={`${item.id}-${item.selectedSize}`} className="flex flex-col sm:flex-row items-center bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-500 group animate-fade-in-up border border-transparent hover:border-gold-100">
                         <div className="w-full sm:w-32 h-40 overflow-hidden flex-shrink-0 relative"><img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" /></div>
                         <div className="flex-1 sm:ml-8 mt-4 sm:mt-0 text-center sm:text-left w-full">
                             <div className="flex justify-between items-start mb-2">
                                 <div>
                                     <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">{item.category}</p>
                                     <Link to={`/product/${item.id}`} className="font-serif text-xl text-navy-900 hover:text-gold-600 transition-colors">{item.name}</Link>
                                     {/* DISPLAY SIZE */}
                                     {item.selectedSize && <span className="block mt-1 text-xs font-bold text-navy-900 bg-gray-100 w-fit px-2 py-0.5 rounded">Size: {item.selectedSize}</span>}
                                 </div>
                                 <button onClick={() => removeFromCart(item.id, item.selectedSize)} className="text-gray-300 hover:text-red-500 transition-colors p-2 transform hover:rotate-12"><Trash2 size={18} /></button>
                             </div>
                             <p className="font-sans text-navy-900 font-medium text-sm mb-4 tracking-wide">Price: ₹{item.discountPrice || item.price}</p>
                             <div className="flex items-center justify-between">
                                 <div className="flex items-center border border-gray-200">
                                     <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-navy-900"><Minus size={12} /></button>
                                     <span className="w-10 text-center text-sm font-medium text-navy-900">{item.quantity}</span>
                                     <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-navy-900"><Plus size={12} /></button>
                                 </div>
                                 <div className="text-right"><p className="font-sans font-bold text-navy-900 text-lg tracking-wide">₹{(item.discountPrice || item.price) * item.quantity}</p></div>
                             </div>
                         </div>
                     </div>
                 ))}
             </div>
             <div className="mt-8"><Link to="/shop" className="inline-flex items-center text-navy-900 text-xs uppercase tracking-widest hover:text-gold-600 font-bold border-b border-navy-900 pb-1 hover:border-gold-600 transition-all"><ArrowLeft size={14} className="mr-2" /> Continue Shopping</Link></div>
          </div>

          <div className="lg:w-1/3">
             <div className="bg-white p-8 shadow-2xl border-t-4 border-navy-900 sticky top-32 transform transition-transform hover:-translate-y-1">
                 <h3 className="font-serif text-2xl text-navy-900 mb-8 flex items-center">Order Summary</h3>
                 <div className="space-y-4 mb-8 text-sm text-gray-600">
                     <div className="flex justify-between"><span className="font-sans">Subtotal</span><span className="font-sans">₹{cartTotal}</span></div>
                     <div className="flex justify-between"><span className="font-sans">Shipping</span><span className="text-gold-600 font-medium font-sans">Calculated at Checkout</span></div>
                     <div className="flex justify-between"><span className="font-sans">Tax ({globalSettings.taxRate}%)</span><span className="font-sans">₹{taxAmount.toFixed(2)}</span></div>
                 </div>
                 <div className="flex justify-between font-serif text-xl text-navy-900 font-bold border-t border-gray-100 pt-6 mb-8"><span>Total</span><span className="font-sans tracking-wide">₹{finalTotal.toFixed(2)}</span></div>
                 <button onClick={handleProceedToCheckout} className="w-full bg-navy-900 border border-navy-900 text-white py-4 uppercase tracking-widest text-xs font-bold hover:bg-transparent hover:text-navy-900 transition-all duration-500 shadow-md hover:shadow-2xl">Proceed to Checkout</button>
                 <div className="mt-6 flex items-center justify-center text-gray-400 text-xs"><ShieldCheck size={14} className="mr-2" /> Secure Checkout</div>
             </div>
          </div>
        </div>

        {/* Recommendations from Real Products */}
        <div className="border-t border-gray-200 pt-16">
            <h2 className="text-3xl font-serif text-navy-900 mb-8 text-center">You Might Also Love</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {recommendations.map((item, i) => (
                    <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                        <ProductCard product={item} />
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;