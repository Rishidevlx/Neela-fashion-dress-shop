import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Star, Heart, AlertCircle, Camera, Upload, Send, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { Product, Review, AVAILABLE_SIZES } from '../types';
import ProductCard from '../components/ProductCard';
import { useCMS } from '../context/CMSContext';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { products, reviews, addReview } = useCMS();
  const { user, isAuthenticated } = useAuth();
  
  // Product State
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [related, setRelated] = useState<Product[]>([]);
  const [mainImage, setMainImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  
  // Dynamic Price State (Based on Size)
  const [currentPrice, setCurrentPrice] = useState<number>(0);

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImage, setReviewImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Product Data
  useEffect(() => {
    if (id) {
      const found = products.find(p => p.id === parseInt(id));
      setProduct(found);
      setQuantity(1);
      setSelectedSize(''); 
      if (found) {
        setMainImage(found.image);
        // Default to discount price if available, else normal price
        setCurrentPrice(found.discountPrice || found.price);
        
        // Find Related Products
        const rel = products.filter(p => p.category === found.category && p.id !== found.id).slice(0, 4);
        setRelated(rel);
      }
      window.scrollTo(0, 0);
    }
  }, [id, products]);

  // Handle Dynamic Price Change Based on Selected Size
  useEffect(() => {
      if (product) {
          if (selectedSize && product.sizePrices && product.sizePrices[selectedSize]) {
              // Use specific size price if set
              setCurrentPrice(product.sizePrices[selectedSize]);
          } else {
              // Fallback to base price
              setCurrentPrice(product.discountPrice || product.price);
          }
      }
  }, [selectedSize, product]);

  if (!product) {
    return (
        <div className="min-h-screen bg-white pt-40 pb-20 flex flex-col items-center justify-center">
            <h2 className="text-2xl font-serif text-navy-900 mb-4">Product Not Found</h2>
            <Link to="/shop" className="text-gold-600 hover:text-navy-900 underline">Return to Shop</Link>
        </div>
    );
  }

  // Derived State
  const isLiked = isInWishlist(product.id);
  const productReviews = reviews.filter(r => r.productId === product.id);

  // Stock Logic
  const currentSizeStock = selectedSize && product.sizeStock ? (product.sizeStock[selectedSize] || 0) : 0;
  const isSizeSelected = !!selectedSize;
  
  // If size is selected, check specific stock. If not, check total stock just for visual.
  const isOutOfStock = isSizeSelected ? currentSizeStock === 0 : product.stock === 0;
  const isLowStock = isSizeSelected && currentSizeStock > 0 && currentSizeStock < 10;

  // Handlers
  const handleAddToCart = () => {
      if (!selectedSize) {
          alert("Please select a size to proceed.");
          return;
      }
      if (isOutOfStock) return;
      
      // IMPORTANT: Override product price with the resolved 'currentPrice' for the cart
      const productWithSizePrice = { 
          ...product, 
          price: currentPrice, 
          discountPrice: undefined // Clear discount so Cart uses 'price' directly
      };
      
      addToCart(productWithSizePrice, quantity, mainImage, selectedSize);
  };

  const handleWishlist = () => {
    if(product) {
      if (isLiked) removeFromWishlist(product.id);
      else addToWishlist(product);
    }
  };

  const handleReviewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setReviewImage(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
      e.preventDefault();
      if (!isAuthenticated || !user) {
          alert("Please login to submit a review.");
          return;
      }
      if (!reviewComment.trim()) return;

      const newReview: Review = {
          id: `rev-${Date.now()}`,
          productId: product.id,
          productName: product.name,
          userId: user.id,
          userName: user.name,
          rating: reviewRating,
          comment: reviewComment,
          date: new Date().toISOString().split('T')[0],
          image: reviewImage
      };

      addReview(newReview);
      setReviewComment('');
      setReviewRating(5);
      setReviewImage('');
      alert("Review submitted successfully!");
  };

  const galleryImages = product.images && product.images.length > 0 
      ? [product.image, ...product.images.filter(img => img !== product.image)] 
      : [product.image];

  return (
    <div className="pt-40 pb-16 bg-white min-h-screen">
      <div className="container mx-auto px-4 md:px-12">
        <div className="flex flex-col md:flex-row gap-16 mb-24">
          
          {/* Left: Image Gallery */}
          <div className="md:w-1/2">
            <div className="bg-gray-100 overflow-hidden aspect-[3/4] relative group shadow-lg mb-4 rounded-sm">
              <img 
                src={mainImage} 
                alt={product.name} 
                className={`w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110 ${isOutOfStock ? 'grayscale opacity-80' : ''}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/20 to-transparent pointer-events-none"></div>
              
              {product.discountPrice && !isOutOfStock && (
                 <div className="absolute top-6 left-0 bg-navy-900 text-white px-4 py-2 uppercase tracking-wide text-xs font-bold shadow-md">
                    Sale
                 </div>
              )}
              
              {isOutOfStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="border-2 border-white text-white px-8 py-4 text-2xl font-bold uppercase tracking-widest transform -rotate-12">
                          Out of Stock
                      </span>
                  </div>
              )}
            </div>
            
            {/* Thumbnails */}
            {galleryImages.length > 1 && (
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Detailed Views</p>
                    <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                        {galleryImages.map((img, i) => (
                            <div 
                                key={i} 
                                onClick={() => setMainImage(img)}
                                className={`w-20 h-24 flex-shrink-0 cursor-pointer border-2 transition-all duration-300 rounded-sm overflow-hidden ${mainImage === img ? 'border-navy-900 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            >
                                <img src={img} className="w-full h-full object-cover" alt={`View ${i+1}`} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="md:w-1/2 pt-8 animate-fade-in-up">
            <div className="mb-4 text-gray-500 text-xs uppercase tracking-[0.2em] font-bold flex items-center gap-2">
              <Link to="/shop" className="hover:text-gold-600 transition-colors">Shop</Link> 
              <span>/</span>
              <span className="text-navy-900">{product.category}</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-serif text-navy-900 mb-6 leading-tight">
                {product.name}
            </h1>
            
            <div className="flex items-center space-x-6 mb-8 border-b border-gray-100 pb-8">
              <div className="flex flex-col">
                  <div className="text-3xl font-bold text-navy-900 flex items-center">
                    <span>₹{currentPrice}</span>
                    {product.discountPrice && !selectedSize && (
                        <span className="text-lg text-gray-400 line-through font-light ml-3">₹{product.price}</span>
                    )}
                  </div>
                  {/* Dynamic Price Label */}
                  {selectedSize && product.sizePrices && product.sizePrices[selectedSize] && (
                     <span className="text-[10px] font-bold uppercase tracking-wide text-green-600 mt-1 bg-green-50 px-2 py-0.5 rounded w-fit">
                         Price for Size {selectedSize}
                     </span>
                  )}
              </div>

              <div className="h-8 w-px bg-gray-200"></div>

              <div className="flex items-center text-gold-500 cursor-pointer hover:text-gold-600" onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}>
                <Star fill="currentColor" size={18} />
                <span className="ml-2 text-gray-600 text-sm font-medium underline decoration-gray-300 underline-offset-4">
                    {productReviews.length} Reviews
                </span>
              </div>
            </div>

            <p className="text-gray-600 mb-10 leading-loose font-light text-lg max-w-lg">
              {product.description}
            </p>

            <div className="mb-10 space-y-8">
              {/* SIZE SELECTOR */}
              <div>
                  <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-navy-900 text-sm uppercase tracking-widest">Select Size</h4>
                      <button className="text-[10px] uppercase font-bold text-gold-600 hover:text-navy-900 underline">Size Guide</button>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                      {AVAILABLE_SIZES.map(size => {
                          const stockForSize = product.sizeStock ? (product.sizeStock[size] || 0) : 0;
                          const isSizeDisabled = stockForSize === 0;
                          
                          return (
                              <button
                                  key={size}
                                  onClick={() => setSelectedSize(size)}
                                  disabled={isSizeDisabled}
                                  className={`w-12 h-12 flex items-center justify-center border text-sm font-bold transition-all duration-200 rounded-sm
                                      ${selectedSize === size ? 'bg-navy-900 text-white border-navy-900 ring-2 ring-offset-2 ring-navy-900' : 'bg-white text-gray-600 border-gray-300 hover:border-navy-900'}
                                      ${isSizeDisabled ? 'opacity-40 cursor-not-allowed bg-gray-50 text-gray-400 decoration-slice line-through decoration-red-500' : ''}
                                  `}
                              >
                                  {size}
                              </button>
                          );
                      })}
                  </div>
              </div>

              {/* Product Attributes & Availability */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm text-gray-600 bg-gray-50 p-6 rounded-lg border border-gray-100">
                 <div className="flex flex-col">
                     <span className="font-bold text-navy-900 text-[10px] uppercase tracking-wider mb-1">Material</span>
                     <span>{product.material}</span>
                 </div>
                 <div className="flex flex-col">
                     <span className="font-bold text-navy-900 text-[10px] uppercase tracking-wider mb-1">Sub-Category</span>
                     <span>{product.subCategory || 'General'}</span>
                 </div>
                 <div className="col-span-2 border-t border-gray-200 pt-4 mt-2">
                     <div className="flex items-center">
                         <span className="font-bold text-navy-900 text-[10px] uppercase tracking-wider mr-2">Availability:</span> 
                         {!selectedSize ? (
                             <span className="text-gray-500 italic">Select a size to check stock</span>
                         ) : isOutOfStock ? (
                             <span className="text-red-600 font-bold flex items-center"><AlertCircle size={14} className="mr-1"/> Out of Stock</span>
                         ) : isLowStock ? (
                             <span className="text-orange-500 font-bold flex items-center"><AlertCircle size={14} className="mr-1"/> Low Stock ({currentSizeStock} left)</span>
                         ) : (
                             <span className="text-green-600 font-bold flex items-center">In Stock ({currentSizeStock} units)</span>
                         )}
                     </div>
                 </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-6 mb-10">
              <div className="flex gap-6 h-14">
                  {/* Quantity Counter */}
                  <div className={`flex items-center border border-gray-300 w-32 transition-colors ${isOutOfStock || !selectedSize ? 'opacity-50 pointer-events-none' : 'hover:border-navy-900'}`}>
                    <button 
                      className="w-10 h-full flex items-center justify-center hover:bg-gray-100 text-navy-900 transition-colors"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    >
                      <Minus size={16} />
                    </button>
                    <div className="flex-1 text-center font-bold text-navy-900 text-lg">{quantity}</div>
                    <button 
                      className="w-10 h-full flex items-center justify-center hover:bg-gray-100 text-navy-900 transition-colors"
                      onClick={() => setQuantity(q => Math.min(q + 1, currentSizeStock))}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Wishlist Button */}
                  <button 
                    onClick={handleWishlist}
                    className={`w-14 h-full flex items-center justify-center border transition-all duration-300 ${isLiked ? 'border-red-500 text-red-500 bg-red-50' : 'border-gray-300 text-gray-400 hover:border-gold-600 hover:text-gold-600'}`}
                    title={isLiked ? "Remove from Wishlist" : "Add to Wishlist"}
                  >
                     <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
                  </button>
              </div>

              {isLowStock && (
                  <div className="flex items-center text-orange-600 text-xs font-bold uppercase tracking-wide animate-pulse">
                      <AlertCircle size={14} className="mr-2" />
                      Hurry! Selling fast.
                  </div>
              )}

              {/* Add to Cart Button */}
              <button 
                onClick={handleAddToCart}
                disabled={isOutOfStock || !selectedSize}
                className={`w-full md:max-w-md text-white h-14 uppercase tracking-widest font-bold text-sm transition-all duration-300 flex items-center justify-center gap-3 shadow-xl rounded-sm
                    ${isOutOfStock || !selectedSize 
                        ? 'bg-gray-300 cursor-not-allowed text-gray-500 shadow-none' 
                        : 'bg-navy-900 hover:bg-gold-600 hover:shadow-2xl hover:-translate-y-1'
                    }
                `}
              >
                <ShoppingBag size={20} /> 
                {isOutOfStock ? 'Sold Out' : !selectedSize ? 'Select Size to Add' : 'Add to Bag'}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div id="reviews" className="border-t border-gray-100 pt-20 mb-20 scroll-mt-24">
            <h2 className="text-3xl font-serif text-navy-900 mb-12">Customer Reviews</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* Review List */}
                <div className="space-y-8 max-h-[600px] overflow-y-auto custom-scrollbar pr-4">
                    {productReviews.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            <Star size={40} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500 italic">No reviews yet. Be the first to share your thoughts!</p>
                        </div>
                    ) : (
                        productReviews.map(review => (
                            <div key={review.id} className="border-b border-gray-100 pb-8 animate-fade-in last:border-0">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-12 h-12 rounded-full bg-navy-50 flex items-center justify-center text-navy-900 font-bold text-lg border border-navy-100">
                                        {review.userName.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-navy-900 text-sm">{review.userName}</h4>
                                        <div className="flex text-gold-500 mt-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "text-gold-500" : "text-gray-300"} />
                                            ))}
                                        </div>
                                    </div>
                                    <span className="ml-auto text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">{review.date}</span>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed mb-4 pl-16 relative">
                                    <span className="absolute left-4 top-0 text-4xl text-gray-200 font-serif -z-10">“</span>
                                    {review.comment}
                                </p>
                                {review.image && (
                                    <div className="ml-16 w-24 h-24 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity hover:scale-105 duration-300 shadow-sm">
                                        <img src={review.image} alt="Review attachment" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Write Review Form */}
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-xl h-fit sticky top-24">
                    <h3 className="font-serif text-2xl text-navy-900 mb-6">Write a Review</h3>
                    {isAuthenticated ? (
                        <form onSubmit={handleSubmitReview} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Your Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button 
                                            key={star} 
                                            type="button"
                                            onClick={() => setReviewRating(star)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star 
                                                size={28} 
                                                fill={star <= reviewRating ? "currentColor" : "none"} 
                                                className={star <= reviewRating ? "text-gold-500 drop-shadow-sm" : "text-gray-300"} 
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Your Experience</label>
                                <textarea 
                                    required
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:border-navy-900 h-32 text-sm bg-gray-50 focus:bg-white transition-colors text-navy-900 placeholder-gray-400"
                                    placeholder="What did you like or dislike? How was the fit?"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Add Photo (Optional)</label>
                                <div className="flex items-center gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 hover:border-navy-900 transition-colors"
                                    >
                                        <Camera size={16} /> Upload Image
                                    </button>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handleReviewImageUpload} 
                                    />
                                    {reviewImage && (
                                        <div className="w-12 h-12 rounded border border-gray-200 overflow-hidden relative group shadow-sm">
                                            <img src={reviewImage} alt="Preview" className="w-full h-full object-cover" />
                                            <button 
                                                type="button" 
                                                onClick={() => setReviewImage('')}
                                                className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <span className="text-xs font-bold">REMOVE</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="w-full bg-navy-900 text-white py-4 rounded-lg uppercase font-bold tracking-widest text-xs hover:bg-gold-600 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200"
                            >
                                <Send size={16} /> Submit Review
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-100">
                            <User size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">Please sign in to your account to leave a review and share your photo.</p>
                            <Link to="/login" className="inline-block px-8 py-3 bg-navy-900 text-white font-bold uppercase text-xs tracking-widest rounded hover:bg-gold-600 transition-colors shadow-lg">
                                Login Now
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="border-t border-gray-100 pt-20">
            <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-serif text-navy-900">Complete The Look</h2>
                <Link to="/shop" className="text-gold-600 uppercase text-xs font-bold tracking-widest hover:text-navy-900 transition-colors border-b border-gold-600/30 pb-1 hover:border-navy-900">View All</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {related.map((p, i) => (
                <div key={p.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;