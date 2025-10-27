import { useAuthStore } from '../../store/authStore';
import { Navigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { formatCurrency, getImageUrl } from '../../lib/utils';
import { ArrowLeft } from 'lucide-react';

export function AdminProductsPage() {
  const { isAdmin } = useAuthStore();

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('*, category:categories(*), brand:brands(*)')
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
            <h1 className="text-2xl font-bold">Products</h1>
          </div>
          <Button size="sm">Add Product</Button>
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
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products?.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={getImageUrl(product.images[0]?.path)}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.brand?.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{product.sku}</td>
                    <td className="px-6 py-4 text-sm">{product.category?.name || '—'}</td>
                    <td className="px-6 py-4 text-sm font-medium">{formatCurrency(product.price_sell)}</td>
                    <td className="px-6 py-4 text-sm">{product.stock_qty}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        product.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
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
