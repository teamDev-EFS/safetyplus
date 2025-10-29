import { create } from "zustand";
import { notificationsAPI } from "../lib/api";

interface Notification {
  _id: string;
  type: "order_placed" | "order_updated" | "contact_form" | "system";
  title: string;
  message: string;
  data: any;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isOpen: boolean;

  // Actions
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
  togglePanel: () => void;
  closePanel: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isOpen: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const notifications = await notificationsAPI.getAll();
      set({ notifications, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const { count } = await notificationsAPI.getUnreadCount();
      set({ unreadCount: count });
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  },

  markAsRead: async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationsAPI.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          isRead: true,
          readAt: new Date().toISOString(),
        })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  },

  deleteNotification: async (id: string) => {
    try {
      await notificationsAPI.delete(id);
      set((state) => {
        const notification = state.notifications.find((n) => n._id === id);
        return {
          notifications: state.notifications.filter((n) => n._id !== id),
          unreadCount: notification?.isRead
            ? state.unreadCount
            : Math.max(0, state.unreadCount - 1),
        };
      });
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  },

  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  togglePanel: () => {
    set((state) => ({ isOpen: !state.isOpen }));
  },

  closePanel: () => {
    set({ isOpen: false });
  },
}));
