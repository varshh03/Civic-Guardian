import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient } from '../api/client';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'citizen' | 'officer' | 'admin';
  department_id: string | null;
  language: string;
  avatar: string | null;
  points: number;
  badges: string[];
  active: boolean;
  created_at: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('civic_user') || 'null'); } catch { return null; }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('civic_token'));
  const [isLoading, setIsLoading] = useState(!!token && !user);

  useEffect(() => {
    if (token && !user) {
      apiClient.get('/auth/me').then(r => {
        setUser(r.data);
        localStorage.setItem('civic_user', JSON.stringify(r.data));
      }).catch(() => logout()).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('civic_token', newToken);
    localStorage.setItem('civic_user', JSON.stringify(newUser));
    if (newUser.language) {
      localStorage.setItem('civic_lang', newUser.language);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('civic_token');
    localStorage.removeItem('civic_user');
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
