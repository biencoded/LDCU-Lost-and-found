# 🔐 Demo Credentials

## Demo User Accounts

These credentials are automatically seeded into the database when the server starts.

### Admin Account
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** Admin
- **Permissions:** Full access to all features

### Demo User Account
- **Username:** `demo`
- **Password:** `demo123`
- **Role:** User
- **Permissions:** Can report lost items, view items

---

## How to Login

### Using the Web Interface
1. Start the application (`ng serve`)
2. Navigate to the login page
3. Enter credentials above
4. Click "Login"

### Using API (curl)

**Admin Login:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "role": "admin"
  }'
```

**Demo User Login:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demo",
    "password": "demo123",
    "role": "user"
  }'
```

---

## Database Connection

The database automatically initializes on server start with:
- **Database Name:** `ldcu_lost_found`
- **Default Host:** `localhost:3306`
- **Default User:** `root` (no password)

### Verify Database
```bash
mysql -u root ldcu_lost_found -e "SELECT * FROM users;"
```

Expected output:
```
+----+-------+<...hash...>+-------+---------------------+
| id | username |   password   | role |   created_at    |
+----+-------+<...hash...>+-------+---------------------+
|  1 | admin  | $2b$10$... | admin | 2026-04-16 ... |
|  2 | demo   | $2b$10$... | user  | 2026-04-16 ... |
+----+-------+<...hash...>+-------+---------------------+
```

---

## Demo Flow

### 1. **Login as Admin**
   - Username: `admin` | Password: `admin123`
   - Shows all features and management options

### 2. **Login as Regular User**
   - Username: `demo` | Password: `demo123`
   - Shows limited features (report items, view items)

### 3. **Test Features**
   - Create a lost item report
   - Search for items
   - Update item status
   - View statistics

---

## Troubleshooting

### Can't connect to database?
Ensure MySQL is running:
```bash
# Windows
mysql -u root

# macOS
mysql -u root
```

### Get "Invalid credentials" error?
1. Clear browser cache/localStorage
2. Verify database has seeded users:
   ```bash
   mysql -u root ldcu_lost_found -e "SELECT * FROM users;"
   ```
3. Restart the server:
   ```bash
   ng serve
   ```

### Want to reset users?
Delete the database and restart server:
```bash
mysql -u root -e "DROP DATABASE ldcu_lost_found;"
# Then start server - it will recreate with seeded users
```

---

## Server Startup Output

When you start the server, you should see:

```
⏳ Initializing database...
✅ Database ready
📝 Demo Users Seeded:
   Admin: username="admin" password="admin123"
   User:  username="demo" password="demo123"
🚀 Server running at http://localhost:4000
```

If you don't see this, check the database connection settings in `.env`.
