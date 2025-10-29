// src/components/admin/AdminGuard.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function AdminGuard({ children }: { children: JSX.Element }) {
  const { user, isAdmin, loading } = useAuthStore();
  const loc = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-500" />
      </div>
    );
  }
  if (!user || !isAdmin)
    return (
      <Navigate to="/admin/login" replace state={{ from: loc.pathname }} />
    );
  return children;
}
