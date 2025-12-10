import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Mail, Lock, Sparkles, Eye, EyeOff, User } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import toast from 'react-hot-toast'; // Import Toast

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth(); // Added isLoading from context
  const { globalSettings } = useCMS();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if(email && password) {
        // Call API Login via Context
        const success = await login(email, password);
        
        if (success) {
            toast.success("Welcome back to Neela Fashion!", {
                duration: 3000,
                icon: '👋',
                style: {
                    background: '#1e2a4a',
                    color: '#fff',
                }
            });
            navigate('/'); 
        }
        // Error toast is already handled in AuthContext, but we can keep this safe
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sand-50 relative overflow-hidden">
      {/* Background Patterns */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-gold-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-navy-100/40 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 shadow-2xl rounded-2xl overflow-hidden bg-white relative z-10 mx-4">
         
         {/* Left Side - Visual */}
         <div className="hidden md:block relative bg-navy-900">
             <img 
               src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000" 
               className="absolute inset-0 w-full h-full object-cover opacity-60" 
               alt="Login Visual" 
             />
             <div className="absolute inset-0 bg-gradient-to-t from-navy-900 to-transparent"></div>
             <div className="absolute bottom-0 left-0 p-12 text-white">
                 <div className="mb-4 w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center text-navy-900">
                     <Sparkles size={20} />
                 </div>
                 <h2 className="text-4xl font-serif font-bold mb-4">Welcome Back</h2>
                 <p className="text-navy-100 font-light leading-relaxed">Access your exclusive wishlist, track your premium orders, and explore our latest heritage collection.</p>
             </div>
         </div>

         {/* Right Side - Form */}
         <div className="p-10 md:p-16 flex flex-col justify-center">
             <div className="text-center md:text-left mb-10">
                 <h3 className="text-2xl font-serif font-bold text-navy-900 mb-2">Sign In</h3>
                 <p className="text-gray-500 text-sm">Enter your details to access your account</p>
             </div>

             <form onSubmit={handleSubmit} className="space-y-6">
                 <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
                    <div className="relative group">
                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           <User className="h-5 w-5 text-gray-400 group-focus-within:text-gold-600 transition-colors" />
                       </div>
                       <input 
                         type="email"
                         required
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-600 outline-none transition-all text-navy-900 bg-white focus:bg-white"
                         placeholder="name@company.com"
                       />
                    </div>
                 </div>

                 <div>
                    <div className="flex justify-between mb-2">
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Password</label>
                        <a href="#" className="text-xs text-gold-600 hover:text-navy-900 transition-colors font-medium">Forgot password?</a>
                    </div>
                    <div className="relative group">
                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-gold-600 transition-colors" />
                       </div>
                       <input 
                         type={showPassword ? "text" : "password"}
                         required
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-600 outline-none transition-all text-navy-900 bg-white focus:bg-white"
                         placeholder="••••••"
                       />
                       <button 
                         type="button"
                         onClick={() => setShowPassword(!showPassword)}
                         className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-navy-900 focus:outline-none"
                       >
                           {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                       </button>
                    </div>
                 </div>

                 <button 
                     type="submit"
                     disabled={isLoading} 
                     className="w-full bg-navy-900 text-white py-4 rounded-lg uppercase font-bold tracking-widest text-xs hover:bg-gold-600 transition-all duration-300 shadow-lg flex items-center justify-center group mt-4 disabled:opacity-70"
                 >
                     {isLoading ? 'Verifying...' : 'Sign In'} <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                 </button>
             </form>

             <div className="mt-8 text-center pt-6 border-t border-gray-100">
                 <p className="text-sm text-gray-500">
                     Don't have an account? <Link to="/signup" className="text-navy-900 font-bold hover:text-gold-600 transition-colors">Sign up free</Link>
                 </p>
             </div>
             
             <div className="mt-4 text-center">
                 <Link to="/" className="text-xs text-gray-400 hover:text-navy-900 transition-colors">Return to Store</Link>
             </div>
         </div>
      </div>
    </div>
  );
};

export default Login;