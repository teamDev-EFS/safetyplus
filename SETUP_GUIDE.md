# SafetyPlus - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Configure Environment

**Frontend** (`.env.local` in root):

```env
VITE_API_URL=http://localhost:5000/api
```

**Backend** (`.env` in `server/`):

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

MONGODB_URI=mongodb://localhost:27017/safetyplus

JWT_SECRET=your-secret-key-change-this

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

COMPANY_NAME=SafetyPlus
COMPANY_EMAIL=support@safetyplus.com
COMPANY_PHONE=+91-XXXXXXXXXX

CALENDLY_URL=https://calendly.com/safetyplus/demo-30min
```

### 3. Start MongoDB

**Option 1: Local MongoDB**

```bash
# Make sure MongoDB is installed and running
mongod
```

**Option 2: Docker**

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Run the Application

**Terminal 1 - Backend:**

```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**

```bash
npm run dev
```

### 5. Access the Application

- **Frontend:** http://localhost:5173 (or 5174 if 5173 is in use)
- **Backend API:** http://localhost:5000
- **Admin Panel:** http://localhost:5173/admin

## Important Notes

### AI Assistant

The AI Assistant FAB (Floating Action Button) appears as a green circular button in the bottom-right corner of every page. Click it to:

- Find products
- Track orders
- Schedule meetings
- Get help

### Database Setup

The MongoDB database will be automatically created when you first start the server. You can add initial data through:

- Admin panel UI
- Database seeding scripts (to be created)

### Current Status

✅ All Supabase references removed  
✅ MongoDB integration complete  
✅ Socket.IO for real-time features  
✅ AI Assistant implemented  
✅ Calendly integration ready

## Troubleshooting

### Port 5000 Already in Use

Stop any process using port 5000:

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change PORT in server/.env
```

### MongoDB Connection Error

Ensure MongoDB is running:

```bash
# Check MongoDB status
mongosh

# Start MongoDB if stopped
mongod
```

### Module Not Found Errors

Reinstall dependencies:

```bash
rm -rf node_modules
npm install
```

## Next Steps

1. Add seed data to populate products
2. Configure email service
3. Set up production environment variables
4. Deploy to hosting platform
