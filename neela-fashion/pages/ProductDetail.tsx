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
  
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [related, setRelated] = useState<Product[]>([]);
  const [mainImage, setMainImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImage, setReviewImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id) {
      const found = products.find(p => p.id === parseInt(id));
      setProduct(found);
      setQuantity(1);
      setSelectedSize(''); // Reset size on product change
      if (found) {
        setMainImage(found.image);
        const rel = products.filter(p => p.category === found.category && p.id !== found.id).slice(0, 4);
        setRelated(rel);
      }
      window.scrollTo(0, 0);
    }
  }, [id, products]);

  if (!product) {
    return <div className="pt-32 text-center">Product not found.</div>;
  }

  const isLiked = isInWishlist(product.id);
  const productReviews = reviews.filter(r => r.productId === product.id);

  // --- SIZE LOGIC ---
  const currentSizeStock = selectedSize && product.sizeStock 
      ? (product.sizeStock[selectedSize] || 0) 
      : 0;

  // Determine if "Add to Cart" should be enabled
  const isSizeSelected = !!selectedSize;
  const isOutOfStock = isSizeSelected && currentSizeStock === 0;
  const isLowStock = isSizeSelected && currentSizeStock > 0 && currentSizeStock < 10;

  const handleAddToCart = () => {
      if (!selectedSize) {
          alert("Please select a size");
          return;
      }
      if (isOutOfStock) return;
      addToCart(product, quantity, mainImage, selectedSize);
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
          
          {/* Image Section */}
          <div className="md:w-1/2">
            <div className="bg-gray-100 overflow-hidden aspect-[3/4] relative group shadow-lg mb-4">
              <img 
                src={mainImage} 
                alt={product.name} 
                className={`w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110 ${isOutOfStock ? 'grayscale' : ''}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/20 to-transparent pointer-events-none"></div>
              {product.discountPrice && !isOutOfStock && (
                 <div className="absolute top-6 left-0 bg-navy-900 text-white px-4 py-2 uppercase tracking-wide text-sm font-bold shadow-md">Sale</div>
              )}
              {isOutOfStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="border-2 border-white text-white px-8 py-4 text-2xl font-bold uppercase tracking-widest transform -rotate-12">Out of Stock</span>
                  </div>
              )}
            </div>
            
            {galleryImages.length > 1 && (
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Available Colors / Views</p>
                    <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                        {galleryImages.map((img, i) => (
                            <div 
                                key={i} 
                                onClick={() => setMainImage(img)}
                                className={`w-20 h-24 flex-shrink-0 cursor-pointer border-2 transition-all duration-300 ${mainImage === img ? 'border-navy-900 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            >
                                <img src={img} className="w-full h-full object-cover" alt={`View ${i+1}`} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>

          {/* Details */}
          <div className="md:w-1/2 pt-8 animate-fade-in-up">
            <div className="mb-4 text-gray-500 text-xs uppercase tracking-[0.2em]">
              <Link to="/shop" className="hover:text-gold-600 transition-colors">Shop</Link> / <Link to={`/shop?category=${product.category}`} className="hover:text-gold-600 transition-colors">{product.category}</Link>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-serif text-navy-900 mb-6 leading-tight">{product.name}</h1>
            
            <div className="flex items-center space-x-6 mb-8 border-b border-gray-100 pb-8">
              <div className="text-3xl font-bold text-navy-900">
                {product.discountPrice ? (
                  <>
                    <span className="mr-3">₹{product.discountPrice}</span>
                    <span className="text-xl text-gray-400 line-through font-light">₹{product.price}</span>
                  </>
                ) : (
                  <span>₹{product.price}</span>
                )}
              </div>
              <div className="flex items-center text-gold-500">
                <Star fill="currentColor" size={18} />
                <span className="ml-2 text-gray-600 text-sm font-medium">({productReviews.length} Reviews)</span>
              </div>
            </div>

            <p className="text-gray-600 mb-10 leading-loose font-light text-lg max-w-lg">
              {product.description}
            </p>

            <div className="mb-10 space-y-6">
              {/* SIZE SELECTOR */}
              <div>
                  <h4 className="font-bold text-navy-900 text-sm uppercase tracking-widest mb-3">Select Size</h4>
                  <div className="flex flex-wrap gap-3">
                      {AVAILABLE_SIZES.map(size => {
                          const stockForSize = product.sizeStock ? (product.sizeStock[size] || 0) : 0;
                          const isSizeDisabled = stockForSize === 0;
                          
                          return (
                              <button
                                  key={size}
                                  onClick={() => setSelectedSize(size)}
                                  disabled={isSizeDisabled}
                                  className={`w-12 h-12 flex items-center justify-center border text-sm font-bold transition-all duration-200 
                                      ${selectedSize === size ? 'bg-navy-900 text-white border-navy-900' : 'bg-white text-gray-600 border-gray-300 hover:border-navy-900'}
                                      ${isSizeDisabled ? 'opacity-40 cursor-not-allowed bg-gray-100 decoration-slice line-through decoration-red-500' : ''}
                                  `}
                              >
                                  {size}
                              </button>
                          );
                      })}
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                 <div><span className="font-semibold text-navy-900">Material:</span> {product.material}</div>
                 <div><span className="font-semibold text-navy-900">Sub-Category:</span> {product.subCategory}</div>
                 <div className="col-span-2">
                     <span className="font-semibold text-navy-900">Availability:</span> 
                     {!selectedSize ? (
                         <span className="text-gray-500 ml-2">Select a size to see stock</span>
                     ) : isOutOfStock ? (
                         <span className="text-red-600 ml-2 font-bold">Out of Stock ({selectedSize})</span>
                     ) : isLowStock ? (
                         <span className="text-orange-500 ml-2 font-bold">Limited Stock ({currentSizeStock} left)</span>
                     ) : (
                         <span className="text-green-600 ml-2">In Stock ({currentSizeStock})</span>
                     )}
                 </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-6 mb-10">
              <div className="flex gap-6">
                  <div className={`flex items-center border border-gray-300 w-32 h-14 transition-colors ${isOutOfStock || !selectedSize ? 'opacity-50 pointer-events-none' : 'hover:border-navy-900'}`}>
                    <button 
                      className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-navy-900"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    >
                      <Minus size={16} />
                    </button>
                    <div className="flex-1 text-center font-bold text-navy-900 text-lg">{quantity}</div>
                    <button 
                      className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-navy-900"
                      onClick={() => setQuantity(q => Math.min(q + 1, currentSizeStock))}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button 
                    onClick={handleWishlist}
                    className={`w-14 h-14 flex items-center justify-center border transition-all duration-300 ${isLiked ? 'border-red-500 text-red-500' : 'border-gray-300 text-gray-400 hover:border-gold-600 hover:text-gold-600'}`}
                  >
                     <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
                  </button>
              </div>

              {isLowStock && (
                  <div className="flex items-center text-orange-600 text-sm">
                      <AlertCircle size={16} className="mr-2" />
                      Hurry! Only {currentSizeStock} units left in stock.
                  </div>
              )}

              <button 
                onClick={handleAddToCart}
                disabled={isOutOfStock || !selectedSize}
                className={`w-full md:max-w-md text-white h-14 uppercase tracking-widest font-bold text-sm transition-all duration-300 flex items-center justify-center gap-3 shadow-xl ${isOutOfStock || !selectedSize ? 'bg-gray-400 cursor-not-allowed' : 'bg-navy-900 hover:bg-gold-600 hover:shadow-2xl hover:-translate-y-1'}`}
              >
                <ShoppingBag size={20} /> {isOutOfStock ? 'Out of Stock' : !selectedSize ? 'Select Size' : 'Add to Bag'}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="border-t border-gray-100 pt-16 mb-20">
            <h2 className="text-3xl font-serif text-navy-900 mb-8">Customer Reviews</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* List Reviews */}
                <div className="space-y-8">
                    {productReviews.length === 0 ? (
                        <p className="text-gray-500 italic">No reviews yet. Be the first to review this product!</p>
                    ) : (
                        productReviews.map(review => (
                            <div key={review.id} className="border-b border-gray-100 pb-8 animate-fade-in">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-full bg-navy-50 flex items-center justify-center text-navy-900 font-bold">
                                        {review.userName.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-navy-900 text-sm">{review.userName}</h4>
                                        <div className="flex text-gold-500">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "text-gold-500" : "text-gray-300"} />
                                            ))}
                                        </div>
                                    </div>
                                    <span className="ml-auto text-xs text-gray-400">{review.date}</span>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed mb-3">{review.comment}</p>
                                {review.image && (
                                    <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity">
                                        <img src={review.image} alt="Review" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Write Review */}
                <div className="bg-gray-50 p-8 rounded-xl border border-gray-100">
                    <h3 className="font-serif text-xl text-navy-900 mb-6">Write a Review</h3>
                    {isAuthenticated ? (
                        <form onSubmit={handleSubmitReview} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button 
                                            key={star} 
                                            type="button"
                                            onClick={() => setReviewRating(star)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star 
                                                size={24} 
                                                fill={star <= reviewRating ? "currentColor" : "none"} 
                                                className={star <= reviewRating ? "text-gold-500" : "text-gray-300"} 
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Your Review</label>
                                <textarea 
                                    required
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:border-navy-900 h-32 text-sm bg-white text-navy-900"
                                    placeholder="Share your thoughts about the product..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Add Photo (Optional)</label>
                                <div className="flex items-center gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-white hover:border-navy-900 transition-colors bg-white"
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
                                        <div className="w-12 h-12 rounded border border-gray-200 overflow-hidden relative group">
                                            <img src={reviewImage} alt="Preview" className="w-full h-full object-cover" />
                                            <button 
                                                type="button" 
                                                onClick={() => setReviewImage('')}
                                                className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                x
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="w-full bg-navy-900 text-white py-4 rounded-lg uppercase font-bold tracking-widest text-xs hover:bg-gold-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <Send size={16} /> Submit Review
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-8">
                            <User size={40} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500 text-sm mb-4">Please log in to write a review.</p>
                            <Link to="/login" className="inline-block px-6 py-2 border border-navy-900 text-navy-900 font-bold uppercase text-xs rounded hover:bg-navy-900 hover:text-white transition-colors">
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
                <Link to="/shop" className="text-gold-600 uppercase text-xs font-bold tracking-widest hover:text-navy-900">View All</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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