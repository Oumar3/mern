import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';
import { User } from '../types/database';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (identifier: string, password: string) => Promise<void>; // updated
  signUp: (username: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  // Helper to sync user with localStorage
  const setUser = (user: User | null) => {
    setUserState(user);
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  };

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (accessToken) {
      // Try to use the access token first
      api.get('/users/me')
        .then(response => {
          setUser(response.data.user);
        })
        .catch(async (error) => {
          console.error('Access token verification failed:', error);
          
          // If access token fails, try to refresh it
          if (refreshToken) {
            try {
              const refreshResponse = await api.post('/users/refresh-token', { refreshToken });
              const { accessToken: newAccessToken, user } = refreshResponse.data;
              
              localStorage.setItem('accessToken', newAccessToken);
              setUser(user);
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              // Clear all tokens and redirect to login
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              setUser(null);
            }
          } else {
            // No refresh token available, clear access token
            localStorage.removeItem('accessToken');
            setUser(null);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (identifier: string, password: string) => {
    // Send identifier as both email and username
    const response = await api.post('/users/login', { email: identifier, username: identifier, password });
    const { accessToken, refreshToken, user } = response.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    setUser({
      ...user,
      _id: user.id
    });
  };

  const signUp = async (username: string, email: string, password: string) => {
    const response = await api.post('/users/register', { username, email, password });
    const { accessToken, refreshToken, user } = response.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser(user);
  };

  const signOut = async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // Also remove old token if it exists
    localStorage.removeItem('token');
    setUser(null);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await api.post('/users/change-password', {
      currentPassword,
      newPassword,
    });
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    changePassword,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}