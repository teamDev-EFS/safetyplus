import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { useCartStore } from '../store/cartStore';
import { formatCurrency, getImageUrl } from '../lib/utils';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';

export function CartPage() {
  const { items, totals, updateQuantity, removeItem } = useCartStore();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-700 mb-6" />
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Your cart is empty</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Start shopping to add items to your cart</p>
          <Link to="/shop">
            <Button size="lg">Continue Shopping</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.product_id} className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-md flex gap-6">
                <div className="w-24 h-24 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                  <img
                    src={getImageUrl(item.image_path)}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">{item.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">SKU: {item.sku}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.qty - 1)}
                        className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                      >
                        −
                      </button>
                      <span className="px-4 py-1 border-x border-gray-300 dark:border-gray-700">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.qty + 1)}
                        className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(item.price * item.qty)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(item.price)} each
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-md sticky top-24">
              <h2 className="font-bold text-xl mb-6 text-gray-900 dark:text-white">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax (18%)</span>
                  <span>{formatCurrency(totals.tax)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span>{totals.shipping === 0 ? 'FREE' : formatCurrency(totals.shipping)}</span>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>{formatCurrency(totals.grand)}</span>
                  </div>
                </div>
              </div>

              <Link to="/checkout">
                <Button size="lg" className="w-full mb-3">
                  Proceed to Checkout
                </Button>
              </Link>

              <Link to="/shop">
                <Button variant="outline" size="lg" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
