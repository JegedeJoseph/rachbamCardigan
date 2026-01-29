import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requiresSetup, setRequiresSetup] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        // Check if system requires initial setup
        const checkResponse = await authAPI.check();
        setRequiresSetup(checkResponse.data.data.requiresSetup);
        setLoading(false);
        return;
      }

      // Verify token and get user
      const response = await authAPI.me();
      setUser(response.data.data);
    } catch (error) {
      // Token invalid or expired
      localStorage.removeItem('token');
      
      // Check if system requires setup
      try {
        const checkResponse = await authAPI.check();
        setRequiresSetup(checkResponse.data.data.requiresSetup);
      } catch (e) {
        console.error('Error checking auth status:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { user, token } = response.data.data;
    
    localStorage.setItem('token', token);
    setUser(user);
    setRequiresSetup(false);
    
    return user;
  };

  const register = async (name, email, password) => {
    const response = await authAPI.register({ name, email, password });
    const { user, token } = response.data.data;
    
    localStorage.setItem('token', token);
    setUser(user);
    setRequiresSetup(false);
    
    return user;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Ignore errors during logout
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    await authAPI.updatePassword({ currentPassword, newPassword });
  };

  const value = {
    user,
    loading,
    requiresSetup,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updatePassword,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
