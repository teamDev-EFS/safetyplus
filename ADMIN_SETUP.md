# SafetyPlus Admin Setup

## Admin Credentials

**Email:** `admin@safetyplus.com`  
**Password:** `Admin@123`  
**Role:** `admin`

## Features Implemented

### 1. Admin Authentication

- Separate admin login endpoint: `POST /api/auth/admin/login`
- Role-based access control
- JWT token expires in 15 minutes
- Admin credential validation

### 2. Admin Layout & Navigation

- **Sidebar Navigation** with modules:

  - Dashboard
  - Products
  - Orders
  - Blog
  - Gallery
  - Team
  - Branches
  - Settings

- **Responsive design:**

  - Mobile: Collapsible sidebar with overlay
  - Desktop: Fixed sidebar (256px width)
  - Top bar with search, notifications, theme toggle, user menu

- **Dark mode support** throughout

### 3. Theme Colors Changed

- **Old:** Orange/Amber (`amber-500`, `orange-600`)
- **New:** Green (`green-500`, `emerald-600`)
- All UI components updated:
  - Buttons
  - Links
  - Focus rings
  - Gradients
  - Hero sections
  - Admin dashboard cards

### 4. User Schema Updated

```javascript
{
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["admin", "customer"], default: "customer" },
  name: String,
  phone: String,
  isActive: { type: Boolean, default: true },
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Database Indexes

- `{ email: 1 }` - unique index
- `{ role: 1, isActive: 1 }` - compound index for efficient admin queries

## How to Access Admin Panel

1. **Start Backend Server:**

   ```bash
   cd backend
   node index.js
   ```

2. **Navigate to:** `http://localhost:5173/admin/login`

3. **Login with:**

   - Email: `admin@safetyplus.com`
   - Password: `Admin@123`

4. **After login**, you'll be redirected to `/admin` dashboard with:
   - Full sidenav with all modules
   - Dashboard stats cards
   - Quick access to Products & Orders
   - Green color theme throughout

## Admin Route Protection

All admin routes are protected with:

- Authentication check (`authenticate` middleware)
- Admin role verification (`requireAdmin` middleware)
- Automatic redirect to `/admin/login` if not authenticated

## File Structure

```
src/
├── components/
│   └── admin/
│       └── AdminLayout.tsx  # Admin layout with sidenav
├── pages/
│   └── admin/
│       ├── AdminLoginPage.tsx  # Green-themed login page
│       ├── AdminDashboard.tsx  # Dashboard with AdminLayout
│       ├── AdminProductsPage.tsx
│       └── AdminOrdersPage.tsx
└── store/
    └── authStore.ts  # Auth state with isAdmin property

backend/
├── models/
│   └── User.js  # Updated schema with passwordHash
├── routes/
│   └── auth.js  # Admin login endpoint
├── middleware/
│   └── auth.js  # requireAdmin middleware
└── scripts/
    └── seed.js  # Seeds admin user
```

## Color Scheme

### Primary Colors (Green)

- `green-500` - Primary actions, links
- `green-600` - Hover states
- `emerald-500` - Accent elements
- `emerald-600` - Gradient ends
- `emerald-700` - Active/hover text

### Gradients

- `from-green-500 to-emerald-600` - Main gradients
- Background gradients use `green-900` to `emerald-800`

## Next Steps

1. Implement admin product management (full CRUD)
2. Add admin order management with status updates
3. Create admin blog/gallery/team/branches management
4. Add admin settings panel
5. Implement admin metrics dashboard with real data
