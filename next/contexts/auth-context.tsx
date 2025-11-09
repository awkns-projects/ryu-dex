import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { authClient } from '../lib/auth-client';

interface AuthContextType {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check session with Better Auth
  const checkSession = async () => {
    try {
      const response = await authClient.getSession();
      const session = 'data' in response ? response.data : null;
      console.log('🔐 Session check:', session?.user ? 'Logged in' : 'Not logged in');
      setIsLoggedIn(!!session?.user);
    } catch (error) {
      console.error('❌ Session check error:', error);
      setIsLoggedIn(false);
    }
  };

  // Check session on mount
  useEffect(() => {
    const initAuth = async () => {
      await checkSession();
      setIsInitialized(true);
    };
    initAuth();
  }, []);

  const login = () => {
    // This is called after successful manual login
    // But we should also check session to be sure
    setIsLoggedIn(true);
    checkSession(); // Verify with Better Auth
  };

  const logout = async () => {
    try {
      await authClient.signOut();
      setIsLoggedIn(false);
      console.log('✅ Logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Still set to false even if API call fails
      setIsLoggedIn(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, checkSession }}>
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


