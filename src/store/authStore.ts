import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Profile } from '../types/database';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string, phone?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  adminSignIn: (email: string, password: string) => Promise<{ error: Error | null }>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isAdmin: false,
  loading: true,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        set({ user: session.user, profile: profile || null, loading: false });
      } else {
        set({ loading: false });
      }

      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          set({ user: session.user, profile: profile || null });
        } else {
          set({ user: null, profile: null, isAdmin: false });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ loading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error };

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        set({ user: data.user, profile: profile || null });
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  signUp: async (email: string, password: string, name: string, phone?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) return { error };

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email,
            name,
            phone: phone || null,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, isAdmin: false });
  },

  adminSignIn: async (email: string, password: string) => {
    try {
      const { data: admin } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .maybeSingle();

      if (!admin) {
        return { error: new Error('Invalid credentials') };
      }

      const bcrypt = await import('bcryptjs');
      const isValid = await bcrypt.compare(password, admin.password_hash);

      if (!isValid) {
        return { error: new Error('Invalid credentials') };
      }

      await supabase
        .from('admins')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', admin.id);

      set({ isAdmin: true, user: { id: admin.id, email: admin.email } as User });

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },
}));
