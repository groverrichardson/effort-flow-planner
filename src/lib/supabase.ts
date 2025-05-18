
import { createClient } from '@supabase/supabase-js';
import { AuthError } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a mock AuthError that matches the required type
const createMockAuthError = (message: string): AuthError => ({
  name: 'AuthApiError',
  message,
  status: 0,
  __isAuthError: true,
  code: 'not_initialized',
});

// Create a Supabase client only if the required environment variables are available
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase URL or Anon Key is missing. Please check your environment variables.");
    // Return a mock client that doesn't perform any actual operations
    return {
      auth: {
        signInWithPassword: async () => ({ error: createMockAuthError("Supabase client not initialized") }),
        signUp: async () => ({ error: createMockAuthError("Supabase client not initialized") }),
        signOut: async () => ({ error: createMockAuthError("Supabase client not initialized") }),
        getSession: async () => ({ data: null, error: createMockAuthError("Supabase client not initialized") }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } }, error: null }),
        signInWithOAuth: async () => ({ error: createMockAuthError("Supabase client not initialized") }),
      }
    };
  }

  // Create and return the actual Supabase client
  return createClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = createSupabaseClient();
