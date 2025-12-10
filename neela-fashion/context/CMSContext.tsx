import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
    Product, Order, User, CategoryStructure, 
    ShippingRule, ShippingRulesMap, Review, HomeContent, AboutContent, ContactContent, GlobalSettings
} from '../types';
import toast from 'react-hot-toast';

// Dynamic API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DEFAULT_HOME_CONTENT: HomeContent = {
    heroTitle: 'Classic Aura', heroSubtitle: 'Experience craftsmanship...',
    heroImage: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae', marqueeText: ["Heritage", "Luxury"],
    sectionTitleTrends: 'Curated Trends', sectionTitleFeatured: 'Trending Now', sectionTitleTestimonials: 'Voices',
    testimonials: [], trendImages: { large: '', topRight: '', bottomRight: '' }
};

const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = { 
    logoUrl: '', 
    siteName: 'Neela Fashion', 
    currency: '₹', 
    logoWidth: '80px', 
    taxRate: 5,
    instagramUrl: '',
    youtubeUrl: '',
    whatsappNumber: '',
    contactNumber: ''
};

const DEFAULT_ABOUT_CONTENT = { title: 'Weaving Stories', description: 'Born from desire...', heroImage: '' };
const DEFAULT_CONTACT_CONTENT = { address: 'Bangalore', phone: '+91 98765', email: 'info@neela.com', mapUrl: '', heroImage: '' };

interface CMSContextType {
  products: Product[]; orders: Order[]; users: User[]; categories: CategoryStructure; shippingRules: ShippingRulesMap; reviews: Review[];
  globalSettings: GlobalSettings; homeContent: HomeContent; aboutContent: AboutContent; contactContent: ContactContent; adminCredentials: { email: string; pass: string };
  
  addProduct: (p: Product) => Promise<void>; 
  updateProduct: (id: number, p: Partial<Product>) => void; 
  deleteProduct: (id: number) => void; 
  bulkDeleteProducts: (ids: number[]) => void; 
  importProducts: (newProducts: Partial<Product>[]) => Promise<void>; 

  addCategory: (name: string, rules: ShippingRule[]) => void; 
  updateCategory: (oldName: string, newName: string, rules: ShippingRule[]) => void; 
  deleteCategory: (name: string) => void; 
  addSubCategory: (categoryName: string, subCategoryName: string) => void;

  updateUserProfile: (id: string, data: Partial<User>) => void; 
  deleteUser: (id: string) => void; 
  toggleUserStatus: (id: string) => void;

  addOrder: (order: Order) => void; 
  updateOrderStatus: (id: string, status: Order['status']) => void; 
  cancelOrder: (id: string) => void;
  deleteOrder: (id: string) => void;

  addReview: (review: Review) => void; 
  deleteReview: (id: string) => void;

  updateGlobalSettings: (s: Partial<GlobalSettings>) => void; 
  updateHomeContent: (c: Partial<HomeContent>) => void; 
  updateAboutContent: (c: Partial<AboutContent>) => void; 
  updateContactContent: (c: Partial<ContactContent>) => void; 
  updateAdminCredentials: (creds: { email: string; pass: string }) => void;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export const CMSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]); 
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<CategoryStructure>({});
  const [shippingRules, setShippingRules] = useState<ShippingRulesMap>({});
  const [reviews, setReviews] = useState<Review[]>([]);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(DEFAULT_GLOBAL_SETTINGS);
  const [homeContent, setHomeContent] = useState<HomeContent>(DEFAULT_HOME_CONTENT);
  const [aboutContent, setAboutContent] = useState<AboutContent>(DEFAULT_ABOUT_CONTENT);
  const [contactContent, setContactContent] = useState<ContactContent>(DEFAULT_CONTACT_CONTENT);
  const [adminCredentials, setAdminCredentials] = useState({ email: 'neelafashion@gmail.com', pass: 'admin-neela' });

  const fetchCategories = async () => {
      try {
          const res = await fetch(`${API_URL}/api/categories`);
          const data = await res.json();
          if (data.success) {
              const newCats: CategoryStructure = {};
              const newRules: ShippingRulesMap = {};
              data.categories.forEach((cat: any) => {
                  newCats[cat.name] = cat.subCategories || [];
                  newRules[cat.name] = cat.shippingRules || [];
              });
              setCategories(newCats);
              setShippingRules(newRules);
          }
      } catch (error) { console.error("Fetch Categories Error", error); }
  };

  const fetchData = async () => {
      await fetchCategories(); 
      try {
          const [prodRes, userRes, reviewRes, orderRes, homeRes, globalRes, aboutRes, contactRes, adminRes] = await Promise.all([
              fetch(`${API_URL}/api/products`),
              fetch(`${API_URL}/api/users`),
              fetch(`${API_URL}/api/reviews`),
              fetch(`${API_URL}/api/orders`),
              fetch(`${API_URL}/api/cms/home`),
              fetch(`${API_URL}/api/cms/global-settings`),
              fetch(`${API_URL}/api/cms/about`),
              fetch(`${API_URL}/api/cms/contact`),
              fetch(`${API_URL}/api/admin/details`)
          ]);

          const prodData = await prodRes.json(); if(prodData.success) setProducts(prodData.products);
          const userData = await userRes.json(); if(userData.success) setUsers(userData.users);
          const reviewData = await reviewRes.json(); if(reviewData.success) setReviews(reviewData.reviews);
          const orderData = await orderRes.json(); if(orderData.success) setOrders(orderData.orders);
          const homeData = await homeRes.json(); if(homeData.success) setHomeContent(homeData.data);
          const globalData = await globalRes.json(); if(globalData.success) setGlobalSettings({ ...DEFAULT_GLOBAL_SETTINGS, ...globalData.data }); // Merge to ensure new fields exist
          const aboutData = await aboutRes.json(); if(aboutData.success) setAboutContent(aboutData.data);
          const contactData = await contactRes.json(); if(contactData.success) setContactContent(contactData.data);
          const adminData = await adminRes.json(); if(adminData.success) setAdminCredentials(prev => ({ ...prev, email: adminData.email }));

      } catch (e) { console.error("Init Fetch Error", e); }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
     setShippingRules(prev => {
         const newRules = { ...prev };
         Object.keys(categories).forEach(cat => {
             if (!newRules[cat]) {
                 newRules[cat] = [
                     { state: 'All States', minQty: 1, maxQty: 5, cost: 50, type: 'fixed' },
                     { state: 'All States', minQty: 6, maxQty: 9999, cost: 0, type: 'fixed' }
                 ];
             }
         });
         return newRules;
     });
  }, [categories]);

  // Actions
  const addCategory = async (name: string, rules: ShippingRule[]) => {
    try {
        const res = await fetch(`${API_URL}/api/categories`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, rules }) });
        const data = await res.json();
        if (data.success) { toast.success("Category Added!"); fetchCategories(); } else { toast.error(data.message); }
    } catch (error) { toast.error("Server Error"); }
  };

  const updateCategory = async (oldName: string, newName: string, rules: ShippingRule[]) => {
      try {
          const res = await fetch(`${API_URL}/api/categories/${oldName}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ newName, rules }) });
          const data = await res.json();
          if (data.success) { toast.success("Category Updated!"); fetchCategories(); } else { toast.error("Update Failed"); }
      } catch (error) { toast.error("Server Error"); }
  };

  const deleteCategory = async (name: string) => { try { await fetch(`${API_URL}/api/categories/${name}`, { method: 'DELETE' }); toast.success("Category Deleted!"); fetchCategories(); } catch (error) { toast.error("Server Error"); } };
  const addSubCategory = async (categoryName: string, subCategoryName: string) => { try { await fetch(`${API_URL}/api/categories/${categoryName}/sub`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subCategory: subCategoryName }) }); toast.success("SubCategory Added!"); fetchCategories(); } catch (error) { toast.error("Server Error"); } };

  const addOrder = async (order: Order) => { try { const res = await fetch(`${API_URL}/api/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order) }); const d = await res.json(); if(d.success) fetchData(); } catch(e) { toast.error("Order Failed"); } };
  const updateOrderStatus = async (id: string, status: Order['status']) => { try { await fetch(`${API_URL}/api/orders/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }); toast.success("Status Updated"); fetchData(); } catch(e) { toast.error("Update Failed"); } };
  const cancelOrder = async (id: string) => { try { await fetch(`${API_URL}/api/orders/${id}/cancel`, { method: 'PUT' }); toast.success("Order Cancelled"); fetchData(); } catch(e) { toast.error("Cancel Failed"); } };
  const deleteOrder = async (id: string) => { try { await fetch(`${API_URL}/api/orders/${id}`, { method: 'DELETE' }); toast.success("Deleted Permanently"); fetchData(); } catch(e) { toast.error("Delete Failed"); } };
  
  const updateGlobalSettings = async (s: Partial<GlobalSettings>) => { const newSettings = { ...globalSettings, ...s }; setGlobalSettings(newSettings); try { await fetch(`${API_URL}/api/cms/global-settings`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: newSettings }) }); toast.success("Saved!"); } catch (error) { toast.error("Server Error"); } };
  const updateHomeContent = async (c: Partial<HomeContent>) => { const newContent = { ...homeContent, ...c }; setHomeContent(newContent); try { await fetch(`${API_URL}/api/cms/home`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: newContent }) }); toast.success("Updated!"); } catch (error) { toast.error("Server Error"); } };
  const updateAboutContent = async (c: Partial<AboutContent>) => { const newContent = { ...aboutContent, ...c }; setAboutContent(newContent); try { await fetch(`${API_URL}/api/cms/about`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: newContent }) }); toast.success("Updated!"); } catch (error) { toast.error("Server Error"); } };
  const updateContactContent = async (c: Partial<ContactContent>) => { const newContent = { ...contactContent, ...c }; setContactContent(newContent); try { await fetch(`${API_URL}/api/cms/contact`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: newContent }) }); toast.success("Updated!"); } catch (error) { toast.error("Server Error"); } };
  
  const addProduct = async (p: Product) => { try { const { id, ...pd } = p; const r = await fetch(`${API_URL}/api/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pd) }); const d = await r.json(); if (d.success) { toast.success(`Added: ${p.name}`); fetchData(); } } catch (error) { toast.error("Error adding product"); } };
  const updateProduct = async (id: number, p: Partial<Product>) => { try { await fetch(`${API_URL}/api/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) }); toast.success("Updated!"); fetchData(); } catch (error) { toast.error("Error"); } };
  const deleteProduct = async (id: number) => { try { await fetch(`${API_URL}/api/products/${id}`, { method: 'DELETE' }); toast.success("Deleted!"); setProducts(prev => prev.filter(p => p.id !== id)); } catch (error) { toast.error("Error"); } };
  const bulkDeleteProducts = async (ids: number[]) => { try { await fetch(`${API_URL}/api/products/bulk-delete`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) }); toast.success("Deleted!"); setProducts(prev => prev.filter(p => !ids.includes(p.id))); } catch (error) { toast.error("Error"); } };
  
  const importProducts = async (newProducts: Partial<Product>[]) => {
      let successCount = 0;
      for (const p of newProducts) {
          try {
              if(p.name && p.price && p.category) {
                  const { id, ...pd } = p; 
                  await fetch(`${API_URL}/api/products`, { 
                      method: 'POST', 
                      headers: { 'Content-Type': 'application/json' }, 
                      body: JSON.stringify(pd) 
                  });
                  successCount++;
              }
          } catch (e) { console.error("Import error for", p.name); }
      }
      if (successCount > 0) {
          toast.success(`${successCount} Products Imported Successfully!`);
          fetchData();
      } else {
          toast.error("No valid products found to import.");
      }
  };

  const deleteUser = async (id: string) => { try { const r = await fetch(`${API_URL}/api/users/${id}`, { method: 'DELETE' }); const d = await r.json(); if (d.success) { toast.success("Deleted!"); fetchData(); } else toast.error(d.message); } catch (error) { toast.error("Error"); } };
  const toggleUserStatus = async (id: string) => { try { const r = await fetch(`${API_URL}/api/users/${id}/status`, { method: 'PUT' }); const d = await r.json(); if (d.success) { toast.success(d.message); fetchData(); } else toast.error(d.message); } catch (error) { toast.error("Error"); } };
  
  // NEW: Update User Profile (API Call)
  const updateUserProfile = async (id: string, d: Partial<User>) => { 
      try {
          const res = await fetch(`${API_URL}/api/users/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(d)
          });
          const data = await res.json();
          if (data.success) {
              setUsers(prev => prev.map(u => u.id === id ? { ...u, ...d } : u));
              toast.success("Address Saved!");
          } else {
              toast.error("Failed to save address.");
          }
      } catch (error) {
          toast.error("Connection Error");
      }
  };

  const addReview = async (r: Review) => { try { const { id, ...rd } = r; await fetch(`${API_URL}/api/reviews`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rd) }); toast.success("Submitted!"); fetchData(); } catch (error) { toast.error("Error"); } };
  const deleteReview = async (id: string) => { try { await fetch(`${API_URL}/api/reviews/${id}`, { method: 'DELETE' }); toast.success("Deleted!"); fetchData(); } catch (error) { toast.error("Error"); } };
  const updateAdminCredentials = (creds: {email: string, pass: string}) => setAdminCredentials(creds);

  return (
    <CMSContext.Provider value={{
      products, orders, users, categories, shippingRules, reviews, globalSettings, homeContent, aboutContent, contactContent, adminCredentials,
      addProduct, updateProduct, deleteProduct, bulkDeleteProducts, importProducts,
      addCategory, updateCategory, deleteCategory, addSubCategory, updateUserProfile, deleteUser, toggleUserStatus, 
      addOrder, updateOrderStatus, cancelOrder, deleteOrder,
      addReview, deleteReview,
      updateGlobalSettings, updateHomeContent, updateAboutContent, updateContactContent, updateAdminCredentials
    }}>
      {children}
    </CMSContext.Provider>
  );
};

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (!context) throw new Error('useCMS must be used within a CMSProvider');
  return context;
};