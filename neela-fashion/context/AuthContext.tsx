import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Check localStorage on Initial Load (Persistent Login)
  const [user, setUser] = useState<User | null>(() => {
      const savedUser = localStorage.getItem('neela_user');
      return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password: pass }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        // 2. Save to localStorage on successful login
        localStorage.setItem('neela_user', JSON.stringify(data.user));
        setIsLoading(false);
        return true;
      } else {
        toast.error(data.message || 'Invalid Credentials', {
            style: { background: '#333', color: '#fff' }
        });
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Login API Error:", error);
      toast.error("Unable to connect to server. Is Backend running?", { icon: '🔌' });
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    // 3. Clear from localStorage on logout
    localStorage.removeItem('neela_user');
    toast.success("Logged out successfully", { icon: '👋', position: 'bottom-center' });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};