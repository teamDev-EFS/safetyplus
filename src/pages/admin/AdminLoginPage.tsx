// src/pages/admin/AdminLoginPage.tsx
import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate, useLocation } from "react-router-dom";

export function AdminLoginPage() {
  const [email, setEmail] = useState("admin@safetyplus.com");
  const [password, setPassword] = useState("Admin@123");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { adminSignIn } = useAuthStore();
  const navigate = useNavigate();
  const loc = useLocation() as any;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const { error } = await adminSignIn(email, password);
    setLoading(false);
    if (error) {
      setErr(error.message || "Login failed");
      return;
    }
    navigate(loc.state?.from || "/admin", { replace: true });
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-green-900 to-emerald-800 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl grid place-items-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">A</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Sign in to manage your store
          </p>
        </div>
        {err && (
          <div className="mb-4 rounded bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-300 px-3 py-2">
            {err}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <button
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </form>
    </div>
  );
}
