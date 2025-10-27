import { useAuthStore } from '../../store/authStore';
import { Navigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import { ArrowLeft } from 'lucide-react';

export function AdminOrdersPage() {
  const { isAdmin } = useAuthStore();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      return data;
    },
  });

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Orders</h1>
          </div>
        </div>
      </header>

      <div className="p-8">
        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Order No</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders?.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{order.order_no}</td>
                    <td className="px-6 py-4 text-sm">
                      {order.guest_info ? (
                        <div>
                          <div>{order.guest_info.name}</div>
                          <div className="text-gray-500">{order.guest_info.email}</div>
                        </div>
                      ) : (
                        'Registered User'
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">{order.items.length} items</td>
                    <td className="px-6 py-4 font-medium">{formatCurrency(order.totals.grand)}</td>
                    <td className="px-6 py-4 text-sm">{order.payment_method}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
