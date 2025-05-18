
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { AuthError } from '@supabase/supabase-js';
import { AuthOptions } from '@/types/auth';

// Using a valid domain for the demo account
const DUMMY_USER_EMAIL = 'demo-user@gmail.com';
const DUMMY_USER_PASSWORD = 'demopassword123';

export async function signInWithEmail(email: string, password: string): Promise<{ error: AuthError | null }> {
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
}

export async function signUpWithEmail(email: string, password: string): Promise<{ error: AuthError | null }> {
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
}

export async function signInWithGoogle(): Promise<void> {
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
}

export async function signOut(): Promise<void> {
  try {
    console.log('Signing out user');
    await supabase.auth.signOut();
    console.log('Sign out successful');
    
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
}

export async function bypassLogin(): Promise<void> {
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
}
