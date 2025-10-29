import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cartAPI } from "../lib/api";
import { CartItem, CartTotals } from "../types/database";

interface CartState {
  items: CartItem[];
  totals: CartTotals;
  addItem: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  updateQuantity: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  syncWithServer: () => Promise<void>;
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
        const existingItem = get().items.find(
          (i) => i.product_id === item.product_id
        );

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
        get().syncWithServer();
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
        get().syncWithServer();
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.product_id !== productId),
        });

        get().calculateTotals();
        get().syncWithServer();
      },

      clear: () => {
        set({
          items: [],
          totals: { subtotal: 0, tax: 0, shipping: 0, grand: 0 },
        });
      },

      syncWithServer: async () => {
        try {
          const { items } = get();

          // Get current cart from server
          const serverCart = await cartAPI.get();

          // Sync items
          for (const localItem of items) {
            const serverItem = serverCart.items.find(
              (si: any) => si.productId === localItem.product_id
            );

            if (serverItem) {
              if (serverItem.qty !== localItem.qty) {
                await cartAPI.update(localItem.product_id, localItem.qty);
              }
            } else {
              await cartAPI.add(localItem.product_id, localItem.qty);
            }
          }

          // Remove items not in local cart
          for (const serverItem of serverCart.items) {
            if (!items.find((i) => i.product_id === serverItem.productId)) {
              await cartAPI.remove(serverItem.productId);
            }
          }
        } catch (error) {
          console.error("Cart sync error:", error);
        }
      },

      calculateTotals: () => {
        const items = get().items;
        const subtotal = items.reduce(
          (sum, item) => sum + item.price * item.qty,
          0
        );
        const tax = subtotal * 0.18;
        const shipping = subtotal > 1000 ? 0 : 50;
        const grand = subtotal + tax + shipping;

        set({ totals: { subtotal, tax, shipping, grand } });
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
