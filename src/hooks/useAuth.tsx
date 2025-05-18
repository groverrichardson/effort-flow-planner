import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Session, User, AuthError } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  bypassLogin: () => Promise<void>; // New function for bypass login
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signInWithGoogle: async () => {},
  signOut: async () => {},
  bypassLogin: async () => {}, // Add default implementation
});

// Dummy account credentials - using a valid email format
const DUMMY_USER_EMAIL = 'demo-user@example.com';
const DUMMY_USER_PASSWORD = 'demopassword123';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    }).catch(error => {
      console.error('Error getting session:', error);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({
          title: 'Sign in error',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }
      
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
      return { error: null };
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
      // Cast the error to AuthError to match the function signature
      const authError = error as AuthError;
      return { error: authError };
    }
  };

  const signUp = async (email: string, password: string): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        toast({
          title: 'Sign up error',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }

      toast({
        title: 'Account created!',
        description: 'Check your email for a confirmation link.',
      });
      return { error: null };
    } catch (error) {
      console.error('Unexpected error during sign up:', error);
      // Cast the error to AuthError to match the function signature
      const authError = error as AuthError;
      return { error: authError };
    }
  };

  const signInWithGoogle = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
    } catch (error) {
      console.error('Error signing in with Google:', error);
      toast({
        title: 'Error signing in with Google',
        description: 'There was an error signing in with Google. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.',
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error signing out',
        description: 'There was an error signing out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Improved bypass login function that ensures a working demo account
  const bypassLogin = async () => {
    try {
      console.log('Attempting bypass login...');
      
      let demoUser;
      
      // Try to sign in with the dummy account first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: DUMMY_USER_EMAIL,
        password: DUMMY_USER_PASSWORD
      });
      
      if (signInError) {
        console.log('Login failed, creating dummy account:', signInError.message);
        
        // Create the dummy account with auto-confirmation enabled
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: DUMMY_USER_EMAIL,
          password: DUMMY_USER_PASSWORD,
          options: {
            data: {
              username: 'Demo User'
            },
            // Attempt auto-confirmation for development 
            emailRedirectTo: window.location.origin
          }
        });
        
        if (signUpError) {
          throw signUpError;
        }
        
        demoUser = signUpData;
        console.log('Dummy account created:', demoUser);
        
        // After creating the account, try signing in again
        const { data: newSignInData, error: newSignInError } = await supabase.auth.signInWithPassword({
          email: DUMMY_USER_EMAIL,
          password: DUMMY_USER_PASSWORD
        });
        
        if (newSignInError) {
          throw newSignInError;
        }
        
        demoUser = newSignInData;
      } else {
        demoUser = signInData;
        console.log('Signed in with existing dummy account');
      }
      
      if (demoUser?.user) {
        toast({
          title: 'Demo Access Granted',
          description: 'You are now signed in as a demo user.',
        });
      } else {
        throw new Error('Failed to authenticate demo user');
      }
    } catch (error) {
      console.error('Error during bypass login:', error);
      toast({
        title: 'Bypass Login Failed',
        description: 'There was an error accessing the demo account. Please try again or use a regular login.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signUp, signInWithGoogle, signOut, bypassLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
