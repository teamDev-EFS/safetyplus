import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { Product } from '../types/database';

interface WishlistState {
  items: Product[];
  loading: boolean;
  fetchWishlist: (userId: string) => Promise<void>;
  addItem: (userId: string, productId: string) => Promise<boolean>;
  removeItem: (userId: string, productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,

      fetchWishlist: async (userId: string) => {
        if (!userId) return;

        set({ loading: true });
        try {
          const { data, error } = await supabase
            .from('wishlists')
            .select('product:products(*, category:categories(*), brand:brands(*))')
            .eq('user_id', userId);

          if (error) throw error;

          const products = data?.map((item: any) => item.product).filter(Boolean) || [];
          set({ items: products, loading: false });
        } catch (error) {
          console.error('Fetch wishlist error:', error);
          set({ loading: false });
        }
      },

      addItem: async (userId: string, productId: string) => {
        try {
          const { data: product } = await supabase
            .from('products')
            .select('*, category:categories(*), brand:brands(*)')
            .eq('id', productId)
            .maybeSingle();

          if (!product) return false;

          const { error } = await supabase
            .from('wishlists')
            .insert({ user_id: userId, product_id: productId });

          if (error) {
            if (error.code === '23505') {
              return false;
            }
            throw error;
          }

          set((state) => ({
            items: [...state.items, product as Product],
          }));

          return true;
        } catch (error) {
          console.error('Add to wishlist error:', error);
          return false;
        }
      },

      removeItem: async (userId: string, productId: string) => {
        try {
          const { error } = await supabase
            .from('wishlists')
            .delete()
            .eq('user_id', userId)
            .eq('product_id', productId);

          if (error) throw error;

          set((state) => ({
            items: state.items.filter((item) => item.id !== productId),
          }));
        } catch (error) {
          console.error('Remove from wishlist error:', error);
        }
      },

      isInWishlist: (productId: string) => {
        return get().items.some((item) => item.id === productId);
      },

      clear: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({ items: [] }),
    }
  )
);
