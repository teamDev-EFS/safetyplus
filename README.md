# SafetyPlus E-Commerce Platform

A modern, full-stack e-commerce platform for safety equipment built with React, Node.js, MongoDB, and Express.

## Features

- 🛍️ **Product Catalog**: Browse and search through a comprehensive safety equipment catalog
- 🛒 **Shopping Cart**: Add to cart, update quantities, and proceed to checkout
- ❤️ **Wishlist**: Save favorite items for later
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- 🌓 **Dark Mode**: Toggle between light and dark themes
- 💬 **AI Assistant**: Chat with SafetyPlus, our AI assistant for product search, order tracking, and scheduling
- 📧 **Contact Form**: Reach out to us through the contact page
- 🏢 **Team & Gallery**: Learn about our team and browse company events
- 📝 **Blog**: Read safety guides and industry updates
- 🔔 **Real-time Notifications**: Get instant updates via Socket.IO
- 👤 **Admin Panel**: Manage products, orders, and content

## Tech Stack

### Frontend

- React 18 + TypeScript
- Vite
- React Router
- Zustand for state management
- React Query for data fetching
- Tailwind CSS + shadcn/ui
- Framer Motion
- Socket.IO Client

### Backend

- Node.js 20 + Express
- MongoDB with Mongoose
- Socket.IO for real-time features
- JWT for authentication
- Nodemailer for email notifications
- Multer for file uploads

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/safetyplus.git
cd safetyplus
```

2. **Install backend dependencies**

```bash
cd server
npm install
```

3. **Install frontend dependencies**

```bash
cd ..
npm install
```

4. **Set up environment variables**

Create `server/.env`:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

MONGODB_URI=mongodb://localhost:27017/safetyplus

JWT_SECRET=your-super-secret-jwt-key

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

COMPANY_NAME=SafetyPlus
COMPANY_EMAIL=support@safetyplus.com
COMPANY_PHONE=+91-XXXXXXXXXX

CALENDLY_URL=https://calendly.com/safetyplus/demo-30min
```

Create `.env.local` in the root:

```env
VITE_API_URL=http://localhost:5000/api
```

5. **Run the application**

Start the backend server:

```bash
cd server
npm run dev
```

In a new terminal, start the frontend:

```bash
npm run dev
```

The app will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Project Structure

```
safetyplus/
├── server/              # Backend application
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── middleware/     # Express middleware
│   ├── uploads/        # Uploaded files
│   └── index.js        # Server entry point
├── src/                # Frontend application
│   ├── components/    # React components
│   ├── pages/         # Page components
│   ├── store/         # Zustand stores
│   ├── lib/           # Utilities and API client
│   └── types/         # TypeScript types
├── .env.local          # Frontend environment variables
└── package.json        # Frontend dependencies
```

## Available Scripts

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend

- `npm run dev` - Start development server with nodemon
- `npm run start` - Start production server
- `npm run seed` - Seed database with initial data

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Products

- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:slug` - Get product by slug
- `GET /api/products/featured/list` - Get featured products

### Cart

- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/:productId` - Update cart item
- `DELETE /api/cart/:productId` - Remove cart item

### Wishlist

- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist/add` - Add to wishlist
- `DELETE /api/wishlist/remove/:productId` - Remove from wishlist

### AI Assistant

- `POST /api/ai/respond` - Get AI assistant response

### Other

- `GET /api/team` - Get team members
- `GET /api/albums` - Get gallery albums
- `GET /api/blog` - Get blog posts
- `GET /api/branches` - Get branches
- `POST /api/contact` - Submit contact form

See server/routes/ for complete API documentation.

## Features in Detail

### AI Assistant (SafetyPlus AI Assistant)

- Voice input and text-to-speech output
- Product search and recommendations
- Order tracking
- Meeting scheduling via Calendly

### Wishlist

- Add/remove items from anywhere
- Badge showing item count
- Move items to cart
- Guest users prompted to login

### Admin Panel

- Product management (CRUD)
- Order management
- Team member management
- Gallery album management
- Blog post management
- Settings management

## Deployment

### Frontend

```bash
npm run build
# Deploy the dist/ folder to your hosting provider
```

### Backend

```bash
npm run start
# Use PM2 for process management in production
```

### Environment Variables

Make sure to set all environment variables in production:

- Update `JWT_SECRET` to a strong random string
- Configure MongoDB connection string
- Set SMTP credentials
- Update frontend API URL to production backend URL

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@safetyplus.com or join our Slack channel.
