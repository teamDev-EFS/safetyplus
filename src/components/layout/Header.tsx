// src/components/layout/Header.tsx
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  User,
  Heart,
  Sun,
  Moon,
  Menu,
  Package,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { useTheme } from "../ThemeProvider";
import { Button } from "../ui/Button";
import { useState } from "react";

export function Header() {
  const { user, isAdmin, signOut } = useAuthStore();
  const { items } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Brand */}
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="/logo.jpg"
              alt="SafetyPlus Logo"
              className="w-10 h-10 rounded-xl object-cover"
            />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              SafetyPlus
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link
              to="/shop"
              className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition font-medium"
            >
              Shop
            </Link>
            <Link
              to="/about"
              className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition font-medium"
            >
              About
            </Link>
            <Link
              to="/team"
              className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition font-medium"
            >
              Team
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition font-medium"
            >
              Contact
            </Link>
            <Link
              to="/documents"
              className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition font-medium"
            >
              Documents
            </Link>

            {/* Admin link (desktop) */}
            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50 transition"
                aria-label="Admin Dashboard"
              >
                <Package className="w-4 h-4" />
                Admin
              </Link>
            )}
          </nav>

          {/* Right controls */}
          <div className="flex items-center space-x-2">
            {/* Theme */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>

            {/* Auth buttons (desktop) */}
            {user ? (
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/account">
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    {user?.name || "Account"}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden pb-4 space-y-2">
            <Link
              to="/shop"
              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            >
              Shop
            </Link>
            <Link
              to="/about"
              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            >
              About
            </Link>
            <Link
              to="/team"
              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            >
              Team
            </Link>
            <Link
              to="/contact"
              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            >
              Contact
            </Link>
            <Link
              to="/documents"
              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            >
              Documents
            </Link>

            {/* Admin link (mobile) */}
            {isAdmin && (
              <Link
                to="/admin"
                className="block px-4 py-2 rounded-lg transition bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
              >
                Admin Dashboard
              </Link>
            )}

            {!user ? (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/account"
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  My Account
                </Link>
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
