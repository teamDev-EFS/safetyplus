# SafetyPlus E-Commerce Platform

A comprehensive, production-ready e-commerce platform for safety equipment with modern features including wishlist, contact system, and complete content management.

## 🎉 Latest Updates - Rebranded to SafetyPlus

### Brand Refresh
- **New Identity**: SafetyPro → SafetyPlus with green color scheme
- **Logo Update**: Green gradient (from-green-500 to-emerald-600)
- **Enhanced Navigation**: Shop, Gallery, Blog, About, Team, Contact, Track Order

### New Features

#### ✅ Complete Contact System
- **Contact Page** (`/contact`) with form validation
- Head office cards with address, phones, emails
- **Calendly Integration** (embedded + fallback button)
- Branches grid with maps
- Bank & GST details panels

#### ✅ Wishlist Functionality
- Wishlist icon with badge in navbar
- Add/remove from product cards and detail pages
- Persistent storage with Supabase sync
- Ready for full wishlist page implementation

#### ✅ Enhanced Database
- `team_members` - Team profiles
- `branches` - Company locations
- `albums` & `album_images` - Gallery system
- `contact_messages` - Form submissions
- `pages_content` - Dynamic content
- Extended `settings` - Bank, GST, Calendly

## Quick Start

```bash
npm install
npm run dev     # Opens at http://localhost:5173
npm run build   # Production build
```

## Environment Setup

`.env` (already configured):
```
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
VITE_CALENDLY_URL=https://calendly.com/safetyplus/demo
```

## Features

### Customer Portal
- Shop with advanced filters and search
- Product detail with gallery and specs
- Shopping cart with real-time totals
- Checkout with multiple payment methods
- Wishlist to save favorites
- **Contact page** with Calendly scheduler
- Account management
- Light/Dark theme
- Fully responsive

### Admin Portal
- Dashboard with KPIs
- Product management
- Order processing
- Settings configuration (Bank, GST, Calendly)

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **State**: Zustand (auth, cart, wishlist)
- **Data**: TanStack Query
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Icons**: Lucide React

## Database

20+ tables including:
- Products, Categories, Brands
- Orders, Carts, Wishlists
- Team Members, Branches, Albums
- Contact Messages, Blog Posts
- Settings with Bank/GST/Calendly

All tables have Row Level Security (RLS) enabled.

## Project Structure

```
src/
├── components/
│   ├── layout/      # Header (✅ updated), Footer, Layout
│   └── ui/          # Button, Toaster
├── pages/
│   ├── HomePage.tsx
│   ├── ShopPage.tsx
│   ├── ProductDetailPage.tsx
│   ├── CartPage.tsx
│   ├── CheckoutPage.tsx
│   ├── ContactPage.tsx        # ✅ NEW
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── admin/                 # Admin pages
├── store/
│   ├── authStore.ts
│   ├── cartStore.ts
│   └── wishlistStore.ts       # ✅ NEW
└── lib/
    ├── supabase.ts
    └── utils.ts
```

## Implementation Guide

See `IMPLEMENTATION_GUIDE.md` for detailed specs on:
- About, Team, Gallery, Blog pages
- AI Assistant with Web Speech API
- Enhanced product filters
- Admin interfaces for new content
- Edge Functions

## Sample Data

Includes:
- 8 Products (6 categories, 4 brands)
- 3 Team Members
- 3 Branches (Coimbatore, Madurai, Chennai)
- 3 Photo Albums
- Bank & GST details

## Admin Access

Create admin user:
```sql
INSERT INTO admins (email, password_hash, name, is_active)
VALUES ('admin@safetyplus.com', '$2a$10$...', 'Admin', true);
```

Login at `/admin/login`.

## Contact Integration

The contact page uses:
1. **Form** → `contact_messages` table
2. **Calendly** → Embedded iframe from settings
3. **Branches** → Fetched from `branches` table
4. **Bank/GST** → Read from `settings` table

## Roadmap

### Next: Content Pages
- [ ] About Page
- [ ] Team Page with member modals
- [ ] Gallery with lightbox
- [ ] Blog list and detail
- [ ] Wishlist page UI

### Future: Advanced Features
- [ ] AI Assistant (chat + voice)
- [ ] Enhanced filters
- [ ] Order tracking
- [ ] Email notifications (Edge Functions)
- [ ] Payment gateway
- [ ] Analytics dashboard

## Scripts

```bash
npm run dev        # Development
npm run build      # Production build
npm run preview    # Preview build
npm run lint       # Lint code
npm run typecheck  # Type check
```

## Support

- **Email**: support@safetyplus.com
- **Phone**: 0422 4982221
- **Address**: 168, Thirugnana Vinayakar Road, Coimbatore

---

**SafetyPlus** - Your Safety, Our Priority
