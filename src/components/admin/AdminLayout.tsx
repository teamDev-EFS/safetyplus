import { useState, useEffect } from "react";
import {
  NavLink,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useNotificationStore } from "../../store/notificationStore";
import { NotificationPanel } from "./NotificationPanel";
import { useSocket } from "../../lib/socket";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  FileText,
  Image,
  Users,
  MapPin,
  Settings as SettingsIcon,
  Menu,
  X,
  Search,
  Moon,
  Sun,
  Bell,
  LogOut,
  User,
} from "lucide-react";
import { useTheme } from "../ThemeProvider";

type IconType = React.ComponentType<{ className?: string }>;

const nav: Array<{ name: string; to: string; icon: IconType; end?: boolean }> =
  [
    { name: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true },
    { name: "Products", to: "/admin/products", icon: Package },
    { name: "Categories", to: "/admin/categories", icon: FolderTree },
    { name: "Orders", to: "/admin/orders", icon: ShoppingCart },
    { name: "Contacts", to: "/admin/contacts", icon: User },
    { name: "Posts", to: "/admin/posts", icon: FileText },
    { name: "Gallery", to: "/admin/gallery", icon: Image },
    { name: "Team", to: "/admin/team", icon: Users },
    { name: "Branches", to: "/admin/branches", icon: MapPin },
    { name: "Settings", to: "/admin/settings", icon: SettingsIcon },
  ];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const { pathname } = useLocation();
  const {
    unreadCount,
    fetchUnreadCount,
    togglePanel,
    isOpen,
    addNotification,
  } = useNotificationStore();
  const { connectSocket, socket } = useSocket();

  // Fetch unread count on mount
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Connect socket for admin
  useEffect(() => {
    if (user?.role === "admin") {
      connectSocket();
    }
  }, [user, connectSocket]);

  // Listen for real-time notifications
  useEffect(() => {
    if (socket) {
      socket.on("admin:notification", (data) => {
        addNotification({
          _id: `temp-${Date.now()}`,
          type: data.type,
          title: data.title,
          message: data.message,
          data: {
            orderNo: data.orderNo,
            contactId: data.contactId,
            name: data.name,
          },
          isRead: false,
          createdAt: new Date().toISOString(),
        });
        fetchUnreadCount(); // Refresh count
      });

      return () => {
        socket.off("admin:notification");
      };
    }
  }, [socket, addNotification, fetchUnreadCount]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-950">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Admin Sidebar"
      >
        <div className="flex h-full flex-col">
          {/* Brand */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 grid place-items-center shadow-sm">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <div>
                  <div className="font-bold text-lg text-gray-900 dark:text-white">
                    SafetyPlus
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Admin Portal
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {nav.map(({ name, to, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    isActive
                      ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                  ].join(" ")
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Current user */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 grid place-items-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name ?? "Admin User"}
                </div>
                <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="md:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/70 dark:bg-gray-900/70 backdrop-blur border-b border-gray-200 dark:border-gray-800">
          <div className="px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Open sidebar"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="hidden md:block text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300">
                Admin Portal
                <span className="ml-2 text-xs text-gray-400">• {pathname}</span>
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen((s) => !s)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={togglePanel}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              <Link
                to="/"
                className="ml-3 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                View Store
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Tiny search popover */}
      {searchOpen && (
        <div className="fixed right-6 top-20 z-40 w-[22rem] rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Start typing to search products, orders, posts…
          </p>
        </div>
      )}

      {/* Notification Panel */}
      <NotificationPanel isOpen={isOpen} onClose={() => togglePanel()} />
    </div>
  );
}
