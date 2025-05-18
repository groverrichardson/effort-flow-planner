
import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a Supabase client only if the required environment variables are available
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase URL or Anon Key is missing. Please check your environment variables.");
    // Return a mock client that doesn't perform any actual operations
    return {
      auth: {
        signInWithPassword: async () => ({ error: { message: "Supabase client not initialized", code: "not_initialized", status: 0, __isAuthError: true } }),
        signUp: async () => ({ error: { message: "Supabase client not initialized", code: "not_initialized", status: 0, __isAuthError: true } }),
        signOut: async () => ({ error: { message: "Supabase client not initialized", code: "not_initialized", status: 0, __isAuthError: true } }),
        getSession: async () => ({ data: null, error: { message: "Supabase client not initialized", code: "not_initialized", status: 0, __isAuthError: true } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } }, error: null }),
        signInWithOAuth: async () => ({ error: { message: "Supabase client not initialized", code: "not_initialized", status: 0, __isAuthError: true } }),
      }
    };
  }

  // Create and return the actual Supabase client
  return createClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = createSupabaseClient();
