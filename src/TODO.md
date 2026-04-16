# LDCU Lost & Found System Fixes - Approved Plan Implementation

## Overview
Implementing fixes for login, DB schema, security, RBAC, dynamic graph, CRUD per approved plan. Progress tracked here.

## Steps (Sequential)

### 1. Install bcrypt for password hashing (backend security)
- Execute `npm i bcrypt` (or `npm i bcrypt @types/bcrypt` if TS).
- Verify package.json updated.

### 2. Update database/schema.sql to match spec
- Edit schema.sql: users role 'admin'|'user', lost_items table (id,item_name,description,status 'pending'|'found'|'claimed',created_at).
- Remove/create lost_items properly.

### 3. Update server.ts comprehensively
- Import bcrypt.
- Hash admin pw on init/insert (new pw? keep 'admin123' hashed).
- Update all table creations/queries to lost_items new fields, roles 'admin'|'user'.
- Add bcrypt pw verify in login.
- Add /api/stats endpoint: SELECT status, COUNT(*) FROM lost_items GROUP BY status;
- Add simple auth middleware (check token/user role) for admin routes (PUT/DELETE /api/lost-items/:id).
- Change API paths? /api/lost-items (new) vs keep /api/items.

### 4. Update frontend services & components
- auth.service.ts: roles 'admin'|'user'.
- lost-item.service.ts: update interfaces (item_name vs title, no category/location/date/photo?), apiUrl to /api/lost-items.
- login/register components: roles 'user', fields.

### 5. Fix home dashboard graph
- Add fetch /api/stats.
- Render dynamic bars from status counts.

### 6. Implement RBAC
- Backend middleware.
- Frontend guards check role==='admin' for updates/deletes/dashboard actions.

### 7. Update dependent components (report/search/navbar)
- Fields, filters, admin buttons.

### 8. Testing & Verification
- Restart server.
- MySQL Workbench: verify tables/data.
- Test login/register/CRUD/graph/RBAC.

## Progress
✅ Step 1: bcrypt installed  
✅ Step 2: schema.sql updated  
✅ Step 3: server.ts backend complete (login/hash/schema/stats/CRUD)  
- [ ] Step 4: Frontend services (auth/lost-item)  
- [ ] Step 5: Login/register components  
- [ ] Step 6: Home graph dynamic  
- [ ] Step 7: Report/search RBAC/fields  
- [ ] Step 8: Test all

**Next:** Frontend auth.service.ts edits.
