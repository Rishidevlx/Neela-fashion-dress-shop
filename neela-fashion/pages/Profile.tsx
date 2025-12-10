import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCMS } from '../context/CMSContext';
import { Package, User as UserIcon, Clock, CheckCircle, Award, ChevronRight, CreditCard, XCircle, Edit, Save, X } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import { INDIAN_STATES } from '../types';

const Profile: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { orders, updateUserProfile } = useCMS(); 
  const [isEditing, setIsEditing] = useState(false);
  
  // Local state for editing form
  const [editForm, setEditForm] = useState({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: ''
  });

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }

  const handleEditClick = () => {
      setEditForm({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          city: user.city || '',
          state: user.state || 'Tamil Nadu',
          pincode: user.pincode || ''
      });
      setIsEditing(true);
  };

  const handleSaveProfile = () => {
      updateUserProfile(user.id, editForm);
      setIsEditing(false);
  };

  // Filter orders for current user
  const myOrders = orders.filter(o => o.userId === String(user.id));

  return (
    <div className="min-h-screen bg-sand-50 pt-32 pb-20 relative">
      
      <div className="container mx-auto px-6 md:px-12">
        <h1 className="text-4xl font-serif text-navy-900 mb-8 text-center md:text-left">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left: Membership Card & Profile Info */}
          <div className="lg:col-span-4 space-y-8">
            {/* Luxury Card Design */}
            <div className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-xl p-8 text-white shadow-2xl relative overflow-hidden">
               {/* Background Texture */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -mr-16 -mt-16"></div>
               <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-10 -ml-10 -mb-10"></div>
               
               <div className="relative z-10">
                   <div className="flex justify-between items-start mb-12">
                       <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                           <UserIcon className="text-gold-400" size={24} />
                       </div>
                       <button onClick={handleEditClick} className="text-gold-400 hover:text-white transition-colors" title="Edit Profile">
                           <Edit size={18} />
                       </button>
                   </div>
                   
                   <div className="mb-8">
                       <h2 className="text-2xl font-serif tracking-wide mb-1">{user.name}</h2>
                       <p className="text-navy-200 text-sm font-light tracking-wider">{user.email}</p>
                       <p className="text-navy-200 text-sm font-light tracking-wider mt-1">{user.phone}</p>
                   </div>

                   {user.address && (
                       <div className="mb-8 border-t border-white/10 pt-4">
                           <p className="text-xs uppercase tracking-widest text-navy-300 mb-2">Saved Address</p>
                           <p className="text-sm font-light text-gray-300">{user.address}</p>
                           <p className="text-sm font-light text-gray-300">{user.city}, {user.state} - {user.pincode}</p>
                       </div>
                   )}
                   
                   <div className="flex justify-between items-end">
                       <div>
                           <p className="text-[9px] uppercase tracking-widest text-navy-300 mb-1">Member Since</p>
                           <p className="font-mono text-sm">{new Date(user.joinDate || Date.now()).toLocaleDateString()}</p>
                       </div>
                       <CreditCard size={24} className="text-white/20" />
                   </div>
               </div>
            </div>

            {/* Stats */}
            <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-100 grid grid-cols-2 gap-4">
                <div className="text-center p-4 border-r border-gray-100">
                    <p className="text-3xl font-serif text-navy-900">{myOrders.length}</p>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">Orders</p>
                </div>
                <div className="text-center p-4">
                    <p className="text-3xl font-serif text-navy-900">0</p>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">Returns</p>
                </div>
            </div>
          </div>

          {/* Right: Edit Form or Order History */}
          <div className="lg:col-span-8">
             {isEditing ? (
                 <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100 animate-fade-in">
                     <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                         <h3 className="text-2xl font-serif text-navy-900">Edit Profile</h3>
                         <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-red-500"><X size={24}/></button>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                             <label className="text-xs font-bold uppercase text-gray-500">Full Name</label>
                             <input className="w-full border border-gray-300 p-3 rounded focus:border-navy-900 outline-none bg-white text-navy-900" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                         </div>
                         <div className="space-y-2">
                             <label className="text-xs font-bold uppercase text-gray-500">Email Address</label>
                             <input className="w-full border border-gray-300 p-3 rounded focus:border-navy-900 outline-none bg-white text-navy-900" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                         </div>
                         <div className="space-y-2">
                             <label className="text-xs font-bold uppercase text-gray-500">Phone Number</label>
                             <input className="w-full border border-gray-300 p-3 rounded focus:border-navy-900 outline-none bg-white text-navy-900" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                         </div>
                         <div className="space-y-2 md:col-span-2">
                             <label className="text-xs font-bold uppercase text-gray-500">Address</label>
                             <input className="w-full border border-gray-300 p-3 rounded focus:border-navy-900 outline-none bg-white text-navy-900" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} />
                         </div>
                         <div className="space-y-2">
                             <label className="text-xs font-bold uppercase text-gray-500">City</label>
                             <input className="w-full border border-gray-300 p-3 rounded focus:border-navy-900 outline-none bg-white text-navy-900" value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} />
                         </div>
                         <div className="space-y-2">
                             <label className="text-xs font-bold uppercase text-gray-500">State</label>
                             <select className="w-full border border-gray-300 p-3 rounded focus:border-navy-900 outline-none bg-white text-navy-900" value={editForm.state} onChange={e => setEditForm({...editForm, state: e.target.value})}>
                                 {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                             </select>
                         </div>
                         <div className="space-y-2">
                             <label className="text-xs font-bold uppercase text-gray-500">Pincode</label>
                             <input className="w-full border border-gray-300 p-3 rounded focus:border-navy-900 outline-none bg-white text-navy-900" value={editForm.pincode} onChange={e => setEditForm({...editForm, pincode: e.target.value})} />
                         </div>
                     </div>
                     <div className="mt-8 flex justify-end gap-4">
                         <button onClick={() => setIsEditing(false)} className="px-6 py-3 border border-gray-300 rounded text-xs font-bold uppercase hover:bg-gray-50 bg-white">Cancel</button>
                         <button onClick={handleSaveProfile} className="px-8 py-3 bg-navy-900 text-white rounded text-xs font-bold uppercase hover:bg-gold-600 shadow-lg flex items-center"><Save size={16} className="mr-2" /> Save Changes</button>
                     </div>
                 </div>
             ) : (
               <>
                 <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-4">
                     <h3 className="text-2xl font-serif text-navy-900">Order History</h3>
                     <Link to="/shop" className="text-xs font-bold uppercase tracking-widest text-gold-600 hover:text-navy-900">Start Shopping</Link>
                 </div>
                 
                 {myOrders.length === 0 ? (
                   <div className="bg-white p-12 text-center border border-dashed border-gray-300 rounded-lg">
                     <Package size={48} className="mx-auto text-gray-300 mb-4" />
                     <p className="text-gray-500 text-lg font-light">You haven't placed any orders yet.</p>
                     <Link to="/shop" className="mt-4 inline-block text-navy-900 border-b border-navy-900 pb-0.5 hover:text-gold-600 hover:border-gold-600 transition-all">Browse Collection</Link>
                   </div>
                 ) : (
                   <div className="space-y-6">
                     {myOrders.map(order => (
                       <div key={order.id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100 overflow-hidden group">
                          <div className="bg-gray-50 px-6 py-4 flex flex-wrap justify-between items-center border-b border-gray-100">
                             <div className="flex gap-8">
                                 <div>
                                    <span className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Order Placed</span>
                                    <span className="text-sm font-medium text-navy-900">{order.date}</span>
                                 </div>
                                 <div>
                                    <span className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Total</span>
                                    <span className="text-sm font-medium text-navy-900">₹{order.total}</span>
                                 </div>
                             </div>
                             <div className="mt-2 sm:mt-0">
                                 <span className="font-mono text-sm text-gray-400">Order #{order.id}</span>
                             </div>
                          </div>

                          <div className="p-6">
                              {/* Order Status Bar */}
                              <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                                 {order.status === 'Delivered' ? (
                                     <span className="flex items-center text-green-600 text-sm font-bold bg-green-50 px-3 py-1 rounded-full">
                                         <CheckCircle size={16} className="mr-2" /> Delivered
                                     </span>
                                 ) : order.status === 'Cancelled' ? (
                                    <div className="flex items-center gap-4">
                                       <span className="flex items-center text-red-600 text-sm font-bold bg-red-50 px-3 py-1 rounded-full">
                                           <XCircle size={16} className="mr-2" /> Cancelled
                                       </span>
                                       {order.paymentMethod !== 'COD' && (
                                           <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full animate-pulse-slow">
                                               Your amount will be refunded within 24 hours.
                                           </span>
                                       )}
                                    </div>
                                 ) : (
                                     <span className="flex items-center text-gold-600 text-sm font-bold bg-gold-50 px-3 py-1 rounded-full">
                                         <Clock size={16} className="mr-2" /> {order.status}
                                     </span>
                                 )}
                              </div>

                              <div className="space-y-4">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex gap-4 items-center">
                                     <div className="w-16 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                         <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                                     </div>
                                     <div className="flex-grow">
                                         <h4 className="font-serif text-navy-900 text-lg">{item.name}</h4>
                                         <p className="text-xs text-gray-500">{item.subCategory} | Qty: {item.quantity}</p>
                                         {item.selectedSize && <p className="text-xs font-bold text-navy-900 mt-1">Size: {item.selectedSize}</p>}
                                     </div>
                                     <div className="font-medium text-navy-900 font-sans">₹{item.discountPrice || item.price}</div>
                                  </div>
                                ))}
                              </div>
                          </div>
                       </div>
                     ))}
                   </div>
                 )}
               </>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;