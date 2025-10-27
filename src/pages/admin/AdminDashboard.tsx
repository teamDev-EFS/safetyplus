import { useAuthStore } from '../../store/authStore';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Package, ShoppingCart, Users, BarChart3 } from 'lucide-react';

export function AdminDashboard() {
  const { isAdmin } = useAuthStore();

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const stats = [
    { label: 'Total Products', value: '124', icon: Package, color: 'from-blue-500 to-blue-600' },
    { label: 'Total Orders', value: '45', icon: ShoppingCart, color: 'from-green-500 to-green-600' },
    { label: 'Customers', value: '89', icon: Users, color: 'from-purple-500 to-purple-600' },
    { label: 'Revenue', value: '₹2.4L', icon: BarChart3, color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Link to="/">
            <Button variant="outline" size="sm">View Store</Button>
          </Link>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Link to="/admin/products" className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <Package className="w-8 h-8 text-amber-600 mb-4" />
            <h2 className="text-xl font-bold mb-2">Manage Products</h2>
            <p className="text-gray-600">Add, edit, and organize your product catalog</p>
          </Link>

          <Link to="/admin/orders" className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <ShoppingCart className="w-8 h-8 text-green-600 mb-4" />
            <h2 className="text-xl font-bold mb-2">Manage Orders</h2>
            <p className="text-gray-600">View and process customer orders</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
