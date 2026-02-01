import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, User, getSessionId, clearSession, setSessionId } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  signup: (email: string, password: string, name: string, role: 'client' | 'therapist', date_of_birth?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const sessionId = getSessionId();
    if (!sessionId) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    if (sessionId.startsWith('demo_')) {
      const storedUser = localStorage.getItem('sage_demo_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
      return;
    }

    try {
      const userData = await authApi.me();
      setUser(userData);
    } catch {
      clearSession();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<User | null> => {
    const response = await authApi.login(email, password);
    setUser(response.user);
    return response.user;
  };

  const signup = async (email: string, password: string, name: string, role: 'client' | 'therapist', date_of_birth?: string) => {
    const response = await authApi.signup(email, password, name, role, date_of_birth);
    setUser(response.user);
  };

  const logout = async () => {
    await authApi.logout();
    localStorage.removeItem('sage_demo_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
