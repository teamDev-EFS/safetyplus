import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '../components/ui/Toaster';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast(error.message, 'error');
    } else {
      toast('Welcome back!', 'success');
      navigate('/');
    }

    setLoading(false);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-amber-600 hover:text-amber-700 font-medium">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
