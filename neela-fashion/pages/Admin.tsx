import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCMS } from '../context/CMSContext';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Users, ShoppingCart, Settings, 
  Package, Globe, LogOut, Trash2, Edit, Plus, Save,
  Image as ImageIcon, X, Layers, Minus, AlertTriangle, CheckCircle, 
  ArrowLeft, Menu, Home, ShoppingBag, Phone, Info, Search, Eye, EyeOff, Shield, Lock,
  DollarSign, ToggleRight, ToggleLeft, Upload, Download, Printer, File,
  TrendingUp, Activity, AlertCircle, Calendar, MessageSquare, Star, Filter
} from 'lucide-react';
import { Product, ShippingRule, INDIAN_STATES, SHIPPING_TYPES, Order, ContactContent, User, AVAILABLE_SIZES } from '../types';

type AdminTab = 'dashboard' | 'global' | 'home' | 'about' | 'contact' | 'categories' | 'products' | 'users' | 'orders' | 'reviews' | 'settings';

// --- Reusable Components ---

const Toast: React.FC<{ message: string, onClose: () => void }> = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-8 right-8 bg-navy-900 text-white px-6 py-4 rounded shadow-2xl flex items-center z-50 animate-fade-in-up">
            <CheckCircle size={20} className="text-gold-500 mr-3" />
            <span className="font-medium text-sm">{message}</span>
        </div>
    );
};

const ConfirmModal: React.FC<{ isOpen: boolean, title: string, message: string, onConfirm: () => void, onCancel: () => void }> = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white p-8 rounded-xl max-w-md w-full shadow-2xl text-center border border-gray-100">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle size={32} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-navy-900 font-sans">{title}</h3>
                <p className="text-gray-500 mb-8 text-sm leading-relaxed">{message}</p>
                <div className="flex justify-center gap-4">
                    <button onClick={onCancel} className="px-6 py-3 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 text-xs font-bold uppercase tracking-wider transition-colors bg-white">Cancel</button>
                    <button onClick={onConfirm} className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-bold uppercase tracking-wider shadow-lg transition-colors">Confirm</button>
                </div>
            </div>
        </div>
    );
};

// --- Dashboard View ---
const DashboardView = ({ setTab }: { setTab: (tab: AdminTab) => void }) => {
  const { orders, users, products, reviews } = useCMS();
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const totalSales = orders.length;
  
  // Logic for Low Stock: < 5 total OR any size stock <= 10 (Strict check as requested)
  const lowStockProducts = products.filter(p => {
      const isTotalLow = p.stock < 5;
      const isAnySizeLow = p.sizeStock ? Object.values(p.sizeStock).some(qty => Number(qty) <= 10) : false;
      return isTotalLow || isAnySizeLow;
  });
  
  const shortcuts = [
    { id: 'categories', label: 'Categories', icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'products', label: 'Products', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'users', label: 'Users', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare, color: 'text-teal-600', bg: 'bg-teal-50' },
    { id: 'settings', label: 'Admin Access', icon: Settings, color: 'text-gray-600', bg: 'bg-gray-50' },
  ];

  // --- Monthly Sales Report Generator ---
  const handleDownloadMonthlyReport = () => {
    // Group orders by Month-Year
    const salesByMonth: { [key: string]: { revenue: number, count: number } } = {};

    orders.forEach(order => {
        // Assuming order.date is "MM/DD/YYYY" or similar locale string
        const dateObj = new Date(order.date);
        if (!isNaN(dateObj.getTime())) {
            const monthYear = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
            if (!salesByMonth[monthYear]) {
                salesByMonth[monthYear] = { revenue: 0, count: 0 };
            }
            salesByMonth[monthYear].revenue += order.total;
            salesByMonth[monthYear].count += 1;
        }
    });

    // Create CSV Content
    const headers = ["Month", "Total Orders", "Total Revenue"];
    const rows = Object.entries(salesByMonth).map(([month, data]) => {
        return `"${month}",${data.count},${data.revenue.toFixed(2)}`;
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "monthly_sales_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto font-sans pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-6 gap-4">
          <div>
             {/* Changed to font-sans as requested for Dashboard */}
             <h2 className="text-4xl font-bold text-navy-900 tracking-tight">Dashboard</h2>
             <p className="text-gray-500 text-sm mt-1 flex items-center"><Activity size={14} className="mr-1 text-gold-600"/> Real-time overview of your store's performance.</p>
          </div>
          <div className="flex flex-col md:flex-row items-end gap-3">
              <div className="text-right">
                  <span className="block text-xl font-bold text-navy-900">
                      {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                  </span>
                  <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full inline-block mt-1">
                      {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
              </div>
              <button 
                onClick={handleDownloadMonthlyReport}
                className="bg-navy-900 text-white px-4 py-2 rounded shadow hover:bg-gold-600 transition-colors flex items-center text-xs font-bold uppercase tracking-wider"
              >
                  <Download size={14} className="mr-2" /> Monthly Report
              </button>
          </div>
      </div>
      
      {/* Stats Cards - Removed font-serif for cleaner professional look */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-gradient-to-br from-navy-900 to-navy-800 p-6 rounded-xl shadow-lg text-white relative overflow-hidden group hover:scale-[1.02] transition-transform">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-2xl"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
               <div>
                  <p className="text-gold-400 text-xs font-bold uppercase tracking-widest mb-1">Total Revenue</p>
                  <h3 className="text-3xl font-bold tracking-tight">₹{totalRevenue.toLocaleString()}</h3>
               </div>
               <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <DollarSign className="text-gold-400" size={20} />
               </div>
            </div>
            <div className="w-full bg-navy-950 h-1 rounded-full overflow-hidden">
                <div className="bg-gold-500 h-full w-[70%]"></div>
            </div>
            <p className="text-[10px] text-gray-300 mt-2">+12% from last month</p>
         </div>

         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-4 translate-y-4">
                 <ShoppingCart size={100} />
            </div>
            <div className="flex justify-between items-start mb-4 relative z-10">
               <div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Total Orders</p>
                  <h3 className="text-3xl font-bold text-navy-900">{totalSales}</h3>
               </div>
               <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center">
                   <ShoppingCart className="text-blue-600" size={20} />
               </div>
            </div>
            <p className="text-[10px] text-green-600 font-bold bg-green-50 inline-block px-2 py-0.5 rounded">
                <TrendingUp size={10} className="inline mr-1"/> Doing Great
            </p>
         </div>

         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Total Reviews</p>
                  <h3 className="text-3xl font-bold text-navy-900">{reviews.length}</h3>
               </div>
               <div className="w-10 h-10 rounded bg-teal-50 flex items-center justify-center">
                   <MessageSquare className="text-teal-600" size={20} />
               </div>
            </div>
            <p className="text-[10px] text-gray-400">Feedback Received</p>
         </div>

         <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-1">Low Stock Alert</p>
                  <h3 className="text-3xl font-bold text-navy-900">{lowStockProducts.length}</h3>
               </div>
               <div className="w-10 h-10 rounded bg-red-50 flex items-center justify-center">
                   <AlertCircle className="text-red-500" size={20} />
               </div>
            </div>
            <p className="text-[10px] text-gray-500">Products need attention</p>
         </div>
      </div>

      {/* Recent Orders Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-navy-900 text-lg">Recent Orders</h3>
                  <button onClick={() => setTab('orders')} className="text-gold-600 text-xs font-bold uppercase hover:underline">View All</button>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold">
                          <tr>
                              <th className="p-3 rounded-l-lg">Order ID</th>
                              <th className="p-3">Customer</th>
                              <th className="p-3">Status</th>
                              <th className="p-3 text-right rounded-r-lg">Total</th>
                          </tr>
                      </thead>
                      <tbody className="text-sm">
                          {orders.slice(0, 5).map(order => (
                              <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                  <td className="p-3 font-mono font-medium text-navy-900">{order.id}</td>
                                  <td className="p-3 text-gray-600">{order.userName}</td>
                                  <td className="p-3">
                                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                                          order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                          order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                          'bg-gold-100 text-gold-700'
                                      }`}>
                                          {order.status}
                                      </span>
                                  </td>
                                  <td className="p-3 text-right font-bold text-navy-900">₹{order.total}</td>
                              </tr>
                          ))}
                          {orders.length === 0 && (
                              <tr><td colSpan={4} className="p-4 text-center text-gray-400">No recent orders.</td></tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-navy-900 text-lg mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                  {shortcuts.map((item) => (
                      <button 
                        key={item.id}
                        onClick={() => setTab(item.id as AdminTab)}
                        className="p-4 rounded-lg border border-gray-100 hover:border-gold-200 hover:shadow-md transition-all flex flex-col items-center justify-center text-center group bg-gray-50 hover:bg-white"
                      >
                          <div className={`w-10 h-10 ${item.bg} rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                              <item.icon size={20} className={item.color} />
                          </div>
                          <span className="font-bold text-navy-900 text-xs">{item.label}</span>
                      </button>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
};

// --- SETTINGS & CONTENT VIEWS ---

const GlobalSettingsView = ({ setToast }: { setToast: (msg: string) => void }) => { 
    const { globalSettings, updateGlobalSettings } = useCMS(); 
    const [tempGlobal, setTempGlobal] = useState(globalSettings); 
    useEffect(() => setTempGlobal(globalSettings), [globalSettings]); 
    
    return (
        <div className="max-w-4xl animate-fade-in mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-serif font-bold text-navy-900">Global Settings</h2>
                <button onClick={() => { updateGlobalSettings(tempGlobal); setToast('Global Settings Saved Successfully'); }} className="bg-navy-900 text-white px-8 py-3 rounded hover:bg-gold-600 transition-all flex items-center shadow-lg uppercase text-xs font-bold tracking-wider">
                    <Save size={16} className="mr-2" /> Save Changes
                </button>
            </div>
            <div className="bg-white p-10 shadow-sm rounded-xl border border-gray-200 space-y-8">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-navy-900 mb-2">Website Name</label>
                    <input value={tempGlobal.siteName} onChange={(e) => setTempGlobal({...tempGlobal, siteName: e.target.value})} className="w-full border border-gray-300 rounded px-4 py-3 text-navy-900 outline-none focus:border-navy-900" />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-navy-900 mb-2">Logo URL</label>
                    <div className="flex gap-4">
                        <input value={tempGlobal.logoUrl} onChange={(e) => setTempGlobal({...tempGlobal, logoUrl: e.target.value})} className="flex-1 border border-gray-300 rounded px-4 py-3 text-navy-900 outline-none focus:border-navy-900" />
                        <div className="w-16 h-16 border rounded flex items-center justify-center bg-gray-50">
                            {tempGlobal.logoUrl && <img src={tempGlobal.logoUrl} className="max-w-full max-h-full" alt="logo"/>}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-navy-900 mb-2">Logo Width (e.g., 80px)</label>
                        <input value={tempGlobal.logoWidth} onChange={(e) => setTempGlobal({...tempGlobal, logoWidth: e.target.value})} className="w-full border border-gray-300 rounded px-4 py-3 text-navy-900 outline-none focus:border-navy-900" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-navy-900 mb-2">Tax Rate (%)</label>
                        <input type="number" value={tempGlobal.taxRate} onChange={(e) => setTempGlobal({...tempGlobal, taxRate: Number(e.target.value)})} className="w-full border border-gray-300 rounded px-4 py-3 text-navy-900 outline-none focus:border-navy-900" />
                    </div>
                </div>

                {/* SOCIAL MEDIA & CONTACT */}
                <div className="border-t pt-6 mt-6">
                    <h3 className="text-sm font-bold text-navy-900 uppercase tracking-widest mb-6">Social & Contact Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Instagram URL</label>
                            <input value={tempGlobal.instagramUrl || ''} onChange={(e) => setTempGlobal({...tempGlobal, instagramUrl: e.target.value})} className="w-full border border-gray-300 rounded px-4 py-3 text-navy-900 outline-none focus:border-navy-900" placeholder="https://instagram.com/..." />
                         </div>
                         <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">YouTube URL</label>
                            <input value={tempGlobal.youtubeUrl || ''} onChange={(e) => setTempGlobal({...tempGlobal, youtubeUrl: e.target.value})} className="w-full border border-gray-300 rounded px-4 py-3 text-navy-900 outline-none focus:border-navy-900" placeholder="https://youtube.com/..." />
                         </div>
                         <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">WhatsApp Number</label>
                            <input value={tempGlobal.whatsappNumber || ''} onChange={(e) => setTempGlobal({...tempGlobal, whatsappNumber: e.target.value})} className="w-full border border-gray-300 rounded px-4 py-3 text-navy-900 outline-none focus:border-navy-900" placeholder="+91..." />
                         </div>
                         <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Contact Phone</label>
                            <input value={tempGlobal.contactNumber || ''} onChange={(e) => setTempGlobal({...tempGlobal, contactNumber: e.target.value})} className="w-full border border-gray-300 rounded px-4 py-3 text-navy-900 outline-none focus:border-navy-900" placeholder="+91..." />
                         </div>
                    </div>
                </div>
            </div>
        </div>
    ); 
};

const HomeContentView = ({ setToast }: { setToast: (msg: string) => void }) => { 
    const { homeContent, updateHomeContent } = useCMS(); 
    const [data, setData] = useState(homeContent);
    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-serif font-bold text-navy-900">Home Content</h2>
                <button onClick={() => { updateHomeContent(data); setToast('Updated'); }} className="bg-navy-900 text-white px-6 py-3 rounded font-bold text-xs uppercase tracking-widest hover:bg-gold-600 flex items-center">
                    <Save size={16} className="mr-2"/> Save Changes
                </button>
            </div>
            <div className="bg-white p-8 shadow-sm rounded-xl border border-gray-200 space-y-6">
                <h3 className="font-bold border-b pb-2 text-navy-900">Hero Section</h3>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Hero Title</label>
                    <input className="w-full border p-3 rounded" placeholder="Hero Title" value={data.heroTitle} onChange={e => setData({...data, heroTitle: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Hero Subtitle</label>
                    <textarea className="w-full border p-3 rounded" placeholder="Hero Subtitle" value={data.heroSubtitle} onChange={e => setData({...data, heroSubtitle: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Hero Image URL</label>
                    <input className="w-full border p-3 rounded" placeholder="Hero Image URL" value={data.heroImage} onChange={e => setData({...data, heroImage: e.target.value})} />
                </div>
                
                <h3 className="font-bold border-b pb-2 mt-4 text-navy-900">Marquee Text</h3>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Running Text (Comma Separated)</label>
                    <input className="w-full border p-3 rounded" placeholder="Comma separated text" value={data.marqueeText.join(',')} onChange={e => setData({...data, marqueeText: e.target.value.split(',')})} />
                </div>
                
                <h3 className="font-bold border-b pb-2 mt-4 text-navy-900">Trend Images</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Large Image</label>
                        <input className="w-full border p-2 rounded" placeholder="Large Img" value={data.trendImages.large} onChange={e=>setData({...data, trendImages: {...data.trendImages, large: e.target.value}})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Top Right</label>
                        <input className="w-full border p-2 rounded" placeholder="Top Right" value={data.trendImages.topRight} onChange={e=>setData({...data, trendImages: {...data.trendImages, topRight: e.target.value}})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Bottom Right</label>
                        <input className="w-full border p-2 rounded" placeholder="Bottom Right" value={data.trendImages.bottomRight} onChange={e=>setData({...data, trendImages: {...data.trendImages, bottomRight: e.target.value}})} />
                    </div>
                </div>
            </div>
        </div>
    ); 
};

const AboutContentView = ({ setToast }: { setToast: (msg: string) => void }) => { 
    const { aboutContent, updateAboutContent } = useCMS(); 
    const [data, setData] = useState(aboutContent);
    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-serif font-bold text-navy-900">About Content</h2>
                <button onClick={() => { updateAboutContent(data); setToast('Updated'); }} className="bg-navy-900 text-white px-6 py-3 rounded font-bold text-xs uppercase tracking-widest hover:bg-gold-600 flex items-center">
                    <Save size={16} className="mr-2"/> Save Changes
                </button>
            </div>
            <div className="bg-white p-8 shadow-sm rounded-xl border border-gray-200 space-y-6">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">About Title</label>
                    <input className="w-full border p-3 rounded" placeholder="Title" value={data.title} onChange={e => setData({...data, title: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Description</label>
                    <textarea className="w-full border p-3 rounded h-32" placeholder="Description" value={data.description} onChange={e => setData({...data, description: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Hero Image URL</label>
                    <input className="w-full border p-3 rounded" placeholder="Hero Image URL" value={data.heroImage} onChange={e => setData({...data, heroImage: e.target.value})} />
                </div>
            </div>
        </div>
    ); 
};

const ContactContentView = ({ setToast }: { setToast: (msg: string) => void }) => { 
    const { contactContent, updateContactContent } = useCMS(); 
    const [data, setData] = useState(contactContent);
    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-serif font-bold text-navy-900">Contact Content</h2>
                <button onClick={() => { updateContactContent(data); setToast('Updated'); }} className="bg-navy-900 text-white px-6 py-3 rounded font-bold text-xs uppercase tracking-widest hover:bg-gold-600 flex items-center">
                    <Save size={16} className="mr-2"/> Save Changes
                </button>
            </div>
            <div className="bg-white p-8 shadow-sm rounded-xl border border-gray-200 space-y-6">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Office Address</label>
                    <textarea className="w-full border p-3 rounded" placeholder="Address" value={data.address} onChange={e => setData({...data, address: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Phone Number</label>
                    <input className="w-full border p-3 rounded" placeholder="Phone" value={data.phone} onChange={e => setData({...data, phone: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
                    <input className="w-full border p-3 rounded" placeholder="Email" value={data.email} onChange={e => setData({...data, email: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Google Map Embed URL</label>
                    <input className="w-full border p-3 rounded" placeholder="Map URL" value={data.mapUrl} onChange={e => setData({...data, mapUrl: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Hero Image URL</label>
                    <input className="w-full border p-3 rounded" placeholder="Hero Image" value={data.heroImage} onChange={e => setData({...data, heroImage: e.target.value})} />
                </div>
            </div>
        </div>
    ); 
};

// --- MANAGERS ---

const CategoryManagerView = ({ setToast }: { setToast: (msg: string) => void }) => { 
    const { categories, shippingRules, addCategory, updateCategory, deleteCategory, addSubCategory } = useCMS(); 
    const [selectedCat, setSelectedCat] = useState<string | null>(null); 
    const [editMode, setEditMode] = useState(false); 
    const [catName, setCatName] = useState(''); 
    const [subs, setSubs] = useState<string[]>([]); 
    const [rules, setRules] = useState<ShippingRule[]>([]); 
    const [newSub, setNewSub] = useState(''); 
    const [deleteCatName, setDeleteCatName] = useState<string | null>(null);

    const resetForm = () => { 
        setCatName(''); setSubs([]); setRules([{ state: 'All States', minQty: 1, maxQty: 100, cost: 50, type: 'fixed' }]); 
        setSelectedCat(null); setEditMode(false); 
    }; 

    const handleEdit = (cat: string) => { 
        setSelectedCat(cat); setCatName(cat); 
        setSubs(categories[cat] || []); 
        setRules(shippingRules[cat] || []); 
        setEditMode(true); 
    }; 

    const handleSave = () => { 
        if (!catName) return; 
        if (editMode && selectedCat) { 
            updateCategory(selectedCat, catName, rules); 
            setToast('Category Updated'); 
        } else { 
            addCategory(catName, rules); 
            subs.forEach(s => addSubCategory(catName, s)); 
            setToast('Category Added'); 
        } 
        resetForm(); 
    }; 

    const handleAddRule = () => { setRules([...rules, { state: 'All States', minQty: 1, maxQty: 99, cost: 0, type: 'fixed' }]); }; 
    const handleUpdateRule = (idx: number, field: keyof ShippingRule, value: any) => { const newRules = [...rules]; newRules[idx] = { ...newRules[idx], [field]: value }; setRules(newRules); }; 

    return (
        <div className="max-w-6xl mx-auto animate-fade-in space-y-8">
            <h2 className="text-3xl font-serif font-bold text-navy-900">Category & Shipping Management</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-1 h-fit">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-navy-900 uppercase text-xs tracking-widest">Categories</h3>
                        <button onClick={resetForm} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Plus size={20}/></button>
                    </div>
                    <div className="space-y-2">
                        {Object.keys(categories).map(cat => (
                            <div key={cat} className={`p-3 rounded border cursor-pointer flex justify-between items-center ${selectedCat === cat ? 'bg-navy-50 border-navy-900' : 'border-gray-100 hover:bg-gray-50'}`} onClick={() => handleEdit(cat)}>
                                <span className="font-medium text-sm">{cat}</span>
                                <button onClick={(e) => { e.stopPropagation(); setDeleteCatName(cat); }} className="text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <h3 className="font-bold text-navy-900 uppercase text-xs tracking-widest">{editMode ? 'Edit Category' : 'New Category'}</h3>
                        {editMode && <button onClick={resetForm} className="text-xs text-red-500">Cancel</button>}
                    </div>
                    <div className="space-y-6">
                        <div><label className="text-xs font-bold uppercase text-gray-500">Category Name</label><input className="w-full border p-3 rounded mt-1 bg-white" value={catName} onChange={e => setCatName(e.target.value)} /></div>
                        <div>
                            <div className="flex justify-between items-center mb-2"><label className="text-xs font-bold uppercase text-gray-500">Shipping Rules</label><button onClick={handleAddRule} className="text-blue-600 text-xs font-bold uppercase">+ Add Rule</button></div>
                            <div className="space-y-3">
                                {rules.map((rule, idx) => (
                                    <div key={idx} className="flex flex-wrap gap-2 items-center p-3 border border-gray-100 rounded bg-gray-50 text-sm">
                                        <select className="border rounded p-1 w-32 text-xs bg-white" value={rule.state} onChange={e => handleUpdateRule(idx, 'state', e.target.value)}><option value="All States">All States</option><option value="Other States">Other States</option>{INDIAN_STATES.slice(2).map(s => <option key={s} value={s}>{s}</option>)}</select>
                                        <input className="border rounded p-1 w-16 text-xs bg-white" type="number" placeholder="Min" value={rule.minQty} onChange={e => handleUpdateRule(idx, 'minQty', Number(e.target.value))} />
                                        <span>-</span>
                                        <input className="border rounded p-1 w-16 text-xs bg-white" type="number" placeholder="Max" value={rule.maxQty} onChange={e => handleUpdateRule(idx, 'maxQty', Number(e.target.value))} />
                                        <select className="border rounded p-1 w-32 text-xs bg-white" value={rule.type} onChange={e => handleUpdateRule(idx, 'type', e.target.value)}>{SHIPPING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
                                        <div className="flex items-center"><span className="text-xs mr-1">₹</span><input className="border rounded p-1 w-16 text-xs bg-white" type="number" value={rule.cost} onChange={e => handleUpdateRule(idx, 'cost', Number(e.target.value))} /></div>
                                        <button onClick={() => { const n = [...rules]; n.splice(idx,1); setRules(n); }} className="text-red-500"><X size={14}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500">Sub Categories</label>
                            <div className="flex flex-wrap gap-2 mt-2 mb-2">{subs.map(s => (<span key={s} className="px-3 py-1 bg-gray-100 rounded-full text-xs">{s}</span>))}</div>
                            {editMode && (<div className="flex gap-2"><input className="border rounded p-2 text-sm flex-1 bg-white" placeholder="New Subcategory" value={newSub} onChange={e => setNewSub(e.target.value)} /><button onClick={() => { if(newSub) { addSubCategory(selectedCat!, newSub); setSubs([...subs, newSub]); setNewSub(''); setToast('Subcategory Added'); } }} className="bg-gray-200 px-4 rounded text-xs font-bold">Add</button></div>)}
                        </div>
                        <div className="pt-4 border-t"><button onClick={handleSave} className="w-full bg-navy-900 text-white py-3 rounded font-bold uppercase text-xs tracking-widest hover:bg-gold-600">{editMode ? 'Update Category' : 'Create Category'}</button></div>
                    </div>
                </div>
            </div>
            <ConfirmModal 
                isOpen={!!deleteCatName} 
                title="Delete Category?" 
                message={`Are you sure you want to delete ${deleteCatName}?`} 
                onConfirm={() => { if(deleteCatName) deleteCategory(deleteCatName); setDeleteCatName(null); }} 
                onCancel={() => setDeleteCatName(null)} 
            />
        </div>
    ); 
};

// --- USER MANAGER (With Search Bar) ---
const UserManagerView = ({ setToast }: { setToast: (msg: string) => void }) => { 
    const { users, deleteUser, toggleUserStatus } = useCMS(); 
    const [search, setSearch] = useState('');
    const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto animate-fade-in space-y-8">
            <h2 className="text-3xl font-serif font-bold text-navy-900">User Management</h2>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-4 max-w-md">
                <Search size={20} className="text-gray-400" />
                <input 
                    placeholder="Search by Name or Email..." 
                    className="flex-1 outline-none text-navy-900 bg-white" 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                />
            </div>

            <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200 overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider border-b border-gray-200">
                        <tr>
                            <th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Status</th><th className="p-4">Joined</th><th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="p-4 font-medium text-navy-900">{u.name}</td>
                                <td className="p-4 text-sm text-gray-600">{u.email}</td>
                                <td className="p-4"><span className={`text-xs font-bold px-2 py-1 rounded ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{u.role.toUpperCase()}</span></td>
                                <td className="p-4"><span className={`text-xs font-bold px-2 py-1 rounded ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                                <td className="p-4 text-sm text-gray-500">{new Date(u.joinDate).toLocaleDateString()}</td>
                                <td className="p-4 text-right">
                                    {u.role !== 'admin' && (
                                        <div className="flex gap-2 justify-end">
                                            <button onClick={() => { toggleUserStatus(u.id); setToast(`User ${u.isActive ? 'Deactivated' : 'Activated'}`); }} className="text-blue-600 hover:bg-blue-50 p-2 rounded">{u.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}</button>
                                            <button onClick={() => setDeleteUserId(u.id)} className="text-red-600 hover:bg-red-50 p-2 rounded"><Trash2 size={18}/></button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ConfirmModal 
                isOpen={!!deleteUserId} 
                title="Delete User?" 
                message="This action cannot be undone." 
                onConfirm={() => { if(deleteUserId) deleteUser(deleteUserId); setDeleteUserId(null); }} 
                onCancel={() => setDeleteUserId(null)} 
            />
        </div>
    ); 
};

const AdminSettingsView = ({ setToast }: { setToast: (msg: string) => void }) => { 
    const { adminCredentials, updateAdminCredentials } = useCMS(); 
    const [creds, setCreds] = useState(adminCredentials); 
    const [showPass, setShowPass] = useState(false);

    return (
        <div className="max-w-2xl mx-auto animate-fade-in space-y-8 pb-10">
            <div className="text-center">
                <h2 className="text-4xl font-serif font-bold text-navy-900 mb-2">Admin Access</h2>
                <p className="text-gray-500 text-sm">Securely manage your administrator credentials.</p>
            </div>

            <div className="bg-white p-10 shadow-xl rounded-2xl border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-navy-900 via-gold-500 to-navy-900"></div>
                
                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 bg-navy-50 rounded-full flex items-center justify-center mb-4 border border-navy-100">
                        <Shield size={32} className="text-navy-900" />
                    </div>
                    <h3 className="text-lg font-bold text-navy-900 uppercase tracking-widest">Security Settings</h3>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase mb-2 text-gray-500 tracking-widest">Admin Email</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Users className="text-gray-400 group-focus-within:text-gold-600 transition-colors" size={18} />
                            </div>
                            <input 
                                className="w-full border border-gray-200 rounded-lg p-4 pl-12 bg-gray-50 focus:bg-white text-navy-900 outline-none focus:border-navy-900 transition-all font-medium" 
                                value={creds.email} 
                                onChange={e => setCreds({...creds, email: e.target.value})} 
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold uppercase mb-2 text-gray-500 tracking-widest">New Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="text-gray-400 group-focus-within:text-gold-600 transition-colors" size={18} />
                            </div>
                            <input 
                                className="w-full border border-gray-200 rounded-lg p-4 pl-12 pr-12 bg-gray-50 focus:bg-white text-navy-900 outline-none focus:border-navy-900 transition-all font-medium" 
                                type={showPass ? "text" : "password"} 
                                value={creds.pass} 
                                placeholder="Enter new password to update"
                                onChange={e => setCreds({...creds, pass: e.target.value})} 
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-navy-900"
                            >
                                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 ml-1 flex items-center">
                            <Info size={10} className="mr-1"/> Leave blank to keep current password.
                        </p>
                    </div>

                    <button 
                        onClick={() => { updateAdminCredentials(creds); setToast('Credentials Updated Successfully'); }} 
                        className="w-full bg-navy-900 text-white py-4 rounded-lg font-bold uppercase text-xs tracking-widest hover:bg-gold-600 transition-all shadow-lg hover:shadow-xl flex justify-center items-center group"
                    >
                        Update Credentials <ArrowLeft className="ml-2 rotate-180 group-hover:translate-x-1 transition-transform" size={16} />
                    </button>
                </div>
            </div>
        </div>
    ); 
};


// --- REVIEWS MANAGER ---
const ReviewsManagerView = ({ setToast }: { setToast: (msg: string) => void }) => {
    const { reviews, deleteReview } = useCMS();
    const [search, setSearch] = useState('');
    const [ratingFilter, setRatingFilter] = useState('All');
    const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);

    const filteredReviews = reviews.filter(r => {
        const matchesSearch = r.userName.toLowerCase().includes(search.toLowerCase()) || 
                              r.productName?.toLowerCase().includes(search.toLowerCase()) ||
                              r.comment.toLowerCase().includes(search.toLowerCase());
        const matchesRating = ratingFilter === 'All' || r.rating === Number(ratingFilter);
        return matchesSearch && matchesRating;
    });

    return (
        <div className="max-w-7xl mx-auto animate-fade-in space-y-8">
            <h2 className="text-3xl font-serif font-bold text-navy-900">Product Reviews</h2>
            
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col md:flex-row items-center gap-4">
                 <div className="flex items-center flex-1 w-full border border-gray-300 rounded px-3">
                     <Search size={20} className="text-gray-400 mr-3" />
                     <input placeholder="Search reviews..." className="flex-1 py-3 outline-none text-navy-900 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
                 </div>
                 <select className="w-full md:w-48 border border-gray-300 rounded px-3 py-3 bg-white text-navy-900 outline-none" value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}>
                     <option value="All">All Ratings</option>
                     <option value="5">5 Stars</option>
                     <option value="4">4 Stars</option>
                     <option value="3">3 Stars</option>
                     <option value="2">2 Stars</option>
                     <option value="1">1 Star</option>
                 </select>
            </div>

            <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200 overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider border-b border-gray-200">
                        <tr>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Product</th>
                            <th className="p-4">Rating</th>
                            <th className="p-4">Review</th>
                            <th className="p-4">Image</th>
                            <th className="p-4">Date</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredReviews.length === 0 ? (
                            <tr><td colSpan={7} className="p-8 text-center text-gray-400 italic">No reviews found matching filters.</td></tr>
                        ) : (
                            filteredReviews.map(review => (
                                <tr key={review.id} className="hover:bg-gray-50 align-top">
                                    <td className="p-4">
                                        <p className="font-bold text-navy-900 text-sm">{review.userName}</p>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-navy-900">{review.productName}</td>
                                    <td className="p-4">
                                        <div className="flex text-gold-500">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "text-gold-500" : "text-gray-300"} />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600 max-w-xs">{review.comment}</td>
                                    <td className="p-4">
                                        {review.image ? (
                                            <div className="w-16 h-16 rounded border border-gray-200 overflow-hidden cursor-pointer hover:scale-150 transition-transform origin-center z-10 relative bg-white">
                                                <img src={review.image} alt="Review" className="w-full h-full object-cover" />
                                            </div>
                                        ) : <span className="text-gray-400 text-xs">-</span>}
                                    </td>
                                    <td className="p-4 text-xs text-gray-500">{review.date}</td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => setDeleteReviewId(review.id)} className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <ConfirmModal 
                isOpen={!!deleteReviewId} 
                title="Delete Review?" 
                message="Are you sure you want to delete this review?" 
                onConfirm={() => { if(deleteReviewId) deleteReview(deleteReviewId); setDeleteReviewId(null); }} 
                onCancel={() => setDeleteReviewId(null)} 
            />
        </div>
    );
};

// --- PRODUCT MANAGER (With Bulk CSV Import/Export & Filters & SIZE GRID) ---
const ProductManagerView = ({ setToast }: { setToast: (msg: string) => void }) => { 
    const { products, addProduct, updateProduct, deleteProduct, categories, bulkDeleteProducts, importProducts } = useCMS(); 
    const [search, setSearch] = useState(''); 
    const [filterCategory, setFilterCategory] = useState('All'); 
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [editProduct, setEditProduct] = useState<Partial<Product>>({}); 
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null); 
    const [showBulkConfirm, setShowBulkConfirm] = useState(false); 
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]); 
    const [newImageUrl, setNewImageUrl] = useState(''); 
    const fileInputRef = useRef<HTMLInputElement>(null); 
    const additionalImageInputRef = useRef<HTMLInputElement>(null);
    const csvInputRef = useRef<HTMLInputElement>(null);

    // Initial Size Stock State for Form
    const [sizeStockInput, setSizeStockInput] = useState<{ [key: string]: number }>({});

    const filteredProducts = products.filter(p => { 
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()); 
        const matchesCategory = filterCategory === 'All' || p.category === filterCategory; 
        return matchesSearch && matchesCategory; 
    }); 

    const handleSave = async () => { 
        if (!editProduct.name || !editProduct.price || !editProduct.category) { setToast('Please fill required fields'); return; } 
        
        // Calculate Total Stock from Size Inputs
        let totalStock = 0;
        Object.values(sizeStockInput).forEach(val => totalStock += Number(val));

        const finalProductData = {
            ...editProduct,
            stock: totalStock, // Total is sum of sizes
            sizeStock: sizeStockInput // Specific size data
        };

        if (editProduct.id) { 
            await updateProduct(editProduct.id, finalProductData); 
            setToast('Product Updated'); 
        } 
        else { 
            const newP: Product = { 
                id: Date.now(), 
                name: editProduct.name!, 
                category: editProduct.category!, 
                subCategory: editProduct.subCategory || '', 
                price: Number(editProduct.price), 
                discountPrice: editProduct.discountPrice ? Number(editProduct.discountPrice) : undefined, 
                image: editProduct.image || 'https://via.placeholder.com/400', 
                images: editProduct.images || [], 
                description: editProduct.description || '', 
                material: editProduct.material || '', 
                rating: 5, 
                stock: totalStock,
                sizeStock: sizeStockInput 
            }; 
            await addProduct(newP); 
        } 
        setIsModalOpen(false); 
    }; 
    
    const openModal = (p?: Product) => { 
        if (p) { 
            setEditProduct({ ...p }); 
            setSizeStockInput(p.sizeStock || {}); // Load existing sizes
        } else { 
            setEditProduct({ name: '', category: Object.keys(categories)[0] || '', subCategory: '', price: 0, stock: 0, description: '', image: '', images: [] }); 
            setSizeStockInput({}); // Reset sizes
        } 
        setIsModalOpen(true); 
    }; 

    const handleSizeStockChange = (size: string, qty: string) => {
        setSizeStockInput(prev => ({
            ...prev,
            [size]: Number(qty)
        }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isAdditional = false) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => { if (isAdditional) { const currentImages = editProduct.images || []; setEditProduct(prev => ({...prev, images: [...currentImages, reader.result as string]})); } else { setEditProduct(prev => ({ ...prev, image: reader.result as string })); } }; reader.readAsDataURL(file); } }; 
    const addAdditionalImage = () => { if(newImageUrl) { const currentImages = editProduct.images || []; setEditProduct(prev => ({...prev, images: [...currentImages, newImageUrl]})); setNewImageUrl(''); } }; 
    const removeAdditionalImage = (index: number) => { const currentImages = editProduct.images || []; const newImages = currentImages.filter((_, i) => i !== index); setEditProduct(prev => ({...prev, images: newImages})); }; 
    const toggleSelect = (id: number) => { setSelectedProducts(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id] ); }; 
    const handleBulkDelete = () => { setShowBulkConfirm(true); }; 
    const performBulkDelete = async () => { await bulkDeleteProducts(selectedProducts); setSelectedProducts([]); setToast(`${selectedProducts.length} Products Deleted`); setShowBulkConfirm(false); }; 

    // --- CSV EXPORT HANDLER (Download All or Selected) ---
    const handleExportCSV = () => {
        const productsToExport = selectedProducts.length > 0 ? products.filter(p => selectedProducts.includes(p.id)) : products;
        if (productsToExport.length === 0) { setToast('No products to export.'); return; }
        const headers = ["name", "category", "subCategory", "price", "stock", "image", "description", "material"];
        const productRows = productsToExport.map(p => {
            const safeString = (str: any) => `"${String(str || '').replace(/"/g, '""')}"`; 
            return [safeString(p.name), safeString(p.category), safeString(p.subCategory), p.price, p.stock, safeString(p.image), safeString(p.description), safeString(p.material)].join(",");
        });
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...productRows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        const filename = selectedProducts.length > 0 ? "selected_products.csv" : "all_products.csv";
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setToast(`Exported ${productsToExport.length} products to CSV.`);
    };

    const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (evt) => {
            const text = evt.target?.result as string;
            const rows = text.split(/\r?\n/).map(row => row.split(','));
            let startIndex = -1;
            for(let i=0; i<rows.length; i++) { if(rows[i][0] && rows[i][0].toLowerCase().trim() === 'name') { startIndex = i + 1; break; } }
            if (startIndex === -1) startIndex = 0; 
            const productsToImport: Partial<Product>[] = [];
            for (let i = startIndex; i < rows.length; i++) {
                const row = rows[i];
                if (row.length < 4 || !row[0]) continue; 
                productsToImport.push({
                    name: row[0]?.trim(), category: row[1]?.trim(), subCategory: row[2]?.trim() || '', price: Number(row[3]?.trim()) || 0, stock: Number(row[4]?.trim()) || 0, image: row[5]?.trim() || 'https://via.placeholder.com/400', description: row[6]?.trim() || 'Imported Product', material: row[7]?.trim() || 'Standard'
                });
            }
            if (productsToImport.length > 0) { await importProducts(productsToImport); } else { setToast('No valid products found in CSV. Check format.'); }
            if(csvInputRef.current) csvInputRef.current.value = '';
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-3xl font-serif font-bold text-navy-900">Product Management</h2>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={handleExportCSV} className="bg-gray-100 text-gray-600 border border-gray-300 px-4 py-3 rounded hover:bg-gray-200 flex items-center uppercase text-xs font-bold tracking-wider shadow-sm"><Download size={16} className="mr-2"/> {selectedProducts.length > 0 ? 'Export Selected' : 'Export All'}</button>
                    <button onClick={() => csvInputRef.current?.click()} className="bg-green-600 text-white px-4 py-3 rounded hover:bg-green-700 flex items-center uppercase text-xs font-bold tracking-wider shadow-sm"><Upload size={16} className="mr-2"/> Import CSV</button>
                    <input type="file" ref={csvInputRef} className="hidden" accept=".csv, text/csv" onChange={handleCSVUpload} />
                    <button onClick={() => openModal()} className="bg-navy-900 text-white px-6 py-3 rounded hover:bg-gold-600 flex items-center uppercase text-xs font-bold tracking-wider shadow-sm"><Plus size={16} className="mr-2"/> Add Product</button>
                </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center flex-1 w-full border border-gray-300 rounded px-3">
                    <Search size={20} className="text-gray-400 mr-3" />
                    <input placeholder="Search products..." className="flex-1 py-3 outline-none text-navy-900 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="w-full md:w-48 border border-gray-300 rounded px-3 py-3 bg-white text-navy-900 outline-none" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                    <option value="All">All Categories</option>
                    {Object.keys(categories).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {selectedProducts.length > 0 && (<div className="bg-red-50 border border-red-100 p-4 rounded flex justify-between items-center"><span className="text-red-800 font-bold">{selectedProducts.length} Selected</span><button onClick={handleBulkDelete} className="text-red-600 hover:text-red-800 font-bold text-xs uppercase">Delete Selected</button></div>)}
            
            <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200 overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider border-b border-gray-200">
                        <tr><th className="p-4 w-10"><input type="checkbox" onChange={(e) => { if (e.target.checked) setSelectedProducts(filteredProducts.map(p => p.id)); else setSelectedProducts([]); }} checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0} /></th><th className="p-4">Image</th><th className="p-4">Name</th><th className="p-4">Category</th><th className="p-4">Price</th><th className="p-4">Total Stock</th><th className="p-4 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredProducts.map(p => {
                            // Logic: Check if total stock is low OR any single size variant is <= 10
                            const isLowStock = p.stock <= 10 || (p.sizeStock && Object.values(p.sizeStock).some(qty => Number(qty) <= 10));

                            return (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="p-4"><input type="checkbox" checked={selectedProducts.includes(p.id)} onChange={() => toggleSelect(p.id)} /></td>
                                <td className="p-4"><img src={p.image} alt="" className="w-12 h-16 object-cover rounded" /></td>
                                <td className="p-4 font-medium text-navy-900">{p.name}</td>
                                <td className="p-4 text-sm text-gray-500">{p.category} / {p.subCategory}</td>
                                <td className="p-4 font-bold text-navy-900">₹{p.discountPrice || p.price}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${isLowStock ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                        {p.stock}
                                    </span>
                                </td>
                                <td className="p-4 text-right"><div className="flex gap-2 justify-end"><button onClick={() => openModal(p)} className="text-blue-600 p-2 hover:bg-blue-50 rounded"><Edit size={16}/></button><button onClick={() => setDeleteConfirm(p.id)} className="text-red-600 p-2 hover:bg-red-50 rounded"><Trash2 size={16}/></button></div></td>
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>
             {isModalOpen && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl"><div className="flex justify-between items-center mb-6 border-b pb-4"><h3 className="text-2xl font-serif font-bold text-navy-900">{editProduct.id ? 'Edit Product' : 'Add New Product'}</h3><button onClick={() => setIsModalOpen(false)}><X className="text-gray-400 hover:text-red-500" /></button></div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="md:col-span-2"><label className="text-xs font-bold uppercase text-gray-500">Product Name</label><input className="w-full border border-gray-300 p-3 rounded mt-1 bg-white text-navy-900 outline-none focus:border-navy-900" value={editProduct.name} onChange={e => setEditProduct({...editProduct, name: e.target.value})} /></div>
                 <div><label className="text-xs font-bold uppercase text-gray-500">Category</label><select className="w-full border border-gray-300 p-3 rounded mt-1 bg-white text-navy-900 outline-none focus:border-navy-900" value={editProduct.category} onChange={e => setEditProduct({...editProduct, category: e.target.value, subCategory: ''})}>{Object.keys(categories).map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                 <div><label className="text-xs font-bold uppercase text-gray-500">Sub Category</label><select className="w-full border border-gray-300 p-3 rounded mt-1 bg-white text-navy-900 outline-none focus:border-navy-900" value={editProduct.subCategory} onChange={e => setEditProduct({...editProduct, subCategory: e.target.value})}><option value="">Select</option>{categories[editProduct.category!]?.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                 <div><label className="text-xs font-bold uppercase text-gray-500">Price</label><input type="number" className="w-full border border-gray-300 p-3 rounded mt-1 bg-white text-navy-900 outline-none focus:border-navy-900" value={editProduct.price} onChange={e => setEditProduct({...editProduct, price: Number(e.target.value)})} /></div>
                 <div><label className="text-xs font-bold uppercase text-gray-500">Discount Price</label><input type="number" className="w-full border border-gray-300 p-3 rounded mt-1 bg-white text-navy-900 outline-none focus:border-navy-900" value={editProduct.discountPrice || ''} onChange={e => setEditProduct({...editProduct, discountPrice: Number(e.target.value)})} /></div>
                 
                {/* SIZE STOCK GRID */}
                 <div className="md:col-span-2 bg-gray-50 p-4 rounded border border-gray-200">
                     <label className="text-xs font-bold uppercase text-navy-900 mb-2 block">Size Inventory</label>
                     <div className="grid grid-cols-4 gap-4">
                         {AVAILABLE_SIZES.map(size => (
                             <div key={size}>
                                 <label className="block text-[10px] uppercase text-gray-500 mb-1">{size}</label>
                                 <input 
                                    type="number" 
                                    className="w-full border border-gray-300 p-2 rounded text-center text-navy-900" 
                                    value={sizeStockInput[size] || ''} 
                                    placeholder="0"
                                    onChange={(e) => handleSizeStockChange(size, e.target.value)}
                                 />
                             </div>
                         ))}
                     </div>
                     <p className="text-[10px] text-gray-400 mt-2 text-right">
                        Total Stock: {Object.values(sizeStockInput).reduce((a: number, b: any) => a + Number(b), 0)}
                     </p>
                 </div>

                 <div><label className="text-xs font-bold uppercase text-gray-500">Material</label><input className="w-full border border-gray-300 p-3 rounded mt-1 bg-white text-navy-900 outline-none focus:border-navy-900" value={editProduct.material} onChange={e => setEditProduct({...editProduct, material: e.target.value})} /></div>
                 
                 <div className="md:col-span-2"><label className="text-xs font-bold uppercase text-gray-500">Main Image</label><div className="flex gap-4 mt-1 items-start"><div className="flex-1"><div className="flex gap-2 mb-2"><input type="text" className="flex-1 border border-gray-300 p-3 rounded bg-white text-navy-900 outline-none focus:border-navy-900" value={editProduct.image} onChange={e => setEditProduct({...editProduct, image: e.target.value})} placeholder="Image URL" /><button onClick={() => fileInputRef.current?.click()} className="px-4 bg-gray-100 rounded border border-gray-300 hover:bg-gray-200 text-gray-600"><Upload size={20}/></button></div><input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => handleImageUpload(e, false)} /></div>{editProduct.image && (<div className="w-20 h-20 border rounded overflow-hidden flex-shrink-0"><img src={editProduct.image} alt="Main" className="w-full h-full object-cover" /></div>)}</div></div>
                 <div className="md:col-span-2"><label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Additional Images</label><div className="grid grid-cols-4 gap-4 mb-4">{editProduct.images && editProduct.images.map((img, idx) => (<div key={idx} className="relative group border rounded overflow-hidden aspect-square"><img src={img} className="w-full h-full object-cover" alt={`Sub ${idx}`} /><button onClick={() => removeAdditionalImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button></div>))}</div><div className="flex gap-2 items-center"><input type="text" className="flex-1 border border-gray-300 p-3 rounded bg-white text-navy-900 outline-none focus:border-navy-900" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} placeholder="Add Image URL" /><button onClick={() => additionalImageInputRef.current?.click()} className="px-4 py-3 bg-gray-100 rounded border border-gray-300 hover:bg-gray-200 text-gray-600"><Upload size={20}/></button><button onClick={addAdditionalImage} className="px-4 py-3 bg-navy-900 text-white rounded font-bold uppercase text-xs">Add</button><input type="file" ref={additionalImageInputRef} className="hidden" accept="image/*" onChange={e => handleImageUpload(e, true)} /></div></div>
                 
                 <div className="md:col-span-2"><label className="text-xs font-bold uppercase text-gray-500">Description</label><textarea className="w-full border border-gray-300 p-3 rounded mt-1 h-24 bg-white text-navy-900 outline-none focus:border-navy-900" value={editProduct.description} onChange={e => setEditProduct({...editProduct, description: e.target.value})} /></div>
             </div><div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100"><button onClick={() => setIsModalOpen(false)} className="px-6 py-3 border border-gray-300 rounded text-gray-600 bg-white font-bold uppercase text-xs tracking-wider hover:bg-gray-50">Cancel</button><button onClick={handleSave} className="px-8 py-3 bg-navy-900 text-white rounded font-bold uppercase text-xs tracking-wider hover:bg-gold-600 shadow-lg">Save Product</button></div></div></div>)}<ConfirmModal isOpen={!!deleteConfirm} title="Delete Product?" message="This action cannot be undone." onConfirm={async () => { if(deleteConfirm) await deleteProduct(deleteConfirm); setDeleteConfirm(null); }} onCancel={() => setDeleteConfirm(null)} /><ConfirmModal isOpen={showBulkConfirm} title="Delete Multiple Products?" message={`Are you sure you want to delete ${selectedProducts.length} selected products? This action cannot be undone.`} onConfirm={performBulkDelete} onCancel={() => setShowBulkConfirm(false)} />
        </div>
    ); 
};

// --- UPDATED PDF INVOICE (Fixed X Position) ---
const InvoiceTemplate = ({ order, globalSettings, contactContent, onClose }: { order: Order, globalSettings: any, contactContent: ContactContent, onClose: () => void }) => {
    const subtotal = order.items.reduce((acc, item) => acc + (item.discountPrice || item.price) * item.quantity, 0);

    return (
        <div className="fixed inset-0 bg-black/80 z-[100] overflow-y-auto flex items-center justify-center p-4 print:p-0 print:bg-white print:static print:block">
             <style>
                {`
                @media print {
                    body { visibility: hidden; }
                    .invoice-modal { 
                        visibility: visible; 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 100%; 
                        margin: 0; 
                        padding: 20px;
                        background: white; 
                        z-index: 9999; 
                        box-shadow: none;
                        border: none;
                    }
                    .invoice-modal * { visibility: visible; }
                    .no-print { display: none !important; }
                    @page { margin: 0; size: A4; }
                }
                `}
            </style>
            
            <div className="invoice-modal bg-white w-[210mm] min-h-[297mm] mx-auto shadow-2xl relative font-sans text-navy-900 flex flex-col box-border p-10 print:shadow-none">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-red-100 rounded-full text-gray-600 hover:text-red-600 transition-all z-50 print:hidden border border-gray-200" title="Close Invoice"><X size={24} /></button>
                <div className="flex justify-between items-start mb-8"><div className="w-1/3">{globalSettings.logoUrl && (<img src={globalSettings.logoUrl} alt="Logo" className="h-24 w-auto object-contain mb-4" />)}</div><div className="w-1/2 text-right text-sm"><h2 className="font-bold text-lg uppercase mb-1">{globalSettings.siteName}</h2><div className="whitespace-pre-wrap text-gray-600 mb-1">{contactContent.address}</div><div className="text-gray-600">{contactContent.email}</div><div className="text-gray-600">{contactContent.phone}</div></div></div>
                <div className="mb-8"><h1 className="text-3xl font-bold uppercase tracking-wider">INVOICE</h1></div>
                <div className="grid grid-cols-3 gap-8 mb-8 text-sm"><div><h3 className="font-bold uppercase mb-2">Bill To:</h3>{order.billingDetails ? (<div className="text-gray-700 leading-relaxed"><p className="font-bold">{order.billingDetails.firstName} {order.billingDetails.lastName}</p><p>{order.billingDetails.address}</p><p>{order.billingDetails.city}, {order.billingDetails.state}</p><p>{order.billingDetails.pincode}</p><p className="mt-1">{order.billingDetails.phone}</p></div>) : <p>Guest</p>}</div><div><h3 className="font-bold uppercase mb-2">Ship To:</h3>{order.shippingDetails ? (<div className="text-gray-700 leading-relaxed"><p className="font-bold">{order.shippingDetails.firstName} {order.shippingDetails.lastName}</p><p>{order.shippingDetails.address}</p><p>{order.shippingDetails.city}, {order.shippingDetails.state}</p><p>{order.shippingDetails.pincode}</p><p className="mt-1">{order.shippingDetails.phone}</p></div>) : <p>Same as Billing</p>}</div><div className="text-right"><div className="mb-2"><span className="font-bold block">Invoice Number:</span><span>{order.id.replace('ORD-', 'INV-')}</span></div><div className="mb-2"><span className="font-bold block">Invoice Date:</span><span>{order.date}</span></div><div className="mb-2"><span className="font-bold block">Order Number:</span><span>{order.id}</span></div><div className="mb-2"><span className="font-bold block">Payment Method:</span><span>{order.paymentMethod}</span></div></div></div>
                <table className="w-full mb-8 border-collapse"><thead><tr className="bg-black text-white text-sm font-bold uppercase"><th className="py-2 px-3 text-left">Product</th><th className="py-2 px-3 text-right">Quantity</th><th className="py-2 px-3 text-right">Price</th></tr></thead><tbody className="text-sm border-b border-gray-300">{order.items.map((item, i) => (<tr key={i} className="border-b border-gray-200"><td className="py-3 px-3"><p className="font-bold">{item.name}</p><p className="text-xs text-gray-500">Size: {item.selectedSize || 'N/A'}</p></td><td className="py-3 px-3 text-right">{item.quantity}</td><td className="py-3 px-3 text-right">₹{(item.discountPrice || item.price).toFixed(2)}</td></tr>))}</tbody></table>
                <div className="flex justify-end mb-12"><div className="w-1/2 max-w-xs"><div className="flex justify-between py-2 border-b border-gray-200 text-sm"><span className="font-bold">Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div><div className="flex justify-between py-2 border-b border-gray-200 text-sm"><span className="font-bold">Shipping</span><span>{order.total > subtotal ? `₹${(order.total - subtotal).toFixed(2)}` : 'Free'}</span></div><div className="flex justify-between py-2 border-b border-black text-lg font-bold mt-1"><span>Total</span><span>₹{order.total.toFixed(2)}</span></div></div></div>
                <div className="mt-auto text-center text-sm text-gray-600 pt-8 border-t border-gray-200"><p className="mb-2 font-bold">Thank you for shopping with {globalSettings.siteName}!</p><p className="text-xs">All sales are subject to our Terms & Conditions and Return Policy.</p><p className="text-xs mt-1">Contact: {contactContent.email} | {contactContent.phone}</p></div>
                <div className="absolute bottom-8 right-8 no-print flex gap-4"><button onClick={onClose} className="px-6 py-3 bg-gray-200 text-gray-700 rounded shadow hover:bg-gray-300 font-bold text-xs uppercase tracking-wider">Close</button><button onClick={() => window.print()} className="bg-navy-900 text-white px-8 py-3 rounded shadow-xl flex items-center uppercase text-xs font-bold tracking-wider hover:bg-gold-600"><Printer size={18} className="mr-3"/> Print Invoice</button></div>
            </div>
        </div>
    );
};

// --- UPDATED PACKING SLIP ---
const PackingSlipTemplate = ({ order, globalSettings, onClose }: { order: Order, globalSettings: any, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/80 z-[100] overflow-y-auto flex items-center justify-center p-4 print:p-0 print:bg-white print:static print:block">
        <style>{`@media print { body { visibility: hidden; } .packing-modal { visibility: visible; position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; background: white; z-index: 9999; border: none; box-shadow: none; } .packing-modal * { visibility: visible; } .no-print { display: none !important; } @page { size: A5; margin: 0; } }`}</style>
        <div className="packing-modal bg-white w-[148mm] min-h-[210mm] shadow-2xl relative font-sans text-navy-900 p-8 flex flex-col border border-gray-200 print:border-none print:shadow-none">
             <div className="flex justify-between items-start mb-6"><div className="w-20">{globalSettings.logoUrl && <img src={globalSettings.logoUrl} alt="Logo" className="w-full h-auto object-contain" />}</div><div className="text-right text-xs"><h1 className="font-bold uppercase">{globalSettings.siteName}</h1><p>Bangalore, India</p></div></div>
             <h2 className="text-xl font-bold uppercase mb-6 border-b-2 border-black pb-2">PACKING SLIP</h2>
             <div className="grid grid-cols-2 gap-4 mb-6 text-xs"><div><h3 className="font-bold uppercase mb-1">Ship To:</h3>{order.shippingDetails ? (<div><p>{order.shippingDetails.firstName} {order.shippingDetails.lastName}</p><p>{order.shippingDetails.address}</p><p>{order.shippingDetails.city}, {order.shippingDetails.state}</p><p>{order.shippingDetails.pincode}</p></div>) : <p>Same as Billing</p>}</div><div className="text-right"><p><span className="font-bold">Order #:</span> {order.id}</p><p><span className="font-bold">Date:</span> {order.date}</p><p><span className="font-bold">Method:</span> Standard</p></div></div>
             <table className="w-full border-collapse mb-6"><thead><tr className="bg-black text-white text-xs uppercase font-bold"><th className="py-1 px-2 text-left">Product</th><th className="py-1 px-2 text-right">Qty</th></tr></thead><tbody className="text-xs border-b border-black">{order.items.map((item, i) => (<tr key={i} className="border-b border-gray-200"><td className="py-2 px-2"><p className="font-bold">{item.name}</p><p className="text-[10px] text-gray-500">Size: {item.selectedSize || 'N/A'}</p></td><td className="py-2 px-2 text-right font-bold">{item.quantity}</td></tr>))}</tbody></table>
             <div className="mt-auto pt-4 border-t border-gray-300 text-center text-[10px] text-gray-500"><p>Thank you for shopping with {globalSettings.siteName}!</p><p>For support: support@neela.com</p></div>
            <div className="absolute bottom-4 left-4 no-print flex gap-2"><button onClick={onClose} className="bg-gray-200 text-gray-700 px-4 py-2 rounded shadow uppercase text-[10px] font-bold tracking-wider hover:bg-gray-300">Close</button><button onClick={() => window.print()} className="bg-navy-900 text-white px-4 py-2 rounded shadow flex items-center uppercase text-[10px] font-bold tracking-wider hover:bg-gold-600"><Printer size={14} className="mr-2"/> Print Slip</button></div>
        </div>
    </div>
);

// --- ORDER MANAGER (With Filters & Custom Delete Modal & NOTES DISPLAY) ---
const OrderManagerView = ({ setToast }: { setToast: (msg: string) => void }) => {
    const { orders, updateOrderStatus, cancelOrder, deleteOrder, globalSettings, contactContent } = useCMS();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showInvoice, setShowInvoice] = useState(false);
    const [showPackingSlip, setShowPackingSlip] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const filteredOrders = orders.filter(o => {
        const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase()) || o.userName.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
        const matchesDate = !dateFilter || o.date.includes(dateFilter); 
        return matchesSearch && matchesStatus && matchesDate;
    });

    const handleConfirmDelete = () => {
        if (!deleteConfirmId) return;
        const orderToDelete = orders.find(o => o.id === deleteConfirmId);
        if (orderToDelete) {
            if (orderToDelete.status === 'Delivered' || orderToDelete.status === 'Cancelled') { deleteOrder(deleteConfirmId); } else { cancelOrder(deleteConfirmId); }
        }
        setDeleteConfirmId(null);
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-navy-900">Order Management</h2>
             <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center flex-1 w-full border border-gray-300 rounded px-3">
                    <Search size={20} className="text-gray-400 mr-3" />
                    <input placeholder="Search Order ID or Name..." className="flex-1 py-3 outline-none text-navy-900 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="w-full md:w-40 border border-gray-300 rounded px-3 py-3 bg-white text-navy-900 outline-none" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
                <input type="date" className="w-full md:w-40 border border-gray-300 rounded px-3 py-3 bg-white text-navy-900 outline-none" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
            </div>

            <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200 overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                   <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider border-b border-gray-200">
                      <tr><th className="p-4">Order ID</th><th className="p-4">Customer</th><th className="p-4">Date</th><th className="p-4">Total</th><th className="p-4">Items</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                       {filteredOrders.length === 0 ? (
                           <tr><td colSpan={7} className="p-8 text-center text-gray-400 italic">No orders found.</td></tr>
                       ) : (
                           filteredOrders.map(o => (
                               <tr key={o.id} className="hover:bg-gray-50 group">
                                   <td className="p-4 font-mono font-bold text-navy-900">{o.id}</td>
                                   <td className="p-4">{o.userName}</td>
                                   <td className="p-4 text-sm text-gray-500">{o.date}</td>
                                   <td className="p-4 font-bold text-navy-900">₹{o.total}</td>
                                   <td className="p-4 text-sm text-gray-500">{o.items.length} Items</td>
                                   <td className="p-4"><select value={o.status} disabled={o.status === 'Cancelled'} onChange={(e) => { updateOrderStatus(o.id, e.target.value as Order['status']); setToast('Order Updated'); }} className={`border rounded px-2 py-1 text-sm font-bold outline-none cursor-pointer bg-white ${o.status === 'Delivered' ? 'text-green-600 border-green-200 bg-green-50' : o.status === 'Cancelled' ? 'text-red-600 border-red-200 bg-red-50' : 'text-gold-600 border-gold-200 bg-gold-50'}`}>{['Pending','Processing','Shipped','Delivered','Cancelled'].map(s=><option key={s} value={s}>{s}</option>)}</select></td>
                                   <td className="p-4 text-right"><div className="flex gap-2 justify-end"><button onClick={() => setSelectedOrder(o)} className="text-blue-600 hover:bg-blue-50 p-2 rounded border border-blue-100 bg-white font-bold text-xs uppercase">View</button><button onClick={() => setDeleteConfirmId(o.id)} className="text-red-600 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button></div></td>
                               </tr>
                           ))
                       )}
                   </tbody>
                </table>
            </div>

            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <div><h3 className="text-xl font-bold text-navy-900">Order Details #{selectedOrder.id}</h3><span className="text-xs text-gray-500">{selectedOrder.date}</span></div>
                            <button onClick={() => setSelectedOrder(null)}><X className="text-gray-400 hover:text-red-500"/></button>
                        </div>
                        <div className="p-8 space-y-8">
                            {selectedOrder.notes && (<div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg"><h4 className="font-bold text-navy-900 uppercase text-xs tracking-widest mb-2 flex items-center"><Info size={14} className="mr-1"/> Customer Notes</h4><p className="text-sm text-gray-700 italic">"{selectedOrder.notes}"</p></div>)}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div className="border p-4 rounded-lg"><h4 className="font-bold text-navy-900 uppercase text-xs tracking-widest mb-4 border-b pb-2">Billing Details</h4>{selectedOrder.billingDetails ? (<div className="text-sm text-gray-600 space-y-1"><p className="font-bold text-navy-900">{selectedOrder.billingDetails.firstName} {selectedOrder.billingDetails.lastName}</p><p>{selectedOrder.billingDetails.email}</p><p>{selectedOrder.billingDetails.phone}</p><p>{selectedOrder.billingDetails.address}</p><p>{selectedOrder.billingDetails.city}, {selectedOrder.billingDetails.district}</p><p>{selectedOrder.billingDetails.state} - {selectedOrder.billingDetails.pincode}</p></div>) : <p className="text-gray-400 text-sm">Guest Checkout</p>}</div><div className="border p-4 rounded-lg"><h4 className="font-bold text-navy-900 uppercase text-xs tracking-widest mb-4 border-b pb-2">Shipping Details</h4>{selectedOrder.shippingDetails ? (<div className="text-sm text-gray-600 space-y-1"><p className="font-bold text-navy-900">{selectedOrder.shippingDetails.firstName} {selectedOrder.shippingDetails.lastName}</p><p>{selectedOrder.shippingDetails.email}</p><p>{selectedOrder.shippingDetails.phone}</p><p>{selectedOrder.shippingDetails.address}</p><p>{selectedOrder.shippingDetails.city}, {selectedOrder.shippingDetails.district}</p><p>{selectedOrder.shippingDetails.state} - {selectedOrder.shippingDetails.pincode}</p></div>) : <p className="text-gray-400 text-sm">Same as Billing</p>}</div></div>
                            <div>
                                <h4 className="font-bold text-navy-900 uppercase text-xs tracking-widest mb-4">Order Items</h4>
                                <table className="w-full text-left border rounded-lg overflow-hidden"><thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500"><tr><th className="p-3">Product</th><th className="p-3 text-right">Price</th><th className="p-3 text-center">Qty</th><th className="p-3 text-right">Total</th></tr></thead><tbody className="divide-y">{selectedOrder.items.map((item, idx) => (<tr key={idx}><td className="p-3"><div className="flex items-center gap-3"><img src={item.image} className="w-10 h-12 object-cover rounded" alt=""/><div className=""><p className="text-sm font-bold text-navy-900">{item.name}</p><p className="text-[10px] text-gray-500">{item.category} | {item.subCategory}</p>{item.selectedSize && <span className="text-[10px] bg-gray-200 px-2 rounded-full font-bold text-navy-900">Size: {item.selectedSize}</span>}</div></div></td><td className="p-3 text-right text-sm">₹{item.discountPrice || item.price}</td><td className="p-3 text-center text-sm">{item.quantity}</td><td className="p-3 text-right font-bold text-sm">₹{(item.discountPrice || item.price) * item.quantity}</td></tr>))}</tbody></table>
                            </div>
                            <div>
                                <h4 className="font-bold text-navy-900 uppercase text-xs tracking-widest mb-4">Documentation Actions</h4>
                                <div className="flex gap-4"><button onClick={() => setShowInvoice(true)} className="flex items-center px-6 py-3 border border-navy-900 text-navy-900 rounded hover:bg-navy-900 hover:text-white transition-colors font-bold text-xs uppercase tracking-wider bg-white"><FileText size={18} className="mr-2"/> PDF Invoice (A4)</button><button onClick={() => setShowPackingSlip(true)} className="flex items-center px-6 py-3 border border-navy-900 text-navy-900 rounded hover:bg-navy-900 hover:text-white transition-colors font-bold text-xs uppercase tracking-wider bg-white"><Package size={18} className="mr-2"/> PDF Packing Slip (Half Size)</button></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <ConfirmModal 
                isOpen={!!deleteConfirmId} 
                title={deleteConfirmId && orders.find(o => o.id === deleteConfirmId)?.status === 'Delivered' ? "Delete Order?" : "Cancel Order?"}
                message={deleteConfirmId && orders.find(o => o.id === deleteConfirmId)?.status === 'Delivered' 
                    ? "This action will permanently delete the record. This cannot be undone." 
                    : "This will mark the order as 'Cancelled'. Are you sure?"}
                onConfirm={handleConfirmDelete} 
                onCancel={() => setDeleteConfirmId(null)} 
            />

            {showInvoice && selectedOrder && <InvoiceTemplate order={selectedOrder} globalSettings={globalSettings} contactContent={contactContent} onClose={() => setShowInvoice(false)} />}
            {showPackingSlip && selectedOrder && <PackingSlipTemplate order={selectedOrder} globalSettings={globalSettings} onClose={() => setShowPackingSlip(false)} />}
        </div>
    );
};

// --- Admin Main Component ---
const Admin: React.FC = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { globalSettings } = useCMS();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  if (!isAuthenticated || !isAdmin) return <Navigate to="/login" />;

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden relative">
       <div className="md:hidden absolute top-0 left-0 right-0 h-16 bg-navy-900 flex items-center px-4 z-40 shadow-md"><button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white"><Menu size={24} /></button><span className="ml-4 text-white font-serif font-bold">{globalSettings.siteName} Admin</span></div>
       {isSidebarOpen && (<div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>)}
       <div className={`fixed md:static inset-y-0 left-0 w-64 bg-navy-900 text-white h-full flex-shrink-0 flex flex-col shadow-2xl z-40 no-print transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="p-8 border-b border-white/10 flex-shrink-0 hidden md:block"><h2 className="text-2xl font-serif font-bold text-gold-500 tracking-wide">{globalSettings.siteName}</h2><p className="text-sm tracking-[0.2em] text-gray-400 mt-2">Admin Console</p></div>
          <div className="p-4 flex justify-between items-center md:hidden border-b border-white/10"><span className="font-serif font-bold text-gold-500">Menu</span><button onClick={() => setIsSidebarOpen(false)}><X size={24} /></button></div>
          <nav className="p-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">{[{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'global', label: 'Global Settings', icon: Globe }, { id: 'home', label: 'Home Content', icon: FileText }, { id: 'about', label: 'About Content', icon: FileText }, { id: 'contact', label: 'Contact Content', icon: FileText }, { id: 'categories', label: 'Categories', icon: Layers }, { id: 'products', label: 'Products', icon: Package }, { id: 'users', label: 'Users', icon: Users }, { id: 'orders', label: 'Orders', icon: ShoppingCart }, { id: 'reviews', label: 'Reviews', icon: MessageSquare }, { id: 'settings', label: 'Admin Access', icon: Settings }].map((item) => (<button key={item.id} onClick={() => { setActiveTab(item.id as AdminTab); setIsSidebarOpen(false); }} className={`w-full flex items-center p-4 rounded-lg transition-all duration-300 font-medium ${activeTab === item.id ? 'bg-white text-navy-900 shadow-lg transform scale-105' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}><item.icon size={18} className={`mr-3 ${activeTab === item.id ? 'text-gold-600' : 'text-gray-400'}`} /> <span className="tracking-wide text-sm">{item.label}</span></button>))}</nav>
          <div className="p-4 border-t border-white/10 flex-shrink-0 space-y-2"><button onClick={() => navigate('/')} className="w-full flex items-center p-3 rounded hover:bg-navy-800 text-gold-400 transition-colors font-bold text-xs uppercase tracking-wider"><ArrowLeft size={18} className="mr-3" /> Back to Website</button><button onClick={logout} className="w-full flex items-center p-3 rounded hover:bg-red-900/30 text-red-300 transition-colors"><LogOut size={18} className="mr-3" /> Logout</button></div>
       </div>
       <div className="flex-1 p-4 pt-20 md:p-10 md:pt-10 overflow-y-auto h-full relative w-full">
           {activeTab === 'dashboard' && <DashboardView setTab={setActiveTab} />}
           {activeTab === 'global' && <GlobalSettingsView setToast={setToastMsg} />}
           {activeTab === 'home' && <HomeContentView setToast={setToastMsg} />}
           {activeTab === 'categories' && <CategoryManagerView setToast={setToastMsg} />}
           {activeTab === 'products' && <ProductManagerView setToast={setToastMsg} />}
           {activeTab === 'users' && <UserManagerView setToast={setToastMsg} />}
           {activeTab === 'orders' && <OrderManagerView setToast={setToastMsg} />}
           {activeTab === 'reviews' && <ReviewsManagerView setToast={setToastMsg} />}
           {activeTab === 'settings' && <AdminSettingsView setToast={setToastMsg} />}
           {activeTab === 'about' && <AboutContentView setToast={setToastMsg} />}
           {activeTab === 'contact' && <ContactContentView setToast={setToastMsg} />}
           {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
       </div>
    </div>
  );
};

export default Admin;