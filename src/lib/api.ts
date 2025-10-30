// src/lib/api.ts
function resolveApiBaseUrl(): string {
  const fromEnv = (import.meta as any).env?.VITE_API_URL as string | undefined;
  if (fromEnv && typeof fromEnv === "string" && fromEnv.trim()) {
    return fromEnv.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname.toLowerCase();

    // Primary production domain
    if (host.endsWith("safetyplus.co.in")) {
      return "https://api.safetyplus.co.in"; // point this DNS to Render backend
    }

    // Netlify previews or main site
    if (host.endsWith("netlify.app")) {
      // fallback to Render default domain if custom domain not set yet
      return "https://safetyplus-backend.onrender.com";
    }
  }

  return "http://localhost:5000";
}

const API_URL = `${resolveApiBaseUrl()}/api`;

// Shared fetch helper (handles JSON & FormData, 204s)
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token") || localStorage.getItem("access");
  const isFormData = options.body instanceof FormData;

  const defaultHeaders: HeadersInit = {};
  if (!isFormData) defaultHeaders["Content-Type"] = "application/json";
  if (token) defaultHeaders["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include",
    ...options,
    headers: { ...defaultHeaders, ...(options.headers || {}) },
  });

  if (!res.ok) {
    let msg = "API request failed";
    try {
      const j = await res.json();
      msg = j?.message || msg;
    } catch {
      // ignore JSON parse failure on error bodies
    }
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("access");
    }
    throw new Error(msg);
  }

  // 204 No Content
  if (res.status === 204) return {};

  // Prefer JSON if available (charset-safe)
  const ct = res.headers.get("content-type") || "";
  if (ct.toLowerCase().includes("application/json")) {
    return res.json();
  }

  // Fallback to text (DELETEs or plain responses)
  const text = await res.text();
  try {
    // if server sent JSON without a proper header
    return text ? JSON.parse(text) : {};
  } catch {
    return text as unknown as any;
  }
}

// -------- Auth --------
export const authAPI = {
  login: async (email: string, password: string) => {
    const data = await fetchAPI("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if ((data as any)?.token)
      localStorage.setItem("token", (data as any).token);
    return data as { user: any; token: string };
  },
  adminLogin: async (email: string, password: string) => {
    const data = await fetchAPI("/auth/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if ((data as any)?.token)
      localStorage.setItem("token", (data as any).token);
    return data as { user: any; token: string };
  },
  register: async (
    email: string,
    password: string,
    name: string,
    phone?: string
  ) => {
    const data = await fetchAPI("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name, phone }),
    });
    if ((data as any)?.token)
      localStorage.setItem("token", (data as any).token);
    return data as { user: any; token: string };
  },
  logout: async () => {
    await fetchAPI("/auth/logout", { method: "POST" });
    localStorage.removeItem("token");
    localStorage.removeItem("access");
  },
  getMe: async () => fetchAPI("/auth/me"),
  forgotPassword: async (email: string) =>
    fetchAPI("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: async (token: string, password: string) =>
    fetchAPI("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),
};

// -------- Products --------
export const productsAPI = {
  // public
  getAll: async (params?: {
    q?: string;
    category?: string;
    brand?: string;
    min?: number;
    max?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }) => {
    const q = new URLSearchParams();
    if (params?.q) q.append("q", params.q);
    if (params?.category) q.append("category", params.category);
    if (params?.brand) q.append("brand", params.brand);
    if (params?.min) q.append("min", String(params.min));
    if (params?.max) q.append("max", String(params.max));
    if (params?.sort) q.append("sort", params.sort);
    if (params?.page) q.append("page", String(params.page));
    if (params?.limit) q.append("limit", String(params.limit));
    return fetchAPI(`/products?${q.toString()}`);
  },
  getBySlug: async (slug: string) => fetchAPI(`/products/${slug}`),
  getFeatured: async () => fetchAPI("/products/featured/list"),

  // admin list normalized -> {items,total,page,pageSize}
  adminList: async (params?: {
    page?: number;
    limit?: number;
    q?: string;
    sort?: string;
    active?: string;
  }): Promise<{
    items: any[];
    total: number;
    page: number;
    pageSize: number;
  }> => {
    const qs = new URLSearchParams();
    if (params?.page) qs.append("page", String(params.page));
    if (params?.limit) qs.append("limit", String(params.limit));
    if (params?.q) qs.append("q", params.q);
    if (params?.sort) qs.append("sort", params.sort);
    if (params?.active) qs.append("active", params.active);

    const res = await fetchAPI(`/admin/products?${qs.toString()}`);
    if (Array.isArray(res)) {
      return {
        items: res as any[],
        total: (res as any[]).length,
        page: 1,
        pageSize: (res as any[]).length,
      };
    }
    const r: any = res || {};
    const items = Array.isArray(r.items)
      ? r.items
      : Array.isArray(r.products)
      ? r.products
      : [];
    const total = Number(r.total ?? items.length) || items.length;
    const page = Number(r.page ?? 1);
    const pageSize =
      Number(r.limit ?? r.pageSize ?? items.length) || items.length;
    return { items, total, page, pageSize };
  },

  adminGetById: async (id: string) => fetchAPI(`/admin/products/${id}`),

  adminCreate: async (form: FormData) =>
    fetchAPI("/admin/products", { method: "POST", body: form }),

  adminUpdate: async (id: string, form: FormData) =>
    fetchAPI(`/admin/products/${id}`, { method: "PUT", body: form }),

  adminDelete: async (id: string) =>
    fetchAPI(`/admin/products/${id}`, { method: "DELETE" }),

  // optional helper if you want quick status toggling
  adminToggleActive: async (id: string, isActive: boolean) =>
    fetchAPI(`/admin/products/${id}/active`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    }),
};

// -------- Cart --------
export const cartAPI = {
  get: async () => fetchAPI("/cart"),
  add: async (productId: string, qty: number = 1) =>
    fetchAPI("/cart/add", {
      method: "POST",
      body: JSON.stringify({ productId, qty }),
    }),
  update: async (productId: string, qty: number) =>
    fetchAPI(`/cart/${productId}`, {
      method: "PUT",
      body: JSON.stringify({ qty }),
    }),
  remove: async (productId: string) =>
    fetchAPI(`/cart/${productId}`, { method: "DELETE" }),
  clear: async () => fetchAPI("/cart", { method: "DELETE" }),
};

// -------- Wishlist --------
export const wishlistAPI = {
  get: async () => fetchAPI("/wishlist"),
  add: async (productId: string) =>
    fetchAPI("/wishlist/add", {
      method: "POST",
      body: JSON.stringify({ productId }),
    }),
  remove: async (productId: string) =>
    fetchAPI(`/wishlist/remove/${productId}`, { method: "DELETE" }),
  clear: async () => fetchAPI("/wishlist/clear", { method: "DELETE" }),
};

// -------- Orders --------
export const ordersAPI = {
  getAll: async () => fetchAPI("/orders"),
  getByOrderNo: async (orderNo: string, email?: string, phone?: string) => {
    const p = new URLSearchParams();
    if (email) p.append("email", email);
    if (phone) p.append("phone", phone);
    return fetchAPI(`/orders/${orderNo}?${p.toString()}`);
  },
  adminGetAll: async () => fetchAPI("/admin/orders"),
};

// -------- Notifications --------
export const notificationsAPI = {
  getAll: async () => fetchAPI("/admin/notifications"),
  getUnreadCount: async () => fetchAPI("/admin/notifications/unread-count"),
  markAsRead: async (id: string) =>
    fetchAPI(`/admin/notifications/${id}/read`, { method: "PATCH" }),
  markAllAsRead: async () =>
    fetchAPI("/admin/notifications/mark-all-read", { method: "PATCH" }),
  delete: async (id: string) =>
    fetchAPI(`/admin/notifications/${id}`, { method: "DELETE" }),
};

// -------- Contact / Team / Albums / Blog / Misc --------
export const contactAPI = {
  submit: async (data: {
    name: string;
    company: string;
    mobile: string;
    email: string;
    subject: string;
    message: string;
  }) => fetchAPI("/contact", { method: "POST", body: JSON.stringify(data) }),
  adminGetAll: async (params?: {
    page?: number;
    limit?: number;
    sort?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.append("page", String(params.page));
    if (params?.limit) qs.append("limit", String(params.limit));
    if (params?.sort) qs.append("sort", params.sort);
    return fetchAPI(`/admin/contacts?${qs.toString()}`);
  },
  adminGetById: async (id: string) => fetchAPI(`/admin/contacts/${id}`),
  adminDelete: async (id: string) =>
    fetchAPI(`/admin/contacts/${id}`, { method: "DELETE" }),
  adminUpdateStatus: async (id: string, status: string) =>
    fetchAPI(`/admin/contacts/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

export const teamAPI = { getAll: async () => fetchAPI("/team") };

export const albumsAPI = {
  getAll: async (params?: { page?: number; limit?: number; tag?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.append("page", String(params.page));
    if (params?.limit) q.append("limit", String(params.limit));
    if (params?.tag) q.append("tag", params.tag);
    return fetchAPI(`/albums?${q.toString()}`);
  },
  getBySlug: async (slug: string) => fetchAPI(`/albums/${slug}`),
};

export const blogAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    tag?: string;
    q?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.append("page", String(params.page));
    if (params?.limit) qs.append("limit", String(params.limit));
    if (params?.tag) qs.append("tag", params.tag);
    if (params?.q) qs.append("q", params.q);
    return fetchAPI(`/blog?${qs.toString()}`);
  },
  getBySlug: async (slug: string) => fetchAPI(`/blog/${slug}`),
};

export const branchesAPI = { getAll: async () => fetchAPI("/branches") };
export const settingsAPI = { get: async () => fetchAPI("/settings") };

export const aiAPI = {
  respond: async (
    messages: Array<{ role: string; content: string }>,
    context?: any
  ) =>
    fetchAPI("/ai/respond", {
      method: "POST",
      body: JSON.stringify({ messages, context }),
    }),
};
export const categoriesAPI = {
  // Expecting an array of { _id, name } or { items: [...] }
  getAll: async () => fetchAPI("/categories"),
  create: async (data: {
    name: string;
    description?: string;
    parentId?: string;
    sortOrder?: number;
    isActive?: boolean;
  }) => fetchAPI("/categories", { method: "POST", body: JSON.stringify(data) }),
  update: async (
    id: string,
    data: {
      name: string;
      description?: string;
      parentId?: string;
      sortOrder?: number;
      isActive?: boolean;
    }
  ) =>
    fetchAPI(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: async (id: string) =>
    fetchAPI(`/categories/${id}`, { method: "DELETE" }),
};
export { API_URL };
