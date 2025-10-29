# 🚀 Quick Start Guide - SafetyPlus

## Getting Started in 3 Minutes

### 1. Start the Development Server
```bash
npm install  # If not already done
npm run dev
```
Opens at: `http://localhost:5173`

---

## ✨ New Features to Try

### 🤖 AI Assistant "Anaya"

**Where to find it:**
- Look for the **green floating button** in the bottom-right corner
- Label says "Ask Anaya" on hover

**How to use:**

1. **Click the floating button**
   - A chat drawer slides in from the right

2. **Try text chat:**
   - Type: "Show me safety cabinets"
   - Type: "Schedule a meeting"
   - Type: "Track my order"
   - Hit Enter or click Send

3. **Try voice input:**
   - Click the **microphone icon** (turns red when recording)
   - Speak your question
   - It transcribes to text automatically
   - Hit Send

4. **Enable voice output:**
   - Click the **speaker icon** (turns green when enabled)
   - Anaya will read responses aloud
   - Your preference is saved

5. **Quick actions:**
   - Click the chips below the chat:
     - "Find safety cabinets"
     - "Track my order"
     - "Schedule a meeting"
     - "Contact support"

**What Anaya can do:**
- Help find products → Links to shop
- Schedule meetings → Opens Calendly
- Track orders → Links to track page
- Provide contact info → Links to contact page

---

### ❤️ Wishlist Feature

**Where to find it:**
- **Heart icon** in the top navigation (shows badge with count)

**How to use:**

1. **Add items to wishlist:**
   - *Currently:* Click the heart icon in navbar to visit wishlist page
   - *Future:* Heart icons will be on product cards

2. **View your wishlist:**
   - Click the heart icon in navbar
   - Or navigate to `/wishlist`
   - You must be logged in

3. **On the wishlist page:**
   - See all saved products in a beautiful grid
   - Each product shows:
     - Image
     - Brand
     - Name
     - Price (with discount if applicable)
     - Stock status

4. **Actions you can take:**
   - **Add to Cart** - Individual product
   - **Add All to Cart** - Top button, adds everything at once
   - **Remove** - Trash icon removes from wishlist
   - **View Details** - Click product card

5. **Empty state:**
   - If wishlist is empty, see category suggestions
   - Click to start shopping

**Badge updates:**
- Real-time count in navbar
- Updates when you add/remove items

---

### 📞 Contact Page

**Where to find it:**
- Navigation: **Contact** link
- Or visit: `/contact`

**What's on the page:**

1. **Contact Form:**
   - Name, Company, Mobile, Email
   - Subject and Message
   - Privacy consent checkbox
   - Submits to database

2. **Calendly Integration:**
   - Schedule meetings directly
   - Embedded calendar view
   - Or click "Open Calendly in New Tab"

3. **Company Info:**
   - Head office address
   - Phone numbers (Customer Care, Enquiries)
   - Email addresses (Sales, HR, Support)
   - Business hours

4. **Branches:**
   - Grid of branch locations
   - Coimbatore (Head Office)
   - Madurai
   - Chennai
   - Each with address, phones, emails

5. **Bank & GST Details:**
   - Bank account information
   - GSTIN and GST type

---

## 🎯 Quick Tests

### Test Wishlist:
```
1. Click "Register" → Create account
2. Login with your credentials
3. Click heart icon in navbar → Visit wishlist
4. See empty state
5. Click "Start Shopping"
6. Browse products (they'll need wishlist buttons added)
7. Return to /wishlist
```

### Test AI Assistant:
```
1. Click green FAB (bottom-right)
2. Type: "Schedule a meeting"
3. See Calendly button in response
4. Click microphone icon
5. Say: "Show me safety cabinets"
6. Click speaker icon to enable voice
7. Send another message
8. Anaya reads response aloud
```

### Test Contact:
```
1. Navigate to /contact
2. Fill out the form
3. Accept privacy policy
4. Submit
5. See success toast
6. Scroll down to Calendly
7. View branches grid
8. See bank and GST details
```

---

## 🎨 Theme

- **Light/Dark Mode**: Click sun/moon icon in header
- **Color Scheme**: Green (SafetyPlus brand)
- **Responsive**: Works on mobile, tablet, desktop

---

## 🔐 User Accounts

### Register:
1. Click "Register" in header
2. Fill in: Name, Email, Password, Phone
3. Submit
4. Auto-login after registration

### Login:
1. Click "Login" in header
2. Enter email and password
3. Submit
4. Access account features

### Logged-in Features:
- ✅ Wishlist access
- ✅ Order history
- ✅ Saved addresses
- ✅ Profile management
- ✅ Checkout

---

## 📱 Mobile Experience

### Navigation:
- Hamburger menu (☰) for main links
- Heart and cart icons always visible
- Collapsible menu with all pages

### AI Assistant:
- Full-screen drawer on mobile
- Touch-friendly buttons
- Voice input works great

### Wishlist:
- Single column grid on mobile
- 2 columns on tablet
- 3-4 columns on desktop

---

## 🎤 Voice Feature Requirements

**Browser Support:**
- ✅ **Chrome** - Full support
- ✅ **Edge** - Full support
- ⚠️ **Safari** - Speech synthesis only (recognition limited)
- ❌ **Firefox** - Speech synthesis only

**Permissions:**
- Browser will ask for microphone access
- Allow microphone to use voice input
- Voice output works without permissions

---

## 🛒 Shopping Flow

1. **Browse** → /shop or home page
2. **Search/Filter** → Categories, brands, price
3. **View Product** → Click any product card
4. **Add to Cart** → Click "Add to Cart" button
5. **View Cart** → Cart icon in header (badge shows count)
6. **Checkout** → Fill in details, select payment
7. **Place Order** → Submit and see confirmation

---

## 🎯 Admin Access

**Login:**
- Visit `/admin/login`
- Default admin credentials (set in database)

**Admin Pages:**
- Dashboard - KPIs and stats
- Products - Manage catalog
- Orders - Process orders
- Settings - Configure store

---

## 📊 What's Working NOW

### Pages:
- ✅ Home
- ✅ Shop (product listing)
- ✅ Product Detail
- ✅ Cart
- ✅ Checkout
- ✅ Contact (with Calendly)
- ✅ **Wishlist** ⭐ NEW
- ✅ Login/Register
- ✅ Account
- ✅ Admin Dashboard

### Features:
- ✅ Product catalog
- ✅ Shopping cart
- ✅ **AI Assistant with voice** ⭐ NEW
- ✅ **Wishlist system** ⭐ NEW
- ✅ Contact form
- ✅ Calendly integration
- ✅ Theme toggle
- ✅ Mobile responsive

---

## 🐛 Troubleshooting

### AI Assistant not appearing:
- Check you're not on an admin page (`/admin/*`)
- Look for green button bottom-right
- Try refreshing the page

### Wishlist requires login:
- This is by design
- Register or login first
- Then access /wishlist

### Voice input not working:
- Check browser compatibility (Chrome/Edge recommended)
- Allow microphone permissions
- Red pulse indicates recording

### Contact form not submitting:
- Check all required fields
- Accept privacy policy checkbox
- Ensure valid email format
- Mobile must be 10-15 digits

---

## 💡 Tips

1. **Use Quick Actions** in AI chat for common tasks
2. **Enable voice output** for hands-free responses
3. **Add items to wishlist** before deciding to buy
4. **Schedule meetings** directly via Contact page or AI assistant
5. **Toggle dark mode** for comfortable viewing
6. **Mobile-friendly** - all features work on phone

---

## 🎉 Enjoy SafetyPlus!

You now have:
- 🤖 An AI assistant that talks
- ❤️ A wishlist to save favorites
- 📞 Easy contact and scheduling
- 🛍️ Complete shopping experience

**Happy Shopping! 🎊**
