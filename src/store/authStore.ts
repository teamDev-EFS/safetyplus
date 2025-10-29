// src/store/authStore.ts
import { create } from "zustand";
import { authAPI } from "../lib/api";

type Role = "admin" | "customer" | string;
interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role?: Role;
}

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    name: string,
    phone?: string
  ) => Promise<{ error: Error | null }>;
  adminSignIn: (
    email: string,
    password: string
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const TOKEN_KEYS = ["token", "access"];
const getAnyToken = () =>
  TOKEN_KEYS.map((k) => localStorage.getItem(k)).find(Boolean) || null;
const setTokenEverywhere = (t: string | null) => {
  if (!t) TOKEN_KEYS.forEach((k) => localStorage.removeItem(k));
  else TOKEN_KEYS.forEach((k) => localStorage.setItem(k, t));
};
const decode = (t: string) => {
  try {
    return JSON.parse(atob(t.split(".")[1]));
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAdmin: false,
  loading: true,

  initialize: async () => {
    try {
      const token = getAnyToken();
      if (!token) {
        set({ loading: false });
        return;
      }
      // optimistic set from JWT
      const p = decode(token);
      if (p?.email)
        set({
          user: { id: p.sub, email: p.email, role: p.role, name: p.name },
          isAdmin: p.role === "admin",
        });

      const me = await authAPI.getMe();
      set({
        user: {
          id: me._id ?? me.id,
          email: me.email,
          name: me.name,
          phone: me.phone,
          role: me.role,
        },
        isAdmin: me.role === "admin",
        loading: false,
      });
    } catch (e) {
      console.error("Auth initialize failed:", e);
      setTokenEverywhere(null);
      set({ user: null, isAdmin: false, loading: false });
    }
  },

  signIn: async (email, password) => {
    try {
      const data = await authAPI.login(email, password);
      setTokenEverywhere(data?.token);
      const me = data?.user ?? (await authAPI.getMe());
      set({
        user: {
          id: me._id ?? me.id,
          email: me.email,
          name: me.name,
          phone: me.phone,
          role: me.role,
        },
        isAdmin: me.role === "admin",
      });
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  adminSignIn: async (email, password) => {
    try {
      const data = await authAPI.adminLogin(email, password);
      setTokenEverywhere(data?.token);
      const me = data?.user ?? (await authAPI.getMe());
      set({
        user: {
          id: me._id ?? me.id,
          email: me.email,
          name: me.name,
          phone: me.phone,
          role: me.role,
        },
        isAdmin: me.role === "admin",
      });
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  signUp: async (email, password, name, phone) => {
    try {
      const data = await authAPI.register(email, password, name, phone);
      setTokenEverywhere(data?.token);
      const me = data?.user ?? (await authAPI.getMe());
      set({
        user: {
          id: me._id ?? me.id,
          email: me.email,
          name: me.name,
          phone: me.phone,
          role: me.role,
        },
        isAdmin: me.role === "admin",
      });
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  signOut: async () => {
    try {
      await authAPI.logout();
    } finally {
      setTokenEverywhere(null);
      set({ user: null, isAdmin: false });
    }
  },
}));
