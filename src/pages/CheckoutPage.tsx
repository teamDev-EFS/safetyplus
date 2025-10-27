import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { formatCurrency } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { generateOrderNumber } from '../lib/utils';
import { useNavigate, Navigate } from 'react-router-dom';
import { toast } from '../components/ui/Toaster';

export function CheckoutPage() {
  const { items, totals, clear } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    payment_method: 'COD' as 'COD' | 'PO' | 'Offline',
  });

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderNo = generateOrderNumber();
      const address = {
        name: formData.name,
        phone: formData.phone,
        address_line1: formData.address_line1,
        address_line2: formData.address_line2 || undefined,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
        country: 'India',
      };

      const { error } = await supabase.from('orders').insert({
        order_no: orderNo,
        user_id: user?.id || null,
        guest_info: !user ? { name: formData.name, email: formData.email, phone: formData.phone } : null,
        items,
        totals,
        payment_method: formData.payment_method,
        payment_status: 'pending',
        status: 'placed',
        status_history: [
          {
            status: 'placed',
            at: new Date().toISOString(),
          },
        ],
        shipping_address: address,
        billing_address: address,
      });

      if (error) throw error;

      await supabase.from('notifications').insert({
        type: 'order_new',
        payload: {
          order_no: orderNo,
          total: totals.grand,
          email: formData.email,
          timestamp: new Date().toISOString(),
        },
      });

      clear();
      toast('Order placed successfully!', 'success');
      navigate(`/order-confirmation/${orderNo}`);
    } catch (error) {
      console.error('Order error:', error);
      toast('Failed to place order. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-md space-y-6">
              <div>
                <h2 className="font-bold text-xl mb-4 text-gray-900 dark:text-white">Customer Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent md:col-span-2"
                  />
                </div>
              </div>

              <div>
                <h2 className="font-bold text-xl mb-4 text-gray-900 dark:text-white">Shipping Address</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Address Line 1"
                    required
                    value={formData.address_line1}
                    onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Address Line 2 (Optional)"
                    value={formData.address_line2}
                    onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="City"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Postal Code"
                      required
                      value={formData.postal_code}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="font-bold text-xl mb-4 text-gray-900 dark:text-white">Payment Method</h2>
                <div className="space-y-3">
                  {(['COD', 'PO', 'Offline'] as const).map((method) => (
                    <label key={method} className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:border-amber-500 transition">
                      <input
                        type="radio"
                        name="payment_method"
                        value={method}
                        checked={formData.payment_method === method}
                        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as any })}
                        className="w-5 h-5 text-amber-600"
                      />
                      <span className="ml-3 font-medium">
                        {method === 'COD' ? 'Cash on Delivery' : method === 'PO' ? 'Purchase Order' : 'Offline Payment'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Placing Order...' : 'Place Order'}
              </Button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-md sticky top-24">
              <h2 className="font-bold text-xl mb-4 text-gray-900 dark:text-white">Order Summary</h2>
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                {items.map((item) => (
                  <div key={item.product_id} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.name} × {item.qty}
                    </span>
                    <span className="font-medium">{formatCurrency(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax</span>
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
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
