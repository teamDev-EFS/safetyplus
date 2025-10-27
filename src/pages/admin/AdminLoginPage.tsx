import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../components/ui/Toaster';

export function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminSignIn } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await adminSignIn(email, password);

    if (error) {
      toast(error.message, 'error');
    } else {
      toast('Welcome, Admin!', 'success');
      navigate('/admin');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">A</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
          <p className="text-gray-600 mt-2">Sign in to manage your store</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}
