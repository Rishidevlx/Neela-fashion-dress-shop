import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useCMS } from '../context/CMSContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, Save, Smartphone, Banknote } from 'lucide-react';
import { ShippingDetails, INDIAN_STATES, Order } from '../types';
import toast from 'react-hot-toast';

// Use Environment Variable for API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AddressFormFields = ({ form, onChange, disabled }: { form: ShippingDetails, onChange: (e: any) => void, disabled: boolean }) => (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 relative z-0 ${disabled ? 'opacity-70 pointer-events-none' : ''}`}>
        <div className="group"><label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">First Name</label><input required name="firstName" value={form.firstName} onChange={onChange} type="text" className="w-full border-b border-gray-300 py-2 outline-none focus:border-navy-900 bg-white text-navy-900" /></div>
        <div className="group"><label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Last Name</label><input required name="lastName" value={form.lastName} onChange={onChange} type="text" className="w-full border-b border-gray-300 py-2 outline-none focus:border-navy-900 bg-white text-navy-900" /></div>
        <div className="group"><label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Email Address</label><input required name="email" value={form.email} onChange={onChange} type="email" className="w-full border-b border-gray-300 py-2 outline-none focus:border-navy-900 bg-white text-navy-900" /></div>
        <div className="group"><label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Phone Number</label><input required name="phone" value={form.phone} onChange={onChange} type="tel" className="w-full border-b border-gray-300 py-2 outline-none focus:border-navy-900 bg-white text-navy-900" /></div>
        <div className="md:col-span-2 group"><label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Address</label><input required name="address" value={form.address} onChange={onChange} type="text" className="w-full border-b border-gray-300 py-2 outline-none focus:border-navy-900 bg-white text-navy-900" /></div>
        <div className="group"><label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">City</label><input required name="city" value={form.city} onChange={onChange} type="text" className="w-full border-b border-gray-300 py-2 outline-none focus:border-navy-900 bg-white text-navy-900" /></div>
        <div className="group"><label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">District</label><input required name="district" value={form.district} onChange={onChange} type="text" className="w-full border-b border-gray-300 py-2 outline-none focus:border-navy-900 bg-white text-navy-900" /></div>
        <div className="group"><label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">State</label><select required name="state" value={form.state} onChange={onChange} className="w-full border-b border-gray-300 py-2 outline-none focus:border-navy-900 bg-white text-navy-900">{INDIAN_STATES.slice(2).map(state => <option key={state} value={state}>{state}</option>)}</select></div>
        <div className="group"><label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Pincode</label><input required name="pincode" value={form.pincode} onChange={onChange} type="text" className="w-full border-b border-gray-300 py-2 outline-none focus:border-navy-900 bg-white text-navy-900" /></div>
    </div>
);

const Checkout: React.FC = () => {
  const { cart, cartTotal, taxAmount, clearCart } = useCart();
  const { shippingRules, addOrder, globalSettings, updateUserProfile, users } = useCMS(); 
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [calculatedShipping, setCalculatedShipping] = useState(0);
  const [isAddressSaved, setIsAddressSaved] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Prepaid' | 'COD'>('Prepaid');
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [saveAddressForNextTime, setSaveAddressForNextTime] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  
  const [billingForm, setBillingForm] = useState<ShippingDetails>({
      firstName: '', lastName: '', email: '', phone: '', address: '', city: '', district: '', state: 'Tamil Nadu', pincode: ''
  });

  const [shippingForm, setShippingForm] = useState<ShippingDetails>(billingForm);

  useEffect(() => {
      if (isAuthenticated && user && users.length > 0) {
          const freshUser = users.find(u => String(u.id) === String(user.id));
          if (freshUser) {
              setBillingForm(prev => ({
                  ...prev,
                  firstName: freshUser.name ? freshUser.name.split(' ')[0] : '',
                  lastName: freshUser.name ? freshUser.name.split(' ').slice(1).join(' ') : '',
                  email: freshUser.email || '',
                  phone: freshUser.phone || '',
                  address: freshUser.address || '',
                  city: freshUser.city || '',
                  state: freshUser.state || 'Tamil Nadu',
                  pincode: freshUser.pincode || ''
              }));
          }
      }
  }, [user, users, isAuthenticated]);

  useEffect(() => { if (sameAsBilling) setShippingForm(billingForm); }, [billingForm, sameAsBilling]);
  useEffect(() => { setIsAddressSaved(false); setCalculatedShipping(0); }, [cart]);

  const calculateShippingCost = () => {
      let totalShipping = 0;
      const targetState = shippingForm.state;

      let pranjulNightyQty = 0;
      let pranjulCollectionQty = 0;
      const otherCategoryGroups: { [cat: string]: number } = {};

      cart.forEach(item => {
          const cat = item.category.toLowerCase();
          const sub = item.subCategory ? item.subCategory.toLowerCase() : '';
          const isCategory = (keyword: string) => cat.includes(keyword) || sub.includes(keyword);

          if (isCategory('pranjul') && isCategory('nighty')) {
              pranjulNightyQty += item.quantity;
          } else if (isCategory('pranjul') && (isCategory('collection') || isCategory('collecion'))) {
              pranjulCollectionQty += item.quantity;
          } else {
              otherCategoryGroups[item.category] = (otherCategoryGroups[item.category] || 0) + item.quantity;
          }
      });

      if (pranjulNightyQty > 0) {
          if (targetState === 'Tamil Nadu') {
              if (pranjulNightyQty >= 3) totalShipping += 0; else totalShipping += 30;
          } else {
              if (pranjulNightyQty <= 4) totalShipping += 45;
              else totalShipping += 45 + ((pranjulNightyQty - 4) * 10);
          }
      }

      if (pranjulCollectionQty > 0) {
          if (targetState === 'Tamil Nadu') totalShipping += 40 + ((pranjulCollectionQty - 1) * 20);
          else totalShipping += 65 + ((pranjulCollectionQty - 1) * 25);
      }

      Object.entries(otherCategoryGroups).forEach(([category, qty]) => {
          const rules = shippingRules[category];
          let matchedRule = undefined;

          if (rules && rules.length > 0) {
              matchedRule = rules.find(r => r.state === targetState && qty >= r.minQty && qty <= r.maxQty);
              if (!matchedRule && targetState !== 'Tamil Nadu') matchedRule = rules.find(r => r.state === 'Other States' && qty >= r.minQty && qty <= r.maxQty);
              if (!matchedRule) matchedRule = rules.find(r => r.state === 'All States' && qty >= r.minQty && qty <= r.maxQty);

              if (matchedRule) {
                  let cost = matchedRule.cost;
                  if(matchedRule.type === 'per_piece') cost = matchedRule.cost * qty;
                  else if(matchedRule.type === 'every_2') cost = matchedRule.cost * Math.ceil(qty / 2);
                  else if(matchedRule.type === 'every_3') cost = matchedRule.cost * Math.ceil(qty / 3);
                  else if(matchedRule.type === 'every_10') cost = matchedRule.cost * Math.ceil(qty / 10);
                  totalShipping += cost;
              } else totalShipping += 50;
          } else totalShipping += 50;
      });
      
      setCalculatedShipping(totalShipping);
      setIsAddressSaved(true);
  };

  const handleAddressSubmit = (e: React.FormEvent) => { 
      e.preventDefault(); 
      calculateShippingCost(); 
      if (saveAddressForNextTime && isAuthenticated && user) {
          updateUserProfile(user.id, {
              address: billingForm.address, city: billingForm.city, state: billingForm.state, pincode: billingForm.pincode, phone: billingForm.phone
          });
      }
  };

  const finalPayable = cartTotal + taxAmount + calculatedShipping;

  const handleFinalPayment = async () => {
    setLoading(true);
    const orderId = 'ORD-' + Date.now().toString().slice(-6);
    
    // Save Pending Order
    const newOrder: Order = {
        id: orderId,
        userId: user?.id || 'guest',
        userName: `${billingForm.firstName} ${billingForm.lastName}`,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        total: Number(finalPayable.toFixed(2)),
        status: 'Pending',
        paymentMethod: paymentMethod === 'COD' ? 'COD' : 'Prepaid',
        items: cart,
        billingDetails: billingForm,
        shippingDetails: shippingForm,
        notes: orderNotes
    };

    await addOrder(newOrder);

    if (paymentMethod === 'COD') {
        setLoading(false);
        clearCart();
        navigate('/order-success', { 
            state: { orderId, total: finalPayable.toFixed(2), items: cart, billing: billingForm, shipping: shippingForm } 
        });
    } else {
        // --- INITIATE REAL PAYMENT ---
        try {
            const response = await fetch(`${API_URL}/api/payment/pay`, { // Using Dynamic URL
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: orderId,
                    amount: finalPayable, // Total Amount
                    userId: user?.id || 'GUEST',
                    mobileNumber: billingForm.phone
                })
            });

            const data = await response.json();

            if (data.success && data.url) {
                // Redirect to PhonePe Gateway
                window.location.href = data.url; 
            } else {
                toast.error("Payment Initiation Failed. Try COD.");
                setLoading(false);
            }
        } catch (error) {
            console.error("Payment Error", error);
            toast.error("Server Error in Payment");
            setLoading(false);
        }
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 pt-40 pb-20">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto">
          <div className="lg:w-2/3">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-serif text-navy-900">Checkout</h1>
                <div className="flex items-center text-green-700 bg-green-50 px-3 py-1 rounded-full text-xs font-medium">
                    <Lock size={12} className="mr-1" /> SSL Secured
                </div>
            </div>

            <div className="space-y-8">
              <form onSubmit={handleAddressSubmit} className={`bg-white p-8 shadow-sm border-t-4 ${isAddressSaved ? 'border-green-500' : 'border-gray-200'} transition-colors duration-500 relative`}>
                 {isAddressSaved && (<div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-[1px]"></div>)}
                 <div className="mb-12">
                     <div className="flex justify-between items-center mb-6 relative z-20">
                         <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold text-sm">1</div><h2 className="text-lg font-bold uppercase tracking-widest text-navy-900">Billing Address</h2></div>
                     </div>
                     <AddressFormFields form={billingForm} onChange={(e) => setBillingForm({...billingForm, [e.target.name]: e.target.value})} disabled={isAddressSaved} />
                 </div>
                 
                 <div className="border-t border-gray-200 my-8"></div>
                 
                 <div className="mb-6">
                     <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 relative z-20 gap-4">
                         <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold text-sm">2</div><h2 className="text-lg font-bold uppercase tracking-widest text-navy-900">Delivery Address</h2></div>
                         <label className="flex items-center cursor-pointer"><input type="checkbox" checked={sameAsBilling} onChange={(e) => setSameAsBilling(e.target.checked)} disabled={isAddressSaved} className="w-4 h-4 text-navy-900 focus:ring-navy-900 rounded border-gray-300"/><span className="ml-2 text-sm text-gray-600 font-medium">Same as Billing Address</span></label>
                     </div>
                     {!sameAsBilling && (<div className="animate-fade-in"><AddressFormFields form={shippingForm} onChange={(e) => setShippingForm({...shippingForm, [e.target.name]: e.target.value})} disabled={isAddressSaved} /></div>)}
                 </div>

                 {isAuthenticated && (
                     <div className="mb-6 relative z-20">
                         <label className="flex items-center cursor-pointer p-4 bg-gray-50 rounded border border-gray-100 hover:border-gold-300 transition-colors">
                             <input type="checkbox" checked={saveAddressForNextTime} onChange={(e) => setSaveAddressForNextTime(e.target.checked)} disabled={isAddressSaved} className="w-4 h-4 text-navy-900 focus:ring-navy-900 rounded border-gray-300"/>
                             <span className="ml-3 text-sm text-navy-900 font-medium flex items-center"><Save size={16} className="mr-2 text-gold-600"/> Save this address for next time</span>
                         </label>
                     </div>
                 )}

                 <div className="mb-6 relative z-20">
                     <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2 block">Order Notes (Optional)</label>
                     <textarea value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} placeholder="Notes about your order..." className="w-full border border-gray-300 rounded p-4 text-sm focus:border-navy-900 outline-none bg-white text-navy-900 h-24 resize-none" disabled={isAddressSaved}/>
                 </div>

                 <div className="relative z-20">
                    {!isAddressSaved ? (
                        <button type="submit" className="mt-8 w-full bg-navy-900 text-white py-4 uppercase font-bold tracking-widest text-xs hover:bg-gold-600 transition-colors">Save Addresses & Calculate Shipping</button>
                    ) : (
                        <button type="button" onClick={(e) => {e.preventDefault(); setIsAddressSaved(false);}} className="mt-8 w-full border border-navy-900 text-navy-900 py-3 uppercase font-bold tracking-widest text-xs hover:bg-navy-50 transition-colors flex items-center justify-center">Edit Addresses <span className="ml-2 text-green-600 flex items-center text-[10px] normal-case"><CheckCircle size={12} className="mr-1"/> Currently Saved</span></button>
                    )}
                 </div>
              </form>

              {isAddressSaved && (
                  <div className="bg-white p-8 shadow-sm border-t-4 border-navy-900 animate-fade-in-up">
                      <div className="flex items-center gap-2 mb-6"><div className="w-8 h-8 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold text-sm">3</div><h2 className="text-lg font-bold uppercase tracking-widest text-navy-900">Payment Method</h2></div>
                      <div className="space-y-4 mb-8">
                          <label className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${paymentMethod === 'Prepaid' ? 'border-navy-900 bg-navy-50' : 'border-gray-200'}`}>
                              <div className="flex items-center">
                                  <input type="radio" name="payment" checked={paymentMethod === 'Prepaid'} onChange={() => setPaymentMethod('Prepaid')} className="text-navy-900 focus:ring-navy-900" />
                                  <div className="ml-3">
                                      <div className="flex items-center gap-2"><span className="font-bold text-navy-900 text-lg">Pay with PhonePe</span><span className="bg-purple-600 text-white text-[9px] px-1.5 py-0.5 rounded uppercase font-bold">Fast</span></div>
                                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-2"><Smartphone size={14} /> UPI, Credit/Debit Cards, NetBanking</p>
                                  </div>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700"><Smartphone size={18} /></div>
                          </label>

                          <label className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-navy-900 bg-navy-50' : 'border-gray-200'}`}>
                              <div className="flex items-center">
                                  <input type="radio" name="payment" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="text-navy-900 focus:ring-navy-900" />
                                  <div className="ml-3"><span className="font-medium text-gray-800">Cash on Delivery</span><p className="text-xs text-gray-500 mt-1">Pay when you receive the order.</p></div>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"><Banknote size={18} /></div>
                          </label>
                      </div>
                      
                      <button onClick={handleFinalPayment} disabled={loading} className="w-full bg-navy-900 text-white py-5 uppercase tracking-widest font-bold hover:bg-gold-600 border border-transparent transition-all duration-300 shadow-lg disabled:opacity-70 flex justify-center items-center">
                          {loading ? 'Processing...' : paymentMethod === 'Prepaid' ? `Proceed to Pay ₹${finalPayable.toFixed(2)}` : `Place Order ₹${finalPayable.toFixed(2)}`}
                      </button>
                  </div>
              )}
            </div>
          </div>
          
          <div className="lg:w-1/3">
             <div className="bg-white p-8 shadow-lg sticky top-32">
                <h3 className="font-serif text-xl text-navy-900 mb-6 pb-4 border-b border-gray-100">In Your Bag ({cart.length})</h3>
                <div className="space-y-6 mb-8 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                    {cart.map(item => (
                        <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 group items-start">
                            <div className="w-16 h-20 overflow-hidden relative flex-shrink-0"><img src={item.image} className="w-full h-full object-cover" alt={item.name} /></div>
                            <div className="flex-1">
                                <h4 className="font-serif text-navy-900 text-sm leading-tight mb-1">{item.name}</h4>
                                <p className="text-xs text-gray-500 mb-1">{item.category}</p>
                                {item.selectedSize && <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded text-navy-900 font-bold block w-fit mb-1">Size: {item.selectedSize}</span>}
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-navy-900">Qty: {item.quantity}</span>
                                    <p className="text-sm font-medium text-navy-900 font-sans">₹{(item.discountPrice || item.price) * item.quantity}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="border-t border-gray-100 pt-6 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-500"><span className="font-sans">Subtotal</span><span className="font-sans">₹{cartTotal}</span></div>
                    <div className="flex justify-between text-gray-500"><div className="flex flex-col"><span className="font-sans">Shipping</span>{isAddressSaved && <span className="text-[10px] text-gray-400">To: {shippingForm.state}</span>}</div>{isAddressSaved ? (<span className={`font-sans ${calculatedShipping === 0 ? 'text-green-600 font-bold' : ''}`}>{calculatedShipping === 0 ? 'Free' : `₹${calculatedShipping}`}</span>) : (<span className="text-xs text-orange-500">Enter Address</span>)}</div>
                    <div className="flex justify-between text-gray-500"><span className="font-sans">Tax ({globalSettings?.taxRate || 0}%)</span><span className="font-sans">₹{taxAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between text-navy-900 font-bold text-lg pt-4"><span>Total</span><span className="font-sans">₹{finalPayable.toFixed(2)}</span></div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;