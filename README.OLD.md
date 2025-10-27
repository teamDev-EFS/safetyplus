# SafetyPro E-Commerce Platform

A production-grade, full-stack e-commerce application for safety equipment, built with React, TypeScript, Supabase, and modern web technologies.

## Features

### Customer Portal
- **Home Page**: Hero banner, featured products, brand showcase, testimonials
- **Shop**: Product catalog with search, filters by category/brand, and sorting
- **Product Detail**: Image gallery, specifications, add to cart, stock status
- **Shopping Cart**: Item management, quantity updates, order summary with tax calculation
- **Checkout**: Customer information, shipping address, payment method selection (COD/PO/Offline)
- **Authentication**: Register, login, profile management
- **Account Dashboard**: View orders, manage profile and addresses
- **Light/Dark Theme**: Persisted theme switching with system default
- **Fully Responsive**: Optimized for desktop, tablet, and mobile

### Admin Portal
- **Dashboard**: KPIs overview with statistics cards
- **Products Management**: View all products with images, SKU, category, price, stock
- **Orders Management**: View and track all customer orders with status updates
- **Separate Admin Login**: Secure admin authentication

### Technical Features
- **Database**: PostgreSQL via Supabase with comprehensive schema and RLS policies
- **Storage**: Supabase Storage for product images and assets
- **Authentication**: Supabase Auth for customers, separate admin auth
- **Realtime**: Ready for real-time notifications via Supabase Realtime
- **State Management**: Zustand for global state (auth, cart)
- **Data Fetching**: TanStack Query for server state management
- **Styling**: Tailwind CSS with dark mode support
- **Type Safety**: Full TypeScript coverage

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Routing**: React Router v6
- **UI**: Tailwind CSS, Lucide Icons
- **State**: Zustand (with persist middleware)
- **Data Fetching**: TanStack Query
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Animations**: Framer Motion (ready to be integrated)

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Your `.env` file should already have Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Database Setup**:
   The database schema has been applied via migrations including:
   - All tables (products, categories, brands, orders, etc.)
   - Row Level Security policies
   - Storage buckets for images
   - Sample seed data

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:5173`

## Database Schema

### Core Tables
- `profiles` - Customer profiles linked to Supabase Auth
- `admins` - Admin users (separate from customers)
- `categories` - Product categories (hierarchical support)
- `brands` - Product brands
- `products` - Main product catalog with images, specs, pricing
- `carts` - Shopping carts
- `orders` - Customer orders with status tracking
- `wishlists` - Customer wishlists
- `addresses` - Customer shipping/billing addresses
- `banners` - Homepage hero and promotional banners
- `posts` - Blog posts
- `testimonials` - Customer testimonials
- `suppliers` - Partner suppliers
- `notifications` - Admin notification feed
- `settings` - Global store settings

### Security
- All tables have Row Level Security (RLS) enabled
- Public can view active products, categories, brands
- Authenticated users can manage their own carts, orders, addresses
- Admin routes protected via admins table verification

## Project Structure

```
src/
├── components/
│   ├── layout/          # Header, Footer, Layout
│   ├── ui/              # Reusable UI components (Button, Toaster)
│   └── ThemeProvider.tsx
├── pages/
│   ├── admin/           # Admin portal pages
│   ├── HomePage.tsx
│   ├── ShopPage.tsx
│   ├── ProductDetailPage.tsx
│   ├── CartPage.tsx
│   ├── CheckoutPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── AccountPage.tsx
├── store/
│   ├── authStore.ts     # Authentication state
│   └── cartStore.ts     # Shopping cart state
├── types/
│   └── database.ts      # TypeScript database types
├── lib/
│   ├── supabase.ts      # Supabase client
│   └── utils.ts         # Utility functions
├── App.tsx
└── main.tsx
```

## Key Features Explained

### Authentication
- **Customer Auth**: Email/password registration and login via Supabase Auth
- **Admin Auth**: Separate admin table with bcrypt password hashing
- Automatic profile creation on registration
- Protected routes redirect unauthenticated users

### Shopping Cart
- Persistent cart stored in localStorage and synced to database for authenticated users
- Real-time total calculations (subtotal, tax, shipping, grand total)
- Cart badge shows item count in header
- Optimistic UI updates

### Product Catalog
- Server-side search and filtering
- Category and brand filters
- Real-time stock status
- Featured products on homepage
- Product images from Supabase Storage
- Price with MRP, sell price, and discount calculation

### Order Flow
1. Add items to cart
2. Proceed to checkout
3. Fill customer info and address
4. Select payment method (COD/PO/Offline)
5. Place order (generates unique order number)
6. Order confirmation
7. Admin can view and manage orders

### Theme System
- Light and dark mode support
- System default detection
- Persistent theme choice in localStorage
- CSS variables for easy customization

## Sample Data

The database includes sample data:
- 4 Brands: 3M, Honeywell, DuPont, MSA
- 6 Categories: Head, Eye & Face, Respiratory, Hand, Body, Foot Protection
- 8 Products: Safety helmets, glasses, masks, gloves, vests, boots
- 2 Testimonials
- 4 Supplier logos
- 1 Hero banner

## Admin Access

To create an admin account, you need to hash a password with bcrypt and insert into the `admins` table:

```sql
-- Example: Create admin with email admin@safetypro.com and password "admin123"
INSERT INTO admins (email, password_hash, name, is_active)
VALUES (
  'admin@safetypro.com',
  '$2a$10$...',  -- bcrypt hash of password
  'Admin User',
  true
);
```

Then access the admin portal at `/admin/login`.

## Future Enhancements

This is a foundation for a complete e-commerce platform. Potential additions:
- **Realtime Notifications**: Supabase Realtime for cart updates and new orders
- **Edge Functions**: Email notifications, AI assistant, meeting scheduling
- **Analytics Dashboard**: Highcharts integration for sales reports
- **Advanced Admin**: Bulk product import, inventory management, customer management
- **AG Grid**: Advanced data tables for products and orders
- **Payment Integration**: Stripe/Razorpay for online payments
- **Image Upload**: Admin UI for uploading product images to Supabase Storage
- **Reviews & Ratings**: Customer product reviews
- **Wishlist UI**: Full wishlist management interface
- **Order Tracking**: Public order status tracking by order number
- **Blog CMS**: Full blog management interface
- **SEO Optimization**: Meta tags, sitemap, structured data

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code
- `npm run typecheck` - Type check without emitting

## License

MIT

## Notes

This application demonstrates modern full-stack development with:
- Type-safe database access
- Secure authentication and authorization
- Responsive, accessible UI
- Production-ready code organization
- Scalable architecture

The codebase is structured for easy extension and follows React and TypeScript best practices.
