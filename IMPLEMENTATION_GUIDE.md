# SafetyPlus Enhancement Implementation Guide

## Overview
This document outlines the implementation of new features for the SafetyPlus e-commerce platform. The platform has been rebranded from SafetyPro to SafetyPlus with a green color scheme.

## ✅ Completed Changes

### 1. Database Schema
**New Tables Created:**
- `team_members` - Team profiles with bios, photos, roles
- `branches` - Company branch locations with contact details
- `albums` & `album_images` - Photo gallery system
- `contact_messages` - Contact form submissions
- `pages_content` - Dynamic page content (About, Mission, etc.)
- Extended `settings` with bank_details, gst_details, calendly_url

**Storage Buckets Ready:**
- products, banners, brands, categories, posts (already exist)
- Need to add: team, gallery, branches

### 2. Branding Updates
- ✅ Header: Updated to "SafetyPlus" with green gradient (from-green-500 to-emerald-600)
- ✅ Footer: Updated company name and contact details
- ✅ Navbar: Reorganized with Shop, Gallery, Blog, About, Team, Contact, Track Order
- ✅ Added wishlist icon with badge in header
- ✅ Mobile responsive menu

### 3. Wishlist Store
- ✅ Created `/src/store/wishlistStore.ts` with Zustand
- Manages wishlist items with Supabase sync
- Functions: `fetchWishlist`, `addItem`, `removeItem`, `isInWishlist`

## 🔄 Features to Implement

### Priority 1: Contact Page (`/contact`)

**File:** `/src/pages/ContactPage.tsx`

**Sections:**
1. **Hero Banner** - Green gradient with breadcrumb
2. **Two-Column Layout:**
   - Left: Head Office cards (address, phones, emails)
   - Right: Contact Form
3. **Calendly Embed** - iframe + fallback button
4. **Branches Grid** - Cards with images, addresses, phones, map embeds
5. **Bank & GST Details** - Two info panels

**Contact Form Fields:**
```typescript
{
  name: string (required),
  company: string (required),
  mobile: string (required, 10-15 digits),
  email: string (required, RFC validation),
  subject: string (required),
  message: string (required),
  consent: boolean (required)
}
```

**API Endpoint:**
```typescript
POST /api/contact (via Edge Function)
- Validates input
- Inserts into contact_messages table
- Sends email via Supabase Edge Function
- Returns success with ticket ID
```

**Calendly Integration:**
```tsx
<iframe
  src={process.env.VITE_CALENDLY_URL}
  width="100%"
  height="700px"
  frameBorder="0"
/>
```

---

### Priority 2: About Page (`/about`)

**File:** `/src/pages/AboutPage.tsx`

**Sections:**
1. Hero with green gradient
2. Company Story (fetch from `pages_content` table, key='about')
3. Mission/Vision two-column
4. Milestones Timeline (from `pages_content.content.milestones[]`)
5. Trusted Customers carousel (existing suppliers table)
6. CTA ribbons (Contact, Schedule on Calendly)

**Data Query:**
```typescript
const { data } = await supabase
  .from('pages_content')
  .select('*')
  .eq('page_key', 'about')
  .maybeSingle();

// data.content = { story, mission, vision, milestones: [{year, event}] }
```

---

### Priority 3: Team Page (`/team`)

**File:** `/src/pages/TeamPage.tsx`

**Components:**
- `TeamMemberCard.tsx` - Photo (rounded-2xl), name, role, dept badge
- `TeamMemberModal.tsx` - Full bio, contact info, social links

**Grid Layout:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {members.map(member => (
    <TeamMemberCard
      key={member.id}
      member={member}
      onClick={() => setSelectedMember(member)}
    />
  ))}
</div>
```

**Data Query:**
```typescript
const { data: members } = await supabase
  .from('team_members')
  .select('*')
  .eq('is_active', true)
  .order('priority', { ascending: true });
```

---

### Priority 4: Gallery (`/gallery`)

**Files:**
- `/src/pages/GalleryPage.tsx` - Albums list
- `/src/pages/GalleryAlbumPage.tsx` - Album detail with lightbox
- `/src/components/gallery/AlbumCard.tsx`
- `/src/components/gallery/Lightbox.tsx`

**Album Card:**
```tsx
<Link to={`/gallery/${album.slug}`}>
  <div className="group relative aspect-[4/3] rounded-2xl overflow-hidden">
    <img src={album.cover_path} className="object-cover hover:scale-110 transition" />
    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 p-4">
      <h3>{album.title}</h3>
      <span className="text-sm">{album.event_date}</span>
    </div>
  </div>
</Link>
```

**Lightbox Features:**
- Keyboard navigation (←/→/ESC)
- Click outside to close
- Image counter (3 / 15)
- Next/Previous buttons

**Data Queries:**
```typescript
// Albums list
const { data: albums } = await supabase
  .from('albums')
  .select('*')
  .eq('is_active', true)
  .order('created_at', { ascending: false });

// Album detail
const { data: album } = await supabase
  .from('albums')
  .select('*, images:album_images(*)')
  .eq('slug', slug)
  .maybeSingle();
```

---

### Priority 5: Blog (`/blog`)

**Files:**
- `/src/pages/BlogListPage.tsx` - List with sidebar
- `/src/pages/BlogDetailPage.tsx` - Full post
- `/src/components/blog/BlogCard.tsx`
- `/src/components/blog/BlogSidebar.tsx`

**List Layout:**
```tsx
<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
  <aside className="lg:col-span-1">
    <BlogSidebar /> {/* Search + Latest posts */}
  </aside>
  <main className="lg:col-span-3">
    <div className="grid gap-6">
      {posts.map(post => <BlogCard key={post.id} post={post} />)}
    </div>
  </main>
</div>
```

**Blog Card:**
- Cover image (16:9)
- Title (line-clamp-2)
- Excerpt (line-clamp-3)
- Tags (chips)
- Date + Author
- "Read More" link

**Data Queries:**
```typescript
// List with search
const { data: posts } = await supabase
  .from('posts')
  .select('*')
  .eq('is_published', true)
  .ilike('title', `%${searchQuery}%`)
  .order('published_at', { ascending: false })
  .range(page * limit, (page + 1) * limit - 1);

// Detail
const { data: post } = await supabase
  .from('posts')
  .select('*')
  .eq('slug', slug)
  .eq('is_published', true)
  .maybeSingle();
```

---

### Priority 6: Wishlist Page (`/wishlist`)

**File:** `/src/pages/WishlistPage.tsx`

**Features:**
- Grid of product cards (reuse ProductCard component)
- Heart icon filled (remove on click)
- "Move to Cart" button on each card
- "Add All to Cart" button at top
- Empty state with category suggestions

**Implementation:**
```tsx
export function WishlistPage() {
  const { user } = useAuthStore();
  const { items, removeItem } = useWishlistStore();
  const { addItem } = useCartStore();

  if (!user) return <Navigate to="/login" />;

  const handleMoveToCart = (product: Product) => {
    addItem({
      product_id: product.id,
      sku: product.sku,
      name: product.name,
      price: product.price_sell,
      image_path: product.images[0]?.path || '',
    });
    removeItem(user.id, product.id);
    toast('Moved to cart', 'success');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1>My Wishlist ({items.length})</h1>
        {items.length > 0 && (
          <Button onClick={addAllToCart}>Add All to Cart</Button>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onMoveToCart={() => handleMoveToCart(product)}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}
```

---

### Priority 7: AI Assistant

**Files:**
- `/src/components/chat/AssistantFAB.tsx` - Floating button
- `/src/components/chat/AssistantDrawer.tsx` - Chat interface
- `/src/components/chat/VoiceControls.tsx` - Mic + Speak toggle

**FAB Component:**
```tsx
<button
  onClick={() => setDrawerOpen(true)}
  className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-lg hover:scale-110 transition z-50"
>
  <MessageCircle className="w-6 h-6 text-white mx-auto" />
</button>
```

**Drawer Interface:**
- Messages area (scrollable, bubbles)
- Input row (textarea + send button)
- Mic button (uses Web Speech API)
- Speak toggle (uses speechSynthesis)
- Language selector
- Quick action chips

**Web Speech API:**
```typescript
// Voice Input
const recognition = new (window.SpeechRecognition || (window as any).webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.interimResults = true;
recognition.onresult = (event) => {
  const transcript = Array.from(event.results)
    .map((result: any) => result[0].transcript)
    .join('');
  setInput(transcript);
};
recognition.start();

// Voice Output
const utterance = new SpeechSynthesisUtterance(text);
utterance.lang = 'en-US';
speechSynthesis.speak(utterance);
```

**Edge Function:** `supabase/functions/ai-assistant/index.ts`
```typescript
Deno.serve(async (req) => {
  const { messages, context } = await req.json();

  // Simple rule-based responses or LLM integration
  let response = { text: '', actions: [] };

  const lastMessage = messages[messages.length - 1].content.toLowerCase();

  if (lastMessage.includes('track order') || lastMessage.includes('order status')) {
    // Extract order number and email/phone
    response.text = "Please provide your order number and email";
  } else if (lastMessage.includes('meeting') || lastMessage.includes('demo')) {
    const calendlyUrl = Deno.env.get('CALENDLY_URL');
    response.text = "I'd be happy to schedule a meeting for you.";
    response.actions = [{ type: 'openUrl', payload: { url: calendlyUrl, label: 'Schedule on Calendly' } }];
  } else {
    // Search products
    const { data } = await supabase
      .from('products')
      .select('id, name, slug, price_sell')
      .ilike('name', `%${lastMessage}%`)
      .limit(5);

    response.text = `I found ${data.length} products matching "${lastMessage}"`;
    response.actions = data.map(p => ({
      type: 'openProduct',
      payload: { slug: p.slug, name: p.name }
    }));
  }

  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
});
```

---

### Priority 8: Enhanced Product Listing

**Updates to `/src/pages/ShopPage.tsx`:**

**Advanced Filters:**
```tsx
<aside className="space-y-6">
  {/* Price Range Slider */}
  <div>
    <h3>Price Range</h3>
    <input
      type="range"
      min="0"
      max="10000"
      value={priceRange[1]}
      onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
    />
    <div className="flex justify-between">
      <span>₹0</span>
      <span>₹{priceRange[1]}</span>
    </div>
  </div>

  {/* Availability */}
  <div>
    <label>
      <input type="checkbox" checked={inStockOnly} onChange={...} />
      In Stock Only
    </label>
    <label>
      <input type="checkbox" checked={onSaleOnly} onChange={...} />
      On Sale
    </label>
  </div>

  {/* Attributes (dynamic based on products) */}
  <div>
    <h3>Size</h3>
    {sizes.map(size => (
      <Chip key={size} active={selectedSizes.includes(size)} onClick={...}>
        {size}
      </Chip>
    ))}
  </div>
</aside>
```

**Sort Options:**
- Relevance (default)
- Newest First
- Price: Low to High
- Price: High to Low
- Best Sellers (sort by sold_count)

**Grid/List Toggle:**
```tsx
<div className="flex space-x-2">
  <button onClick={() => setView('grid')} className={view === 'grid' ? 'active' : ''}>
    <Grid className="w-5 h-5" />
  </button>
  <button onClick={() => setView('list')} className={view === 'list' ? 'active' : ''}>
    <List className="w-5 h-5" />
  </button>
</div>
```

**Per-Page Selector:**
```tsx
<select value={perPage} onChange={(e) => setPerPage(parseInt(e.target.value))}>
  <option value="12">12 per page</option>
  <option value="24">24 per page</option>
  <option value="48">48 per page</option>
</select>
```

---

## Admin Portal Enhancements

### 1. Team Management (`/admin/team`)
- AG Grid with columns: Photo, Name, Role, Dept, Priority, Active, Actions
- Create/Edit drawer with photo upload
- Drag to reorder (priority)

### 2. Albums Management (`/admin/albums`)
- Grid view of albums
- Create album → upload cover → add multiple images
- Image manager: reorder, delete, set cover

### 3. Branches Management (`/admin/branches`)
- List/grid with city, phones, emails
- Editor: address lines array, phones/emails arrays, map embed URL, image

### 4. Settings (`/admin/settings`)
**New Sections:**
```tsx
<Tabs>
  <Tab label="General">...existing...</Tab>
  <Tab label="Bank Details">
    <Input label="Bank Name" name="bank_details.bank_name" />
    <Input label="Account No" name="bank_details.account_no" />
    <Input label="Branch" name="bank_details.branch" />
    <Input label="IFSC Code" name="bank_details.ifsc" />
    <Input label="SWIFT Code" name="bank_details.swift" />
  </Tab>
  <Tab label="GST Details">
    <Input label="GSTIN" name="gst_details.gstin" />
    <Select label="Type" name="gst_details.type">
      <option>Regular</option>
      <option>Composition</option>
    </Select>
  </Tab>
  <Tab label="Integrations">
    <Input label="Calendly URL" name="calendly_url" />
    <Button onClick={testCalendly}>Test Calendly</Button>
  </Tab>
</Tabs>
```

---

## Routing Updates

**Update `/src/App.tsx`:**
```tsx
<Routes>
  {/* Existing */}
  <Route path="/" element={<HomePage />} />
  <Route path="/shop" element={<ShopPage />} />
  <Route path="/product/:slug" element={<ProductDetailPage />} />
  <Route path="/cart" element={<CartPage />} />
  <Route path="/checkout" element={<CheckoutPage />} />

  {/* New Pages */}
  <Route path="/gallery" element={<GalleryPage />} />
  <Route path="/gallery/:slug" element={<GalleryAlbumPage />} />
  <Route path="/blog" element={<BlogListPage />} />
  <Route path="/blog/:slug" element={<BlogDetailPage />} />
  <Route path="/about" element={<AboutPage />} />
  <Route path="/team" element={<TeamPage />} />
  <Route path="/contact" element={<ContactPage />} />
  <Route path="/wishlist" element={<WishlistPage />} />
  <Route path="/track-order" element={<TrackOrderPage />} />

  {/* Auth */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/account/*" element={<AccountPage />} />

  {/* Admin */}
  <Route path="/admin/login" element={<AdminLoginPage />} />
  <Route path="/admin" element={<AdminDashboard />} />
  <Route path="/admin/products" element={<AdminProductsPage />} />
  <Route path="/admin/orders" element={<AdminOrdersPage />} />
  <Route path="/admin/team" element={<AdminTeamPage />} />
  <Route path="/admin/albums" element={<AdminAlbumsPage />} />
  <Route path="/admin/branches" element={<AdminBranchesPage />} />
  <Route path="/admin/settings" element={<AdminSettingsPage />} />
</Routes>
```

---

## Seed Data

**Run these SQL commands to populate sample data:**

```sql
-- Team Members
INSERT INTO team_members (name, role, dept, photo_path, priority, is_active) VALUES
('P. Suresh Baboo', 'Purchase Manager', 'Operations', 'team/suresh.webp', 1, true),
('D. Suvathiraj', 'HR Manager', 'Human Resources', 'team/suvathiraj.webp', 2, true),
('J. Maria Vijay', 'IT Manager', 'Technology', 'team/vijay.webp', 3, true);

-- Branches
INSERT INTO branches (city, address_lines, phones, emails, is_active) VALUES
('Coimbatore', ARRAY['# 168, Thirugnana Vinayakar Road', 'Nehru Nagar (East), Coimbatore'], ARRAY['0422 4982221'], ARRAY['cbe@safetyplus.com'], true),
('Madurai', ARRAY['Plot No 19/10, Aaske Area', 'Moolakulam Main Road, Madurai'], ARRAY['0452 4264962'], ARRAY['mdr@safetyplus.com'], true);

-- Albums
INSERT INTO albums (title, slug, cover_path, is_active) VALUES
('Blood Donation Camp • 2025', 'blood-donation-2025', 'gallery/albums/blood-donation-2025/cover.webp', true),
('Pongal Celebration • 2024', 'pongal-2024', 'gallery/albums/pongal-2024/cover.webp', true);

-- Update Settings with Calendly
UPDATE settings SET
  calendly_url = 'https://calendly.com/safetyplus/demo-30min',
  store_name = 'SafetyPlus'
WHERE id = (SELECT id FROM settings LIMIT 1);
```

---

## Environment Variables

Add to `.env`:
```
VITE_CALENDLY_URL=https://calendly.com/safetyplus/demo-30min
VITE_COMPANY_NAME=SafetyPlus
VITE_COMPANY_EMAIL=support@safetyplus.com
VITE_COMPANY_PHONE=0422 4982221
```

---

## Next Steps

1. **Implement Contact Page** - Highest priority, includes Calendly integration
2. **Create About & Team Pages** - Content-heavy but straightforward
3. **Build Gallery** - Requires lightbox component
4. **Implement Blog** - List + detail with search
5. **Complete Wishlist** - Add product card integration
6. **Build AI Assistant** - Most complex, requires Edge Function
7. **Admin Enhancements** - CRUD interfaces for new tables

---

## Testing Checklist

- [ ] All navbar links work
- [ ] Mobile menu opens/closes correctly
- [ ] Wishlist badge updates when items added/removed
- [ ] Contact form validates and submits
- [ ] Calendly iframe loads
- [ ] Gallery lightbox keyboard navigation works
- [ ] Blog search returns results
- [ ] AI assistant responds to queries
- [ ] Voice input/output works in assistant
- [ ] Theme persists across pages
- [ ] All admin pages require authentication
- [ ] Product filters apply correctly

---

This guide provides the architecture and patterns. Each feature can be implemented incrementally following these specifications.
