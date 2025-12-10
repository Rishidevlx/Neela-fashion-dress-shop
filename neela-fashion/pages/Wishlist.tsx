import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';

const Wishlist: React.FC = () => {
  const { wishlist } = useWishlist();

  return (
    <div className="min-h-screen bg-sand-50 pt-40 pb-20">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-16 animate-fade-in-up">
             <Heart size={40} className="mx-auto text-gold-600 mb-4" />
             <h1 className="text-5xl font-serif text-navy-900 mb-4">My Wishlist</h1>
             <div className="w-20 h-0.5 bg-gold-600 mx-auto"></div>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <p className="text-gray-500 text-lg font-light mb-8">Your wishlist awaits your inspiration.</p>
            <Link 
              to="/shop" 
              className="inline-flex items-center bg-navy-900 text-white px-10 py-4 uppercase tracking-widest text-xs font-bold hover:bg-gold-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Explore Collection <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {wishlist.map((product, index) => (
              <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;