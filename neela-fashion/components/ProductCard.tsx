
import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Heart, AlertTriangle, Ban } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const isLiked = isInWishlist(product.id);
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < 5;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product, 1);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiked) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <Link to={`/product/${product.id}`} className="group block relative perspective-1000">
      <div className="relative overflow-hidden bg-gray-100 mb-4 aspect-[3/4] transition-all duration-500 group-hover:shadow-xl rounded-sm">
        {/* Image */}
        <img 
          src={product.image} 
          alt={product.name} 
          className={`w-full h-full object-cover transition-transform duration-[1.5s] ease-in-out group-hover:scale-110 will-change-transform ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

        {/* Wishlist Button - Top Right */}
        <button 
          onClick={handleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 z-20 ${
            isLiked 
              ? 'bg-red-500 text-white scale-110 shadow-lg' 
              : 'bg-white text-navy-900 hover:bg-gold-500 hover:text-white opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0'
          }`}
        >
          <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
        </button>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {product.discountPrice && !isOutOfStock && (
              <div className="bg-white text-navy-900 text-[10px] font-bold px-3 py-1 uppercase tracking-widest shadow-sm">
                Sale
              </div>
            )}
            {isOutOfStock && (
               <div className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest shadow-sm">
                  Out of Stock
               </div>
            )}
        </div>

        {/* Low Stock Warning overlay if not hovered (visible) */}
        {isLowStock && (
           <div className="absolute bottom-16 left-0 w-full text-center z-10 group-hover:opacity-0 transition-opacity">
               <span className="text-[10px] bg-orange-500/90 text-white px-2 py-1 rounded-full font-bold uppercase tracking-wide">
                   Limited Stock: {product.stock} left
               </span>
           </div>
        )}

        {/* High Level Hover Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out flex flex-col gap-2 bg-white/90 backdrop-blur-md border-t border-gold-500/20">
            <button 
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full h-10 uppercase text-[10px] font-bold tracking-widest transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden relative group/btn ${isOutOfStock ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-navy-900 text-white hover:bg-gold-500'}`}
            >
                {isOutOfStock ? (
                   <span className="flex items-center"><Ban size={14} className="mr-1" /> Sold Out</span>
                ) : (
                   <span className="relative z-10 flex items-center"><Plus size={14} className="mr-1" /> Add to Bag</span>
                )}
            </button>
            <div className="flex justify-between items-center px-1">
               <span className="text-navy-900 text-xs font-light tracking-wider uppercase">{product.category}</span>
               <button className="text-navy-900 hover:text-gold-600 transition-colors"><Eye size={18} strokeWidth={1.5} /></button>
            </div>
        </div>
      </div>
      
      {/* Info */}
      <div className="text-center relative overflow-hidden pt-2">
        <h3 className="font-serif text-lg text-navy-900 truncate px-2 relative z-10 transition-colors duration-300 group-hover:text-gold-600">
          {product.name}
        </h3>
        <div className="flex items-center justify-center space-x-2 text-sm mt-1">
          {product.discountPrice ? (
            <>
              <span className="text-gray-400 line-through font-light text-xs">₹{product.price}</span>
              <span className="font-semibold text-navy-900">₹{product.discountPrice}</span>
            </>
          ) : (
            <span className="font-semibold text-navy-900">₹{product.price}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
