// This file uses environment variables for Supabase configuration.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Get Supabase URL and anon key from environment variables
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://gslwiqavcqwjtpyeawyp.supabase.co";
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "placeholder_key_replace_with_actual_key";

// Warn if environment variables are missing
if (
  !import.meta.env.VITE_SUPABASE_URL ||
  !import.meta.env.VITE_SUPABASE_ANON_KEY
) {
  console.warn(
    "Supabase environment variables are missing. Check your .env file and replace placeholder values with actual Supabase credentials.",
  );
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// Configure Supabase client with browser-specific options
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true, // Use localStorage for session persistence
      detectSessionInUrl: true, // Detect session from URL hash
      autoRefreshToken: true, // Auto-refresh token
    },
  },
);
