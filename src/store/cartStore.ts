import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { CartItem, CartTotals } from '../types/database';

interface CartState {
  items: CartItem[];
  totals: CartTotals;
  addItem: (item: Omit<CartItem, 'qty'> & { qty?: number }) => void;
  updateQuantity: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  syncWithServer: (userId: string) => Promise<void>;
  calculateTotals: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totals: {
        subtotal: 0,
        tax: 0,
        shipping: 0,
        grand: 0,
      },

      addItem: (item) => {
        const existingItem = get().items.find((i) => i.product_id === item.product_id);

        if (existingItem) {
          set({
            items: get().items.map((i) =>
              i.product_id === item.product_id
                ? { ...i, qty: i.qty + (item.qty || 1) }
                : i
            ),
          });
        } else {
          set({
            items: [...get().items, { ...item, qty: item.qty || 1 }],
          });
        }

        get().calculateTotals();
        get().syncWithServer('');
      },

      updateQuantity: (productId, qty) => {
        if (qty <= 0) {
          get().removeItem(productId);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.product_id === productId ? { ...item, qty } : item
          ),
        });

        get().calculateTotals();
        get().syncWithServer('');
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.product_id !== productId),
        });

        get().calculateTotals();
        get().syncWithServer('');
      },

      clear: () => {
        set({ items: [], totals: { subtotal: 0, tax: 0, shipping: 0, grand: 0 } });
      },

      syncWithServer: async (userId) => {
        if (!userId) return;

        const { items, totals } = get();

        try {
          const { data: existingCart } = await supabase
            .from('carts')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();

          if (existingCart) {
            await supabase
              .from('carts')
              .update({ items, totals })
              .eq('id', existingCart.id);
          } else {
            await supabase
              .from('carts')
              .insert({ user_id: userId, items, totals });
          }

          await supabase
            .from('notifications')
            .insert({
              type: 'cart_updated',
              payload: {
                user_id: userId,
                items_count: items.length,
                cart_preview: items.slice(0, 3),
                timestamp: new Date().toISOString(),
              },
            });
        } catch (error) {
          console.error('Cart sync error:', error);
        }
      },

      calculateTotals: () => {
        const items = get().items;
        const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
        const tax = subtotal * 0.18;
        const shipping = subtotal > 1000 ? 0 : 50;
        const grand = subtotal + tax + shipping;

        set({ totals: { subtotal, tax, shipping, grand } });
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
