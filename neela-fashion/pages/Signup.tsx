import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight, Sparkles } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import toast from 'react-hot-toast'; // Import Toast

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { globalSettings } = useCMS();

  // State to store input values
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleName = (e: any) => setFormData({...formData, name: e.target.value});
  const handleEmail = (e: any) => setFormData({...formData, email: e.target.value});
  const handlePhone = (e: any) => setFormData({...formData, phone: e.target.value});
  const handlePass = (e: any) => setFormData({...formData, password: e.target.value});
  const handleConfirm = (e: any) => setFormData({...formData, confirmPassword: e.target.value});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic Validation
    if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match!"); // Beautiful Error
        return;
    }

    setLoading(true);

    try {
        const response = await fetch('http://localhost:5000/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            })
        });

        const data = await response.json();

        if (data.success) {
            toast.success("Account created successfully! Please Login.", {
                duration: 4000,
                style: {
                    background: '#1e2a4a',
                    color: '#fff',
                    border: '1px solid #c48b36'
                },
                icon: '🎉',
            });
            navigate('/login');
        } else {
            toast.error(data.message || "Signup Failed");
        }
    } catch (error) {
        console.error("Signup Error:", error);
        toast.error("Server Error. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden py-20">
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 scale-105"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop")' }}
      >
          <div className="absolute inset-0 bg-navy-900/70 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg px-6">
         <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 md:p-12 border border-white/20 animate-fade-in-up relative overflow-hidden">
             
             <div className="absolute top-0 right-0 w-40 h-40 bg-gold-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>

             <div className="text-center mb-10">
                 <div className="inline-flex items-center justify-center w-14 h-14 bg-gold-50 rounded-full mb-4 shadow-sm border border-gold-100">
                     <Sparkles className="text-gold-600" size={20} />
                 </div>
                 <h1 className="text-3xl font-serif text-navy-900 mb-2">Join {globalSettings.siteName}</h1>
                 <p className="text-gray-500 text-sm">Experience the art of luxury fashion.</p>
             </div>

             <form onSubmit={handleSubmit} className="space-y-5">
                 <div className="group">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 group-focus-within:text-navy-900">Full Name</label>
                    <div className="relative">
                       <User size={18} className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-gold-600 transition-colors" />
                       <input type="text" required value={formData.name} onChange={handleName} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-600 outline-none transition-all text-navy-900 placeholder-gray-400" placeholder="John Doe" />
                    </div>
                 </div>

                 <div className="group">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 group-focus-within:text-navy-900">Email Address</label>
                    <div className="relative">
                       <Mail size={18} className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-gold-600 transition-colors" />
                       <input type="email" required value={formData.email} onChange={handleEmail} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-600 outline-none transition-all text-navy-900 placeholder-gray-400" placeholder="name@company.com" />
                    </div>
                 </div>

                 <div className="group">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 group-focus-within:text-navy-900">Phone Number</label>
                    <div className="relative">
                       <Phone size={18} className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-gold-600 transition-colors" />
                       <input type="tel" required value={formData.phone} onChange={handlePhone} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-600 outline-none transition-all text-navy-900 placeholder-gray-400" placeholder="+91 98765 43210" />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                     <div className="group">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 group-focus-within:text-navy-900">Password</label>
                        <div className="relative">
                           <Lock size={18} className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-gold-600 transition-colors" />
                           <input type="password" required value={formData.password} onChange={handlePass} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-600 outline-none transition-all text-navy-900 placeholder-gray-400" placeholder="••••••" />
                        </div>
                     </div>
                     <div className="group">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 group-focus-within:text-navy-900">Confirm</label>
                        <div className="relative">
                           <Lock size={18} className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-gold-600 transition-colors" />
                           <input type="password" required value={formData.confirmPassword} onChange={handleConfirm} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-600 outline-none transition-all text-navy-900 placeholder-gray-400" placeholder="••••••" />
                        </div>
                     </div>
                 </div>

                 <button 
                     type="submit"
                     disabled={loading}
                     className="w-full bg-navy-900 text-white py-4 rounded-lg uppercase font-bold tracking-widest text-xs hover:bg-gold-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center group mt-6 disabled:opacity-70"
                 >
                     {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                 </button>
             </form>

             <div className="mt-8 text-center">
                 <p className="text-sm text-gray-500">
                     Already a member? <Link to="/login" className="text-navy-900 font-bold hover:text-gold-600 transition-colors ml-1 border-b border-gold-500/30 hover:border-gold-600">Sign In</Link>
                 </p>
             </div>
         </div>
      </div>
    </div>
  );
};

export default Signup;