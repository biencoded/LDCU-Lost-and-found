# 🏗️ Architecture Refactoring Guide

## Overview
This document explains the new modular architecture that eliminates spaghetti code and follows clean architecture principles.

---

## Backend Architecture (`/src/server/`)

### 1. **Folder Structure**
```
server/
├── config.ts           # Configuration (DB, server, security)
├── database.ts         # Database initialization and pool
├── types.ts            # Shared TypeScript interfaces/types
├── repositories/       # Data Access Layer (DAO)
│   ├── user.repository.ts
│   └── item.repository.ts
├── services/           # Business Logic Layer
│   ├── auth.service.ts
│   └── item.service.ts
├── controllers/        # HTTP Request Handlers
│   ├── auth.controller.ts
│   └── item.controller.ts
└── middleware/         # Cross-cutting concerns
    └── errors.ts       # Error handling, validation
```

### 2. **Layer Responsibilities**

#### **Controllers** (HTTP Layer)
- Handle incoming HTTP requests
- Parse request body/params
- Delegate to services
- Format responses
- **File:** `controllers/`
- **Example:** `AuthController.login(req, res)` → calls `AuthService.login()`

#### **Services** (Business Logic Layer)
- Implement business rules and validation
- Orchestrate repositories
- Transform data between layers
- **File:** `services/`
- **Example:** `AuthService.login()` validates credentials → calls `UserRepository.findByUsername()`

#### **Repositories** (Data Access Layer)
- Execute SQL queries
- Return typed data
- No business logic here
- **File:** `repositories/`
- **Example:** `UserRepository.findByUsername()` → executes SELECT query

#### **Types** (Data Contracts)
- DTOs (Data Transfer Objects) for API requests/responses
- Database row types
- Shared interfaces
- **File:** `types.ts`

#### **Database** (Initialization)
- Pool creation and connection management
- Table creation
- Initial seeding
- **File:** `database.ts`

#### **Config** (Settings)
- Environment variables
- Configuration objects
- **File:** `config.ts`

### 3. **Request Flow Example**
```
HTTP POST /api/auth/login
    ↓
AuthController.login()
    ↓
AuthService.login()  (validates input, checks rules)
    ↓
UserRepository.findByUsernameAndRole()  (executes SQL)
    ↓
Response sent back to client
```

### 4. **Benefits**
✅ **Separation of Concerns** - Each layer has single responsibility  
✅ **Testability** - Mock repositories and services independently  
✅ **Maintainability** - Change business logic without touching SQL  
✅ **Reusability** - Services can be called from multiple controllers  
✅ **Scalability** - Easy to add new features without touching existing code  

---

## Frontend Architecture (`/src/app/`)

### 1. **Folder Structure**
```
app/
├── core/               # Singleton services & guards
│   ├── api.service.ts
│   ├── auth.service.ts
│   └── item.service.ts
├── shared/             # Reusable components & utilities
│   ├── components/
│   ├── pipes/
│   └── directives/
├── features/           # Feature modules (lazy-loaded)
│   ├── auth/
│   │   ├── login/
│   │   ├── register/
│   │   └── auth.routes.ts
│   ├── items/
│   │   ├── list/
│   │   ├── create/
│   │   ├── detail/
│   │   └── items.routes.ts
│   └── dashboard/
│       ├── home/
│       ├── stats/
│       └── dashboard.routes.ts
├── app.ts              # Root component
├── app.routes.ts       # Main routing
└── app.config.ts       # App configuration
```

### 2. **Layer Responsibilities**

#### **Core Services** (`app/core/`)
- **ApiService** - HTTP client wrapper, centralized API calls
- **AuthService** - Authentication state management
- **ItemService** - Item CRUD operations
- ⚠️ **Note:** Single instance per app (provided in 'root')

#### **Shared** (`app/shared/`)
- Reusable UI components (forms, buttons, modals)
- Custom pipes
- Custom directives
- Common utilities
- Used by multiple features

#### **Features** (`app/features/`)
- Feature-specific components
- Feature-specific routing
- Feature-specific logic
- Can be lazy-loaded
- Each feature folder is self-contained

### 3. **Component Structure (Slim Components)**

**Before (Fat Component):**
```typescript
export class ReportComponent {
  items = signal([]);
  loading = signal(false);
  
  // ❌ Business logic mixed with UI
  async onSubmit() {
    this.http.post('/api/items', data).subscribe(...);
  }
  
  // ❌ Duplicated form field handling
  onNameChange() { ... }
  onDescChange() { ... }
  onStatusChange() { ... }
}
```

**After (Thin Component):**
```typescript
export class ReportComponent {
  items$ = this.itemService.getAllItems();
  
  // ✅ Only handles user interactions
  onSubmit(data: CreateItemDto) {
    this.itemService.createItem(data).subscribe(...);
  }
}
```

### 4. **Benefits**
✅ **Feature Encapsulation** - Each feature owns its code  
✅ **Lazy Loading** - Load features on demand  
✅ **Code Organization** - Clear folder structure  
✅ **Component Reusability** - Shared components available everywhere  
✅ **Testing** - Easy to test thin components and services separately  

---

## API Endpoints (Fully Implemented)

### Authentication
```
POST   /api/auth/login     - Login user
POST   /api/auth/register  - Register new user
```

### Items (CRUD)
```
GET    /api/items          - List all items
GET    /api/items/:id      - Get item by ID
GET    /api/items/search   - Search by status
POST   /api/items          - Create new item
PUT    /api/items/:id      - Update item status
DELETE /api/items/:id      - Delete item
```

### Statistics
```
GET    /api/stats          - Get item statistics
```

---

## Key Improvements

### ✅ Eliminated
- ❌ Monolithic server.ts (300 lines) → Split into 8+ focused files
- ❌ Direct SQL in route handlers → SQL only in repositories
- ❌ Fat components with business logic → Thin presenters
- ❌ Anemic services (just HTTP wrappers) → Rich services with validation
- ❌ Mixed concerns → Clear separation by layer

### ✅ Added
- ✅ Repository pattern for data access
- ✅ Service layer with business logic
- ✅ Controller layer for HTTP handling
- ✅ Centralized error handling
- ✅ Feature-based folder structure
- ✅ ApiService for centralized HTTP
- ✅ Type safety with proper DTOs
- ✅ Complete CRUD operations

---

## Migration Guide (For Existing Components)

### Step 1: Update Services Import
```typescript
// Before
import { HttpClient } from '@angular/common/http';

// After
import { ItemService } from '../../core/item.service';

constructor(private itemService: ItemService) {}
```

### Step 2: Use Services Instead of HTTP
```typescript
// Before
this.http.get('/api/items').subscribe(items => this.items = items);

// After
this.items$ = this.itemService.getAllItems();
```

### Step 3: Move to Feature Folder
```
Move:     app/login → app/features/auth/login
Move:     app/register → app/features/auth/register
Move:     app/search → app/features/items/list
Move:     app/report → app/features/items/create
```

---

## Testing Structure

```typescript
// Test repository
it('should fetch user by username', async () => {
  const user = await UserRepository.findByUsername('admin');
  expect(user).toBeDefined();
});

// Test service
it('should validate password on login', async () => {
  expect(() => AuthService.login({...})).toThrow('Invalid credentials');
});

// Test controller
it('should return 401 on invalid credentials', async () => {
  const res = mockResponse();
  await AuthController.login(mockRequest(), res);
  expect(res.status).toHaveBeenCalledWith(401);
});
```

---

## Next Steps

1. ✅ Refactor backend (DONE)
2. ✅ Create frontend structure (DONE)
3. ⏳ Move components to feature folders
4. ⏳ Update component imports to use services
5. ⏳ Add HTTP interceptor for auth tokens
6. ⏳ Add route guards for protected pages
7. ⏳ Implement comprehensive error handling
8. ⏳ Add unit tests for services/controllers
9. ⏳ Add feature module lazy loading
10. ⏳ Add end-to-end tests

---

## Summary

This refactoring transforms the codebase from:
- 🔴 **Spaghetti Code** (mixed concerns, no structure)

To:
- 🟢 **Clean Architecture** (layered, testable, maintainable)

The three-layer backend pattern (Controller → Service → Repository) combined with feature-based frontend organization ensures the codebase stays clean and scalable as it grows.
