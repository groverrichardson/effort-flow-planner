
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { AuthContextType } from '@/types/auth';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signInWithGoogle, 
  signOut, 
  bypassLogin 
} from '@/utils/authUtils';

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signInWithGoogle: async () => {},
  signOut: async () => {},
  bypassLogin: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Auth initialization started');
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log('Auth state change event:', event);
      console.log('Session from event:', currentSession?.user?.email || 'No user');
      
      setSession(currentSession);
      setUser(currentSession?.user || null);
      setLoading(false);
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Initial session check:', currentSession?.user?.email || 'No session');
      
      setSession(currentSession);
      setUser(currentSession?.user || null);
      setLoading(false);
    }).catch(error => {
      console.error('Error getting session:', error);
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth subscriptions');
      subscription.unsubscribe();
    };
  }, []);

  // Log session and user state after every render to help debug
  useEffect(() => {
    console.log('Current auth state:', {
      session: session ? 'exists' : 'null',
      user: user?.email || 'null',
      loading
    });
  }, [session, user, loading]);

  return (
    <AuthContext.Provider 
      value={{ 
        session, 
        user, 
        loading, 
        signIn: signInWithEmail, 
        signUp: signUpWithEmail, 
        signInWithGoogle, 
        signOut, 
        bypassLogin 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
