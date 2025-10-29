# SafetyPlus Deployment Guide

## Frontend (Netlify)

### Build Settings

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18.x or 20.x

### Environment Variables

Set these in Netlify dashboard → Site settings → Environment variables:

```
VITE_API_URL=https://safetyplus-backend.onrender.com/api
VITE_FILES_BASE_URL=https://safetyplus-backend.onrender.com
VITE_PUBLIC_URL=https://safetyplus.co.in
VITE_GA_ID=G-XXXXXXXXXX
```

### Custom Domain

1. Add custom domain in Netlify: `safetyplus.co.in`
2. Update DNS records:
   - A Record: `@` → Netlify IP
   - CNAME: `www` → `safetyplus.netlify.app`
3. Enable SSL/HTTPS (automatic)

### Important Files

- `netlify.toml` - Contains redirects and headers
- `public/robots.txt` - SEO robots file
- Update sitemap redirect URL in `netlify.toml` to match your backend URL

## Backend (Render)

### Service Settings

- **Type**: Web Service
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `node index.js`
- **Node Version**: 20.x

### Environment Variables

```
NODE_ENV=production
PORT=10000
MONGODB_URI=your-mongodb-connection-string
PUBLIC_WEB_URL=https://safetyplus.co.in
FRONTEND_URL=https://safetyplus.co.in
CORS_ORIGIN=https://safetyplus.co.in,https://safetyplus.netlify.app
JWT_SECRET=your-secret-key-here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
COMPANY_EMAIL=marketing@safetyplus.co.in
```

### Persistent Storage

- Use Render Disk for `/uploads` folder
- Mount path: `/uploads`
- Or use S3/storage service for production

### Health Check

- Health check path: `/healthz`
- Render automatically pings this endpoint

### Static Files

- Ensure `/uploads` is served correctly
- Files accessible at: `https://your-backend.onrender.com/uploads/...`

## Post-Deployment Checklist

### 1. Verify Backend

- [ ] Health check works: `https://your-backend.onrender.com/healthz`
- [ ] API accessible: `https://your-backend.onrender.com/api/health`
- [ ] Robots.txt: `https://your-backend.onrender.com/api/meta/robots.txt`
- [ ] Sitemap: `https://your-backend.onrender.com/api/meta/sitemap.xml`

### 2. Verify Frontend

- [ ] Homepage loads: `https://safetyplus.co.in`
- [ ] SPA routing works (visit `/shop` directly)
- [ ] API calls work (check network tab)
- [ ] Images load from backend

### 3. SEO Verification

- [ ] Robots.txt: `https://safetyplus.co.in/robots.txt`
- [ ] Sitemap: `https://safetyplus.co.in/sitemap.xml`
- [ ] Test OG tags with social debuggers
- [ ] Validate JSON-LD with Google Rich Results Test

### 4. Google Search Console

1. Add property: `https://safetyplus.co.in`
2. Verify ownership (DNS or HTML file)
3. Submit sitemap: `https://safetyplus.co.in/sitemap.xml`
4. Request indexing for key pages

### 5. Google Analytics

- [ ] Replace `G-XXXXXXXXXX` with real GA4 ID
- [ ] Test events are firing
- [ ] Set up conversion tracking
- [ ] Configure ecommerce (if applicable)

## Troubleshooting

### CORS Errors

- Check `CORS_ORIGIN` includes your frontend domain
- Verify `FRONTEND_URL` matches Netlify deployment
- Test with curl: `curl -H "Origin: https://safetyplus.co.in" https://backend.onrender.com/api/health`

### SPA Routing Issues

- Ensure Netlify redirects `/*` to `/index.html`
- Check `netlify.toml` is in root directory
- Verify redirect is after sitemap redirect

### Image Loading

- Check `VITE_FILES_BASE_URL` points to backend
- Verify backend serves `/uploads` correctly
- Test image URL: `https://backend.onrender.com/uploads/products/...`

### Sitemap Not Found

- Update sitemap redirect in `netlify.toml` with actual backend URL
- Test backend sitemap directly: `https://backend.onrender.com/api/meta/sitemap.xml`
- Ensure robots.txt references correct sitemap URL
