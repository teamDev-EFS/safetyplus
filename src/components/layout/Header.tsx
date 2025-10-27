import { Link } from 'react-router-dom';
import { ShoppingCart, User, Heart, Sun, Moon, Menu, Package } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useTheme } from '../ThemeProvider';
import { Button } from '../ui/Button';
import { useState } from 'react';

export function Header() {
  const { user, profile, signOut } = useAuthStore();
  const { items } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">SafetyPlus</span>
          </Link>

          <nav className="hidden lg:flex items-center space-x-6">
            <Link to="/shop" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition font-medium">
              Shop
            </Link>
            <Link to="/gallery" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition font-medium">
              Gallery
            </Link>
            <Link to="/blog" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition font-medium">
              Blog
            </Link>
            <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition font-medium">
              About
            </Link>
            <Link to="/team" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition font-medium">
              Team
            </Link>
            <Link to="/contact" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition font-medium">
              Contact
            </Link>
            <Link to="/track-order" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition font-medium">
              Track Order
            </Link>
          </nav>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {user && (
              <Link
                to="/wishlist"
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                <Heart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
            )}

            <Link
              to="/cart"
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/account">
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    {profile?.name || 'Account'}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="lg:hidden pb-4 space-y-2">
            <Link to="/shop" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
              Shop
            </Link>
            <Link to="/gallery" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
              Gallery
            </Link>
            <Link to="/blog" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
              Blog
            </Link>
            <Link to="/about" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
              About
            </Link>
            <Link to="/team" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
              Team
            </Link>
            <Link to="/contact" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
              Contact
            </Link>
            <Link to="/track-order" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
              Track Order
            </Link>
            {!user && (
              <>
                <Link to="/login" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
                  Login
                </Link>
                <Link to="/register" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
                  Register
                </Link>
              </>
            )}
            {user && (
              <>
                <Link to="/account" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
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
