// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuthStore } from "./store/authStore";
import { initSocket, disconnectSocket } from "./lib/socket";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster as SonnerToaster } from "sonner";

// Public
import { HomePage } from "./pages/HomePage";
import { ShopPage } from "./pages/ShopPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { AccountPage } from "./pages/AccountPage";
import { ContactPage } from "./pages/ContactPage";
import { WishlistPage } from "./pages/WishlistPage";
import { AboutPage } from "./pages/AboutPage";
import { TeamPage } from "./pages/TeamPage";
import { GalleryPage } from "./pages/GalleryPage";
import { BlogPage } from "./pages/BlogPage";
import { BlogDetailPage } from "./pages/BlogDetailPage";
import { TrackOrderPage } from "./pages/TrackOrderPage";
import { DocumentsPage } from "./pages/DocumentsPage";

// Assistant
import { AssistantFAB } from "./components/chat/AssistantFAB";
import { AssistantDrawer } from "./components/chat/AssistantDrawer";

// Admin
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminProductsPage } from "./pages/admin/AdminProductsPage";
import { AdminOrdersPage } from "./pages/admin/AdminOrdersPage";
import { AdminContactsPage } from "./pages/admin/AdminContactsPage";
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminGuard from "./components/admin/AdminGuard";
import { AdminProductEditPage } from "./pages/admin/AdminProductEditPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminTeamPage from "./pages/admin/AdminTeamPage";
import AdminPostPage from "./pages/admin/AdminPostsPage";
import AdminGalleryPage from "./pages/admin/AdminGalleryPage";
import AdminBranchesPage from "./pages/admin/AdminBranchesPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

function Placeholder({ title }: { title: string }) {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-sm text-gray-500 mt-2">Coming soon…</p>
    </div>
  );
}

function App() {
  const { initialize, loading, user } = useAuthStore();
  const [assistantOpen, setAssistantOpen] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!user) return;
    const socket = initSocket(user.id, user.role);
    socket?.on("cart:updated", (d: any) => console.log("Cart updated:", d));
    socket?.on("order:status", (d: any) => console.log("Order status:", d));
    return () => disconnectSocket();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/products" element={<ShopPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogDetailPage />} />
            <Route path="/track-order" element={<TrackOrderPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/account/*" element={<AccountPage />} />

            {/* Admin auth */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Admin protected routes (Layout + Outlet) */}
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminLayout />
                </AdminGuard>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="contacts" element={<AdminContactsPage />} />
              <Route path="products/new" element={<AdminProductEditPage />} />
              <Route path="/admin/team" element={<AdminTeamPage />} />
              <Route path="/admin/posts" element={<AdminPostPage />} />
              <Route path="/admin/gallery" element={<AdminGalleryPage />} />
              <Route path="/admin/branches" element={<AdminBranchesPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
              <Route
                path="products/:id/edit"
                element={<AdminProductEditPage />}
              />
              {/* stubs */}
              <Route path="posts" element={<Placeholder title="Posts" />} />
              <Route path="gallery" element={<Placeholder title="Gallery" />} />
              <Route path="team" element={<Placeholder title="Team" />} />
              <Route
                path="branches"
                element={<Placeholder title="Branches" />}
              />
              <Route
                path="settings"
                element={<Placeholder title="Settings" />}
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <AssistantFAB onClick={() => setAssistantOpen(true)} />
          <AssistantDrawer
            isOpen={assistantOpen}
            onClose={() => setAssistantOpen(false)}
          />
          <SonnerToaster />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
