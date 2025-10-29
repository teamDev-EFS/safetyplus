import { create } from "zustand";
import { persist } from "zustand/middleware";
import { wishlistAPI } from "../lib/api";
import { Product } from "../types/database";
import { useAuthStore } from "./authStore";

interface WishlistItem {
  productId: string;
  addedAt: string;
  product?: Product;
}

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  fetchWishlist: () => Promise<void>;
  addItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,

      fetchWishlist: async () => {
        const { user } = useAuthStore.getState();
        set({ loading: true });

        try {
          if (user) {
            // Authenticated user - fetch from server
            const data = await wishlistAPI.get();
            set({ items: data.items || [], loading: false });
          } else {
            // Guest user - wishlist is already loaded from localStorage via persist
            set({ loading: false });
          }
        } catch (error) {
          console.error("Wishlist fetch error:", error);
          set({ loading: false });
        }
      },

      addItem: async (productId: string) => {
        const { user } = useAuthStore.getState();
        const { items } = get();

        // Check if item already exists
        if (items.some((item) => item.productId === productId)) {
          return;
        }

        const newItem: WishlistItem = {
          productId,
          addedAt: new Date().toISOString(),
        };

        try {
          if (user) {
            // Authenticated user - sync with server
            await wishlistAPI.add(productId);
            const data = await wishlistAPI.get();
            set({ items: data.items || [] });
          } else {
            // Guest user - add to local storage
            set({ items: [...items, newItem] });
          }
        } catch (error) {
          console.error("Add to wishlist error:", error);
          // For guest users, still add locally even if server fails
          if (!user) {
            set({ items: [...items, newItem] });
          }
        }
      },

      removeItem: async (productId: string) => {
        const { user } = useAuthStore.getState();
        const { items } = get();

        try {
          if (user) {
            // Authenticated user - sync with server
            await wishlistAPI.remove(productId);
            const data = await wishlistAPI.get();
            set({ items: data.items || [] });
          } else {
            // Guest user - remove from local storage
            set({
              items: items.filter((item) => item.productId !== productId),
            });
          }
        } catch (error) {
          console.error("Remove from wishlist error:", error);
          // For guest users, still remove locally even if server fails
          if (!user) {
            set({
              items: items.filter((item) => item.productId !== productId),
            });
          }
        }
      },

      removeFromWishlist: async (productId: string) => {
        const { user } = useAuthStore.getState();
        const { items } = get();

        try {
          if (user) {
            // Authenticated user - sync with server
            await wishlistAPI.remove(productId);
            const data = await wishlistAPI.get();
            set({ items: data.items || [] });
          } else {
            // Guest user - remove from local storage
            set({
              items: items.filter((item) => item.productId !== productId),
            });
          }
        } catch (error) {
          console.error("Remove from wishlist error:", error);
          // For guest users, still remove locally even if server fails
          if (!user) {
            set({
              items: items.filter((item) => item.productId !== productId),
            });
          }
        }
      },

      clear: async () => {
        const { user } = useAuthStore.getState();

        try {
          if (user) {
            // Authenticated user - sync with server
            await wishlistAPI.clear();
          }
          set({ items: [] });
        } catch (error) {
          console.error("Clear wishlist error:", error);
          set({ items: [] });
        }
      },
    }),
    {
      name: "wishlist-storage",
    }
  )
);
