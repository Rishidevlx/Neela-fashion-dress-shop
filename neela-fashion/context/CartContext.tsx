import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '../types';
import { useAuth } from './AuthContext';
import { useCMS } from './CMSContext';
import toast from 'react-hot-toast';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, selectedImage?: string, selectedSize?: string) => void;
  removeFromCart: (productId: number, selectedSize?: string) => void;
  updateQuantity: (productId: number, quantity: number, selectedSize?: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  taxAmount: number;
  finalTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { globalSettings } = useCMS(); 
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    if (isAuthenticated && user) {
        fetchCartFromDB(user.id);
    } else {
        const saved = localStorage.getItem('neela_cart');
        if (saved) setCart(JSON.parse(saved));
        else setCart([]);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated) {
        localStorage.setItem('neela_cart', JSON.stringify(cart));
    }
  }, [cart, isAuthenticated]);

  const fetchCartFromDB = async (userId: string) => {
      try {
          const res = await fetch(`http://localhost:5000/api/cart/${userId}`);
          const data = await res.json();
          if (data.success) {
              const mappedCart = data.cart.map((item: any) => ({
                  ...item.Product,
                  image: item.selectedImage || item.Product.image,
                  quantity: item.quantity,
                  selectedSize: item.selectedSize // Map size from DB
              }));
              setCart(mappedCart);
          }
      } catch (error) { console.error("Fetch Cart Error", error); }
  };

  const addToCart = async (product: Product, quantity: number, selectedImage?: string, selectedSize?: string) => {
    const imageToUse = selectedImage || product.image;
    const updatedCart = [...cart];
    
    // Unique ID = ProductID + Size
    const existingIndex = updatedCart.findIndex(item => 
        item.id === product.id && item.selectedSize === selectedSize
    );

    if (existingIndex > -1) {
        updatedCart[existingIndex].quantity += quantity;
        updatedCart[existingIndex].image = imageToUse; 
    } else {
        updatedCart.push({ ...product, image: imageToUse, quantity, selectedSize });
    }
    setCart(updatedCart);
    toast.success("Added to Bag!");

    if (isAuthenticated && user) {
        try {
            await fetch('http://localhost:5000/api/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, productId: product.id, quantity, selectedImage: imageToUse, selectedSize })
            });
        } catch (error) { console.error("Add Cart API Error", error); }
    }
  };

  const removeFromCart = async (productId: number, selectedSize?: string) => {
    setCart(prev => prev.filter(item => !(item.id === productId && item.selectedSize === selectedSize)));
    toast.success("Removed from Bag");
    if (isAuthenticated && user) {
        try {
            await fetch('http://localhost:5000/api/cart/remove', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, productId, selectedSize })
            });
        } catch (error) { console.error("Remove Cart API Error", error); }
    }
  };

  const updateQuantity = async (productId: number, quantity: number, selectedSize?: string) => {
    if (quantity < 1) return;
    setCart(prev => prev.map(item => (item.id === productId && item.selectedSize === selectedSize) ? { ...item, quantity } : item));
    if (isAuthenticated && user) {
        try {
            await fetch('http://localhost:5000/api/cart/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, productId, quantity, selectedSize })
            });
        } catch (error) { console.error("Update Cart API Error", error); }
    }
  };

  const clearCart = async () => {
    setCart([]);
    if (isAuthenticated && user) {
        try { await fetch(`http://localhost:5000/api/cart/clear/${user.id}`, { method: 'DELETE' }); } 
        catch (error) { console.error("Clear Cart API Error", error); }
    } else { localStorage.removeItem('neela_cart'); }
  };

  const cartTotal = cart.reduce((total, item) => {
    const price = item.discountPrice || item.price;
    return total + (price * item.quantity);
  }, 0);

  const taxRate = globalSettings?.taxRate || 0;
  const taxAmount = (cartTotal * taxRate) / 100;
  const finalTotal = cartTotal + taxAmount;
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, taxAmount, finalTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};