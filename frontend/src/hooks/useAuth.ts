import { useState, useEffect } from 'react';
import { User, AuthState } from '../types/auth';

// Mock user for dev mode (bypass auth)
const DEV_USER: User = {
  id: 'dev-123',
  email: 'demo@mapwork.com',
  name: 'Demo User',
  company: 'MapWork Demo',
  role: 'Admin'
};

export const useAuth = (): AuthState & {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string, company: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
} => {
  const [state, setState] = useState<AuthState>({
    user: DEV_USER,  // Auto-login in dev mode
    loading: false,
    error: null
  });

  useEffect(() => {
    // Dev mode - skip auth, use mock user
    console.log('🚀 Dev Mode: Auto-authenticated');
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Mock sign in:', email);
    return { success: true };
  };

  const signUp = async (email: string, password: string, name: string, company: string) => {
    console.log('📝 Mock sign up:', email);
    return { success: true };
  };

  const signOut = async () => {
    console.log('👋 Mock sign out');
  };

  return {
    ...state,
    signIn,
    signUp,
    signOut
  };
};