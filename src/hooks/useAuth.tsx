
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Session, User, AuthError } from '@supabase/supabase-js';

// Define more accurate types for auth options including redirectTo
interface AuthOptions {
  redirectTo?: string;
  captchaToken?: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  bypassLogin: () => Promise<void>;
}

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

// Using a valid domain for the demo account
const DUMMY_USER_EMAIL = 'demo-user@gmail.com';
const DUMMY_USER_PASSWORD = 'demopassword123';

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

  const signIn = async (email: string, password: string): Promise<{ error: AuthError | null }> => {
    try {
      console.log('Attempting to sign in with email:', email);
      
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password,
        options: {
          redirectTo: window.location.origin
        } as AuthOptions
      });
      
      if (error) {
        console.error('Sign in error:', error.message);
        toast({
          title: 'Sign in error',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }
      
      console.log('Sign in successful');
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
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: window.location.origin
        } as AuthOptions
      });
      
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
        } as AuthOptions
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
      console.log('Signing out user');
      await supabase.auth.signOut();
      console.log('Sign out successful');
      
      // Manually clear session and user state to be sure
      setSession(null);
      setUser(null);
      
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

  // Improved bypass login function that uses a valid email domain
  const bypassLogin = async () => {
    try {
      console.log('Attempting bypass login with valid email domain...');
      
      // First try to sign in with the dummy account
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: DUMMY_USER_EMAIL,
        password: DUMMY_USER_PASSWORD,
        options: {
          redirectTo: window.location.origin
        } as AuthOptions
      });
      
      if (signInError) {
        console.log('Login failed, creating new demo account:', signInError.message);
        
        // Create the demo account with auto-confirmation
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: DUMMY_USER_EMAIL,
          password: DUMMY_USER_PASSWORD,
          options: {
            // For development purposes, try to auto-confirm the account
            emailRedirectTo: window.location.origin
          } as AuthOptions
        });
        
        if (signUpError) {
          console.error('Error creating demo account:', signUpError);
          throw signUpError;
        }
        
        console.log('Demo account created, attempting to sign in directly');
        
        // After creating the account, attempt to sign in
        const { data: newSignInData, error: newSignInError } = await supabase.auth.signInWithPassword({
          email: DUMMY_USER_EMAIL,
          password: DUMMY_USER_PASSWORD,
          options: {
            redirectTo: window.location.origin
          } as AuthOptions
        });
        
        if (newSignInError) {
          console.error('Could not sign in with new demo account:', newSignInError);
          toast({
            title: 'Demo Account Created',
            description: 'The demo account was created but requires email verification. Please check your Supabase settings or try again later.',
            variant: 'default',
          });
          return;
        }
        
        toast({
          title: 'Demo Access Granted',
          description: 'You are now signed in as a demo user.',
        });
        
        return;
      }
      
      // If we got here, the sign-in was successful
      console.log('Successfully signed in with existing demo account');
      toast({
        title: 'Demo Access Granted',
        description: 'You are now signed in as a demo user.',
      });
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
