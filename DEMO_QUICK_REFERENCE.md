# 🎯 Demo Quick Reference Card

## Demo Login Credentials

| Role | Username | Password | Note |
|------|----------|----------|------|
| **ADMIN** | `admin` | `admin123` | Full access |
| **USER** | `demo` | `demo123` | Limited access |

---

## Server Startup Command
```bash
ng serve
```
✅ Runs on http://localhost:4000

---

## Database Connection
- **Host:** localhost:3306
- **Database:** ldcu_lost_found
- **User:** root
- **Password:** (none/blank)

---

## Pre-loaded Demo Items
1. Silver iPhone 14 (pending)
2. Black Leather Wallet (pending)
3. Blue Backpack (found)
4. Gold Wedding Ring (claimed)

---

## Key Features to Demonstrate

### As Admin
- ✅ View all items
- ✅ Report new items
- ✅ Change item status
- ✅ View statistics

### As User
- ✅ View all items
- ✅ Report lost items
- ✅ Search items

---

## Common Requests During Demo

**"Can you report a new item?"**
- Go to Report tab
- Enter: "Lost Sunglasses"
- Enter: "Ray-Ban style sunglasses lost near the gym"
- Submit → Item appears in list

**"Can you change an item's status?"**
- Click on any item
- Change status to "found" or "claimed"
- See instant update

**"How many items are there?"**
- Check Dashboard/Stats
- Shows total, pending, found, claimed

---

## Emergency Commands

**Reset database:**
```bash
mysql -u root -e "DROP DATABASE ldcu_lost_found;"
```
Then restart server - auto-recreates with data

**Check database:**
```bash
mysql -u root ldcu_lost_found -e "SELECT * FROM users;"
mysql -u root ldcu_lost_found -e "SELECT * FROM lost_items;"
```

**Check server logs:**
Look at terminal where `ng serve` is running

---

## Architecture Overview (Quick Talking Points)

### Backend
- REST API with Express.js
- MySQL database
- Layered architecture (Controllers → Services → Repositories)

### Frontend  
- Angular with signals for reactivity
- Modular feature-based structure
- Type-safe with TypeScript

### Database
- Automatic initialization on startup
- Pre-seeded demo users and items

---

## Expected Startup Output
```
⏳ Initializing database...
✅ Database ready
📝 Demo Users Seeded:
   Admin: username="admin" password="admin123"
   User:  username="demo" password="demo123"
📦 Sample Lost Items Seeded (4 items)
🚀 Server running at http://localhost:4000
```

---

**Print this and keep it handy! ✨**
