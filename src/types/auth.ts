
import { Session, User, AuthError } from '@supabase/supabase-js';

export interface AuthOptions {
  redirectTo?: string;
  captchaToken?: string;
}

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  bypassLogin: () => Promise<void>;
}
