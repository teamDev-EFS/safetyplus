/*
  # Initial E-commerce Schema for Safety Equipment Store

  ## Overview
  Complete database schema for a production-grade e-commerce platform with customer and admin portals.

  ## New Tables

  ### Authentication & Users
  - `profiles` - Customer profiles linked to auth.users
    - id (uuid, FK to auth.users)
    - email, phone, name
    - is_active (boolean)
    - created_at, updated_at

  - `admins` - Admin users (separate from customers)
    - id (uuid, PK)
    - email (unique), password_hash, name
    - is_active, last_login_at
    - created_at, updated_at

  - `addresses` - Customer shipping/billing addresses
    - id (uuid, PK)
    - user_id (FK to profiles)
    - type (billing/shipping), label
    - name, phone, address_line1, address_line2
    - city, state, postal_code, country
    - is_default (boolean)

  ### Catalog
  - `categories` - Product categories (hierarchical)
    - id (uuid, PK)
    - name, slug (unique), description
    - parent_id (FK to categories, nullable for root)
    - image_path, sort_order
    - is_active (boolean)

  - `brands` - Product brands
    - id (uuid, PK)
    - name, slug (unique)
    - logo_path, description
    - is_active (boolean)

  - `products` - Products catalog
    - id (uuid, PK)
    - sku (unique), name, slug (unique)
    - category_id (FK), brand_id (FK)
    - description_html, specs (jsonb)
    - attributes (jsonb) - {size: [], color: [], etc}
    - price_mrp, price_sell, currency
    - stock_qty, low_stock_threshold, allow_backorder
    - images (jsonb) - [{path, alt, is_primary}]
    - badges (text[]), tags (text[])
    - is_active, is_featured
    - view_count, sold_count
    - created_at, updated_at

  ### Shopping
  - `carts` - Shopping carts
    - id (uuid, PK)
    - user_id (FK to profiles, nullable for guest)
    - items (jsonb) - [{product_id, sku, name, price, qty, image_path}]
    - totals (jsonb) - {subtotal, tax, shipping, grand}
    - updated_at

  - `wishlists` - Customer wishlists
    - id (uuid, PK)
    - user_id (FK to profiles)
    - product_id (FK to products)
    - created_at

  - `orders` - Customer orders
    - id (uuid, PK)
    - order_no (unique, human-readable)
    - user_id (FK to profiles, nullable for guest)
    - guest_info (jsonb) - {name, email, phone}
    - items (jsonb)
    - totals (jsonb)
    - payment_method (PO/COD/Offline)
    - payment_status (pending/paid/failed)
    - status (placed/confirmed/packed/shipped/delivered/cancelled)
    - status_history (jsonb) - [{status, note, at}]
    - shipping_address (jsonb)
    - billing_address (jsonb)
    - tracking_courier, tracking_no, tracking_eta
    - notes (text)
    - created_at, updated_at

  ### Content
  - `banners` - Homepage and promo banners
    - id (uuid, PK)
    - title, subtitle, cta_text, cta_url
    - image_path, position (hero/promo)
    - priority (int), schedule_start, schedule_end
    - is_active (boolean)

  - `posts` - Blog posts
    - id (uuid, PK)
    - title, slug (unique), content_html
    - cover_image_path, excerpt
    - tags (text[])
    - author_id (FK to admins)
    - is_published, published_at
    - created_at, updated_at

  - `testimonials` - Customer testimonials
    - id (uuid, PK)
    - author_name, author_role, author_image_path
    - quote (text)
    - rating (int), sort_order
    - is_active (boolean)

  - `suppliers` - Partner suppliers
    - id (uuid, PK)
    - name, logo_path, website_url
    - sort_order, is_active (boolean)

  ### System
  - `settings` - Global app settings (single row)
    - id (uuid, PK)
    - store_name, store_email, store_phone
    - store_address (jsonb)
    - logo_path, favicon_path
    - theme_colors (jsonb)
    - smtp_settings (jsonb)
    - tax_rate, currency
    - seo_defaults (jsonb)
    - updated_at

  - `notifications` - Admin notifications feed
    - id (uuid, PK)
    - type (cart_updated/order_new/inventory_low/contact_new)
    - payload (jsonb)
    - is_read (boolean)
    - created_at

  - `meetings` - Scheduled meetings
    - id (uuid, PK)
    - name, email, phone
    - preferred_slots (jsonb), message
    - meet_url, calendar_event_id
    - status (pending/confirmed/cancelled)
    - created_at

  ## Security
  - Enable RLS on all tables
  - Policies for authenticated users to access own data
  - Admin policies check admins table
  - Public read access to catalog, content tables
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES & AUTH
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  phone text,
  name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- ADMINS
-- ============================================================================

CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  is_active boolean DEFAULT true,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all admins"
  ON admins FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  );

-- ============================================================================
-- ADDRESSES
-- ============================================================================

CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('billing', 'shipping')),
  label text,
  name text NOT NULL,
  phone text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  postal_code text NOT NULL,
  country text DEFAULT 'India',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addresses"
  ON addresses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses"
  ON addresses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON addresses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON addresses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- CATEGORIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  image_path text,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  );

-- ============================================================================
-- BRANDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_path text,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active brands"
  ON brands FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage brands"
  ON brands FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  );

-- ============================================================================
-- PRODUCTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku text UNIQUE NOT NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
  description_html text,
  specs jsonb DEFAULT '[]'::jsonb,
  attributes jsonb DEFAULT '{}'::jsonb,
  price_mrp numeric(10,2) NOT NULL,
  price_sell numeric(10,2) NOT NULL,
  currency text DEFAULT 'INR',
  stock_qty int DEFAULT 0,
  low_stock_threshold int DEFAULT 10,
  allow_backorder boolean DEFAULT false,
  images jsonb DEFAULT '[]'::jsonb,
  badges text[] DEFAULT ARRAY[]::text[],
  tags text[] DEFAULT ARRAY[]::text[],
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  view_count int DEFAULT 0,
  sold_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  );

CREATE INDEX idx_products_category ON products(category_id) WHERE is_active = true;
CREATE INDEX idx_products_brand ON products(brand_id) WHERE is_active = true;
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_active = true;
CREATE INDEX idx_products_tags ON products USING gin(tags);

-- ============================================================================
-- CARTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS carts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  items jsonb DEFAULT '[]'::jsonb,
  totals jsonb DEFAULT '{"subtotal":0,"tax":0,"shipping":0,"grand":0}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart"
  ON carts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart"
  ON carts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart"
  ON carts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart"
  ON carts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- WISHLISTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wishlist"
  ON wishlists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlist items"
  ON wishlists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist items"
  ON wishlists FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- ORDERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_no text UNIQUE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  guest_info jsonb,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  totals jsonb NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('PO', 'COD', 'Offline')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  status text DEFAULT 'placed' CHECK (status IN ('placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled')),
  status_history jsonb DEFAULT '[]'::jsonb,
  shipping_address jsonb NOT NULL,
  billing_address jsonb NOT NULL,
  tracking_courier text,
  tracking_no text,
  tracking_eta timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- ============================================================================
-- BANNERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  subtitle text,
  cta_text text,
  cta_url text,
  image_path text NOT NULL,
  position text DEFAULT 'hero' CHECK (position IN ('hero', 'promo')),
  priority int DEFAULT 0,
  schedule_start timestamptz,
  schedule_end timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active banners"
  ON banners FOR SELECT
  USING (
    is_active = true 
    AND (schedule_start IS NULL OR schedule_start <= now())
    AND (schedule_end IS NULL OR schedule_end >= now())
  );

CREATE POLICY "Admins can manage banners"
  ON banners FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  );

-- ============================================================================
-- POSTS (BLOG)
-- ============================================================================

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content_html text NOT NULL,
  cover_image_path text,
  excerpt text,
  tags text[] DEFAULT ARRAY[]::text[],
  author_id uuid REFERENCES admins(id) ON DELETE SET NULL,
  is_published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published posts"
  ON posts FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage posts"
  ON posts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  );

CREATE INDEX idx_posts_published ON posts(published_at DESC) WHERE is_published = true;

-- ============================================================================
-- TESTIMONIALS
-- ============================================================================

CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_name text NOT NULL,
  author_role text NOT NULL,
  author_image_path text,
  quote text NOT NULL,
  rating int DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active testimonials"
  ON testimonials FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage testimonials"
  ON testimonials FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  );

-- ============================================================================
-- SUPPLIERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  logo_path text NOT NULL,
  website_url text,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active suppliers"
  ON suppliers FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage suppliers"
  ON suppliers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  );

-- ============================================================================
-- SETTINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_name text DEFAULT 'Safety Equipment Store',
  store_email text,
  store_phone text,
  store_address jsonb,
  logo_path text,
  favicon_path text,
  theme_colors jsonb,
  smtp_settings jsonb,
  tax_rate numeric(5,2) DEFAULT 0,
  currency text DEFAULT 'INR',
  seo_defaults jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings"
  ON settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can update settings"
  ON settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  );

-- Insert default settings row
INSERT INTO settings (id, store_name, currency, tax_rate)
VALUES (uuid_generate_v4(), 'Safety Equipment Store', 'INR', 18.0)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text NOT NULL CHECK (type IN ('cart_updated', 'order_new', 'inventory_low', 'contact_new')),
  payload jsonb NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins can update notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(is_read) WHERE is_read = false;

-- ============================================================================
-- MEETINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  preferred_slots jsonb,
  message text,
  meet_url text,
  calendar_event_id text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view meetings"
  ON meetings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Anyone can create meetings"
  ON meetings FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS FOR TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();