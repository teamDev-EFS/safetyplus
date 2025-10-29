# SafetyPlus SEO Implementation Checklist

## ✅ Completed Implementation

### Frontend

- [x] SEO component (`src/components/SEO.tsx`) with meta tags and JSON-LD support
- [x] Global meta tags in `index.html`
- [x] GA4 integration in `index.html` (update `G-XXXXXXXXXX` with real ID)
- [x] Manifest.json for PWA support
- [x] Example SEO usage in HomePage
- [ ] Add SEO to all page components:
  - [ ] ShopPage
  - [ ] ProductDetailPage (with product JSON-LD)
  - [ ] BlogPage / BlogDetailPage (with article JSON-LD)
  - [ ] TeamPage (with person JSON-LD)
  - [ ] ContactPage
  - [ ] AboutPage

### Backend

- [x] Robots.txt route (`/api/meta/robots.txt`)
- [x] Dynamic sitemap.xml route (`/api/meta/sitemap.xml`)
- [x] Health check endpoint (`/healthz` for Render)
- [x] CORS allowlist for production domains
- [x] Static file serving for `/uploads`

### Deployment Configuration

- [x] Netlify configuration (`netlify.toml`) with:
  - [x] SPA fallback redirects
  - [x] Security headers
  - [x] Cache headers for static assets
- [ ] Render configuration:
  - [ ] Set `PUBLIC_WEB_URL` environment variable
  - [ ] Ensure `/uploads` is persistent (volume mount)
  - [ ] Node.js version set to 20.x
  - [ ] Build command: `npm install && npm run build`
  - [ ] Start command: `node index.js`

### Assets Required

- [ ] OG image (`public/og-image.jpg` - 1200×630px)
- [ ] Favicon set (16x16, 32x32, apple-touch-icon)
- [ ] PWA icons (192x192, 512x512)

### Environment Variables

**Netlify:**

```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_FILES_BASE_URL=https://your-backend.onrender.com
VITE_PUBLIC_URL=https://safetyplus.co.in
VITE_GA_ID=G-XXXXXXXXXX
```

**Render:**

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=your-mongodb-uri
PUBLIC_WEB_URL=https://safetyplus.co.in
FRONTEND_URL=https://safetyplus.co.in
CORS_ORIGIN=https://safetyplus.co.in,https://safetyplus.netlify.app
```

## 📋 Pre-Launch SEO Checklist

### Technical SEO

- [ ] Verify robots.txt is accessible: `https://safetyplus.co.in/api/meta/robots.txt`
- [ ] Verify sitemap.xml is accessible: `https://safetyplus.co.in/api/meta/sitemap.xml`
- [ ] Test SPA fallback redirects work (visit `/shop` directly)
- [ ] Validate JSON-LD with [Google Rich Results Test](https://search.google.com/test/rich-results)
- [ ] Check all pages have unique titles and descriptions
- [ ] Verify canonical URLs are correct
- [ ] Test OG image displays correctly in social sharing debuggers:
  - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
  - [Twitter Card Validator](https://cards-dev.twitter.com/validator)
  - [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

### Performance

- [ ] Run Lighthouse audit (target: 90+ on all metrics)
- [ ] Optimize images (WebP format, proper sizing)
- [ ] Implement lazy loading for below-fold images
- [ ] Minimize JavaScript bundle size
- [ ] Enable compression (gzip/brotli)
- [ ] Set up CDN if not using Netlify CDN

### Google Search Console

- [ ] Add property in Google Search Console
- [ ] Submit sitemap.xml: `https://safetyplus.co.in/api/meta/sitemap.xml`
- [ ] Request indexing for key pages
- [ ] Set up email alerts for search issues

### Analytics

- [ ] Replace `G-XXXXXXXXXX` with real GA4 Measurement ID
- [ ] Test GA4 events are firing
- [ ] Set up conversion tracking
- [ ] Configure ecommerce tracking (for orders)
- [ ] Add site search tracking (if applicable)

### Accessibility

- [ ] Run axe DevTools audit
- [ ] Ensure all images have alt text
- [ ] Test keyboard navigation
- [ ] Verify color contrast ratios (WCAG AA minimum)
- [ ] Test with screen reader

### Mobile SEO

- [ ] Test mobile-friendly using [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [ ] Verify viewport meta tag
- [ ] Test touch targets (minimum 44×44px)
- [ ] Check manifest.json loads correctly
- [ ] Test PWA installability

### Local SEO (if applicable)

- [ ] Add business address in Organization JSON-LD
- [ ] Verify contact information is consistent
- [ ] Submit to Google Business Profile (if applicable)

## 🔍 Ongoing Maintenance

### Weekly

- [ ] Monitor Google Search Console for errors
- [ ] Check sitemap.xml validity
- [ ] Review new content for SEO optimization

### Monthly

- [ ] Update sitemap when new products/posts added
- [ ] Review and update meta descriptions
- [ ] Check for broken internal/external links
- [ ] Monitor Core Web Vitals in Search Console
- [ ] Review GA4 reports for SEO insights

### Quarterly

- [ ] Comprehensive Lighthouse audit
- [ ] Review and update robots.txt
- [ ] Audit and optimize slow-loading pages
- [ ] Check competitor SEO strategies
- [ ] Update OG images if branding changes

## 📝 Notes

- Replace `G-XXXXXXXXXX` with actual Google Analytics 4 Measurement ID
- Ensure OG images are high quality (1200×630px recommended)
- Keep meta descriptions between 150-160 characters
- Use semantic HTML5 elements
- Ensure all links use proper anchor text
- Monitor crawl budget (don't have too many low-value pages)
