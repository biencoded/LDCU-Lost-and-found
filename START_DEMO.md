# 🚀 Demo Startup Guide

## Prerequisites
- ✅ Node.js installed
- ✅ MySQL running on localhost:3306
- ✅ Project dependencies installed (`npm install`)

---

## Quick Start (3 Steps)

### 1️⃣ Start the Server
```bash
cd D:\OneDrive\Desktop\Lost and found project\ldcu-lost-found\src
ng serve
```

**Expected Output:**
```
⏳ Initializing database...
✅ Database ready
📝 Demo Users Seeded:
   Admin: username="admin" password="admin123"
   User:  username="demo" password="demo123"
📦 Sample Lost Items Seeded (4 items)
🚀 Server running at http://localhost:4000
```

### 2️⃣ Open in Browser
Navigate to: **http://localhost:4000**

### 3️⃣ Login with Demo Credentials
Pick one to demonstrate:
- **Admin:** `admin` / `admin123`
- **User:** `demo` / `demo123`

---

## Demo Features to Show

### 📋 Home/Dashboard
- Welcome message
- View statistics (total, pending, found, claimed items)
- Navigation to other features

### 🔍 Search/Browse Items
- View all lost items
- Filter by status (pending, found, claimed)
- See item details

### ➕ Report Lost Item
- Click "Report" to add a new item
- Fill in item name and description
- Item automatically added to database

### 📊 Statistics
- Live count of items by status
- Total items in system
- Updates in real-time

### 🔓 Logout
- Click logout to return to login page
- Shows authentication working

---

## Sample Items in Database

Pre-loaded items to show:
1. **Silver iPhone 14** (pending) - Lost at library
2. **Black Leather Wallet** (pending) - Lost in cafeteria  
3. **Blue Backpack** (found) - Lost at parking lot
4. **Gold Wedding Ring** (claimed) - Campus event

---

## API Endpoints (Optional Advanced Demo)

Test endpoints with Postman or curl:

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "role": "admin"
  }'
```

### Get All Items
```bash
curl http://localhost:4000/api/items
```

### Get Statistics
```bash
curl http://localhost:4000/api/stats
```

### Create New Item
```bash
curl -X POST http://localhost:4000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "item_name": "Lost Keys",
    "description": "Silver car keys with blue keychain"
  }'
```

### Update Item Status
```bash
curl -X PUT http://localhost:4000/api/items/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "found"}'
```

---

## Troubleshooting

### ❌ "Cannot connect to database"
```bash
# Check MySQL is running
mysql -u root
```

### ❌ "Port 4000 already in use"
```bash
# Find process on port 4000
netstat -ano | findstr :4000
# Kill it: taskkill /PID <PID> /F
# Or use different port: ng serve --port 4100
```

### ❌ "Login fails with valid credentials"
1. Clear browser cache
2. Check console for errors
3. Verify database has users:
   ```bash
   mysql -u root ldcu_lost_found -e "SELECT * FROM users;"
   ```
4. Restart server

### ❌ "Sample items don't appear"
```bash
# Check database
mysql -u root ldcu_lost_found -e "SELECT * FROM lost_items;"
```

---

## Architecture Highlights (For Discussion)

The application follows **clean architecture**:

### Backend (Server-side)
- **Controllers** → Handle HTTP requests
- **Services** → Business logic & validation
- **Repositories** → Database queries
- **Middleware** → Error handling

### Frontend (Client-side)
- **Feature Modules** → Organized by feature
- **Core Services** → Singleton services
- **Shared Components** → Reusable UI elements

---

## Time Estimate
- ⏱️ Setup: 2 minutes
- ⏱️ Demo walkthrough: 5-10 minutes
- ⏱️ Q&A: 5+ minutes

---

## Backup Plan
If database fails:
1. Stop server (Ctrl+C)
2. Delete database:
   ```bash
   mysql -u root -e "DROP DATABASE ldcu_lost_found;"
   ```
3. Restart server - it will auto-recreate with demo data

---

**Good luck with your demo tomorrow! 🍀**
