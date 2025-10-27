export interface Profile {
  id: string;
  email: string;
  phone: string | null;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Admin {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  type: 'billing' | 'shipping';
  label: string | null;
  name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  image_path: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_path: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  path: string;
  alt: string;
  is_primary: boolean;
}

export interface ProductSpec {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category_id: string | null;
  brand_id: string | null;
  description_html: string | null;
  specs: ProductSpec[];
  attributes: Record<string, string[]>;
  price_mrp: number;
  price_sell: number;
  currency: string;
  stock_qty: number;
  low_stock_threshold: number;
  allow_backorder: boolean;
  images: ProductImage[];
  badges: string[];
  tags: string[];
  is_active: boolean;
  is_featured: boolean;
  view_count: number;
  sold_count: number;
  created_at: string;
  updated_at: string;
  category?: Category;
  brand?: Brand;
}

export interface CartItem {
  product_id: string;
  sku: string;
  name: string;
  price: number;
  qty: number;
  image_path: string;
}

export interface CartTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  grand: number;
}

export interface Cart {
  id: string;
  user_id: string | null;
  items: CartItem[];
  totals: CartTotals;
  updated_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface OrderAddress {
  name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface OrderItem {
  product_id: string;
  sku: string;
  name: string;
  price: number;
  qty: number;
  image_path: string;
}

export interface OrderStatusHistory {
  status: OrderStatus;
  note?: string;
  at: string;
}

export type PaymentMethod = 'PO' | 'COD' | 'Offline';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type OrderStatus = 'placed' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  order_no: string;
  user_id: string | null;
  guest_info: { name: string; email: string; phone: string } | null;
  items: OrderItem[];
  totals: CartTotals;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
  status_history: OrderStatusHistory[];
  shipping_address: OrderAddress;
  billing_address: OrderAddress;
  tracking_courier: string | null;
  tracking_no: string | null;
  tracking_eta: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  cta_text: string | null;
  cta_url: string | null;
  image_path: string;
  position: 'hero' | 'promo';
  priority: number;
  schedule_start: string | null;
  schedule_end: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content_html: string;
  cover_image_path: string | null;
  excerpt: string | null;
  tags: string[];
  author_id: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  author_name: string;
  author_role: string;
  author_image_path: string | null;
  quote: string;
  rating: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  logo_path: string;
  website_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Settings {
  id: string;
  store_name: string;
  store_email: string | null;
  store_phone: string | null;
  store_address: any;
  logo_path: string | null;
  favicon_path: string | null;
  theme_colors: any;
  smtp_settings: any;
  tax_rate: number;
  currency: string;
  seo_defaults: any;
  updated_at: string;
}

export type NotificationType = 'cart_updated' | 'order_new' | 'inventory_low' | 'contact_new';

export interface Notification {
  id: string;
  type: NotificationType;
  payload: any;
  is_read: boolean;
  created_at: string;
}

export interface Meeting {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferred_slots: any;
  message: string | null;
  meet_url: string | null;
  calendar_event_id: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}
