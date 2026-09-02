# Nuxt 4 + TypeScript + Pinia + Zod - Step-by-Step Rebuild Prompts

## My Understanding of Current Architecture

### Architecture Pattern
Your current project follows a **layered architecture** with **SOLID principles**:

1. **Interface-Based Design**: All services use interfaces (ApiClient, StorageService, AuthService, etc.)
2. **Repository Pattern**: Data access layer (AuthRepository, etc.)
3. **Service Layer**: Business logic (AuthService, etc.)
4. **Dependency Injection**: Services injected via Nuxt plugins
5. **State Management**: Pinia stores for client-side state
6. **Composables**: Reusable business logic hooks
7. **Type Safety**: Full TypeScript with ZOD validation

### Current Structure
```
app/
├── services/          # Core services (interfaces + implementations)
│   ├── api/          # API client with caching
│   ├── auth/         # Auth service + repository
│   ├── cache/         # Cache service
│   └── storage/      # Storage service
├── stores/            # Pinia stores (state management)
├── composables/       # Reusable business logic
├── types/             # TypeScript type definitions
├── schemas/           # ZOD validation schemas
├── plugins/           # Nuxt plugins (dependency injection)
└── pages/             # Vue pages
```

### Issues Identified
1. **Timing Issues**: Stores/composables accessed before Pinia initialization
2. **Path Resolution**: `~` alias issues in `app.vue` during build
3. **Plugin Ordering**: Dependencies between plugins not clearly defined
4. **Storage Service**: Access timing issues with injected services
5. **Auto-imports**: Inconsistent use of auto-imports vs explicit imports

---

## Step-by-Step Rebuild Prompts

### PHASE 1: Basic Project Architecture

#### Prompt 1.1: Project Setup & Configuration
```
Create a new Nuxt 4 project with TypeScript, Pinia, Vuetify 3, Axios, and Zod.

Requirements:
1. Initialize Nuxt 4 project in a new directory
2. Install dependencies: @pinia/nuxt, pinia, vuetify, @mdi/font, axios, zod
3. Configure nuxt.config.ts:
   - Enable Pinia module
   - Set up runtime config for API base URL and bearer token
   - Configure Vuetify manually (not using @nuxtjs/vuetify module)
   - Set SSR to false (SPA mode)
4. Create .env and .env.example files with:
   - NUXT_PUBLIC_API_BASE_URL
   - NUXT_PUBLIC_APP_BEARER_TOKEN
5. Set up TypeScript configuration
6. Create basic folder structure:
   - services/
   - stores/
   - composables/
   - types/
   - schemas/
   - plugins/
   - utils/

Important: Use manual Vuetify setup (not @nuxtjs/vuetify module) to avoid Nuxt 4 compatibility issues.
```

#### Prompt 1.2: Core Services - Storage & Cache
```
Create the foundational services layer with interfaces and implementations.

1. Create StorageService interface and StorageServiceImpl:
   - Methods: get<T>, set<T>, remove, clear, has
   - Uses localStorage (with SSR safety checks)
   - Fully typed with TypeScript generics

2. Create CacheService interface and CacheServiceImpl:
   - In-memory cache with TTL support
   - Methods: get<T>, set<T>, delete, clear, has
   - Automatic expiration handling

3. Create composable useStorageService() that:
   - Returns singleton instance
   - Can be used throughout the app

File structure:
- services/storage/StorageService.ts (interface)
- services/storage/StorageServiceImpl.ts (implementation)
- services/cache/CacheService.ts (interface)
- services/cache/CacheServiceImpl.ts (implementation)
- composables/useStorage.ts

Follow SOLID principles - use interfaces, not concrete classes in type hints.
```

#### Prompt 1.3: API Client with Axios & Interceptors
```
Create a robust API client with Axios, interceptors, and error handling.

1. Create ApiClient interface:
   - Methods: get, post, put, patch, delete
   - Methods: setAuthToken, setBearerToken
   - All methods return Promise<ApiResponse<T>>

2. Create ApiClientImpl:
   - Uses Axios with baseURL from runtime config
   - Request interceptor: Adds Authorization header (Bearer token) and X-App-Token header
   - Response interceptor: Handles errors, token expiry, 401/403 redirects
   - Timeout: 30 seconds
   - Error handling: Transforms Axios errors to ApiError format

3. Create CachedApiClient wrapper:
   - Wraps ApiClient
   - Implements GET caching with CacheService
   - Cache invalidation on POST/PUT/PATCH/DELETE
   - Cache key format: `${method}:${url}:${JSON.stringify(params)}`

4. Create types/api.types.ts:
   - ApiResponse<T> interface
   - ApiError interface
   - RequestConfig interface

5. Create composables:
   - useApiClient(): Returns ApiClient
   - useCachedApi(): Returns CachedApiClient

File structure:
- services/api/ApiClient.ts (interface)
- services/api/ApiClientImpl.ts (implementation)
- services/api/CachedApiClient.ts (wrapper)
- types/api.types.ts
- composables/useApi.ts

Important: All error handling should be consistent and typed.
```

#### Prompt 1.4: JWT Utilities
```
Create JWT utility functions for token management.

1. Create utils/jwt.util.ts with:
   - isTokenExpired(token: string): boolean
   - getTokenExpirationTime(token: string): number | null
   - decodeToken(token: string): object | null
   - getTokenPayload(token: string): any

2. All functions should:
   - Handle invalid tokens gracefully
   - Return null/false on errors (never throw)
   - Include proper error handling

3. Add TypeScript types for JWT payload structure

File structure:
- utils/jwt.util.ts

Important: These utilities should be pure functions with no side effects.
```

#### Prompt 1.5: Plugin Setup - Dependency Injection
```
Create the main plugin for dependency injection and service initialization.

1. Create plugins/api.client.ts:
   - Initialize all core services (Storage, Cache, API Client)
   - Inject services into Nuxt app context ($storage, $apiClient, $cachedApiClient)
   - Set bearer token from runtime config if available
   - Set auth token from storage if available
   - Export all services via provide

2. Create plugins/vuetify.client.ts:
   - Manual Vuetify setup (not using module)
   - Configure theme, icons (MDI), components, directives
   - Register with Vue app

3. Ensure plugin order:
   - Vuetify plugin should run first
   - API client plugin should run after

File structure:
- plugins/api.client.ts
- plugins/vuetify.client.ts

Important: 
- Use async plugin for API client (for dynamic imports if needed)
- All services should be injected via $ prefix
- Document which services are available in app context
```

---

### PHASE 2: Authentication & Authorization

#### Prompt 2.1: Auth Types & Schemas
```
Create authentication types and ZOD validation schemas.

1. Create types/auth.types.ts:
   - User interface (id, email, firstName, lastName, role, etc.)
   - Role interface (id, name, permissions)
   - LoginCredentials interface
   - RegisterData interface
   - AuthResponse interface (user, accessToken, refreshToken)

2. Create schemas/auth.schema.ts:
   - loginSchema: ZOD schema for login (email, password)
   - registerSchema: ZOD schema for registration
   - All with proper validation rules and error messages

File structure:
- types/auth.types.ts
- schemas/auth.schema.ts

Important: Types should match backend API exactly.
```

#### Prompt 2.2: Auth Repository & Service
```
Create authentication repository and service layer.

1. Create AuthRepository interface:
   - login(credentials): Promise<AuthResponse>
   - register(data): Promise<AuthResponse>
   - getCurrentUser(): Promise<User>
   - logout(): Promise<void>
   - refreshToken(): Promise<AuthResponse>

2. Create AuthRepositoryImpl:
   - Implements AuthRepository
   - Uses ApiClient for API calls
   - Handles API responses and errors
   - All methods return typed responses

3. Create AuthService interface:
   - login(credentials): Promise<AuthResponse>
   - register(data): Promise<AuthResponse>
   - logout(): Promise<void>
   - getCurrentUser(): Promise<User>
   - isAuthenticated(): boolean
   - refreshUser(): Promise<void>

4. Create AuthServiceImpl:
   - Implements AuthService
   - Uses AuthRepository
   - Manages token storage (via StorageService)
   - Handles token refresh logic

5. Update plugins/api.client.ts to inject AuthService

File structure:
- services/auth/AuthRepository.ts (interface)
- services/auth/AuthRepositoryImpl.ts (implementation)
- services/auth/AuthService.ts (interface)
- services/auth/AuthServiceImpl.ts (implementation)

Important: Follow repository pattern - repository handles data access, service handles business logic.
```

#### Prompt 2.3: Auth Store (Pinia)
```
Create Pinia store for authentication state management.

1. Create stores/auth.store.ts:
   - State: user (User | null), token (string | null), isAuthenticated (boolean)
   - Getters: userRole, userId, canAccess(roles)
   - Actions:
     - login(credentials): Calls authService.login, updates state
     - register(data): Calls authService.register, updates state
     - logout(): Calls authService.logout, clears state
     - setAuth(user, token): Updates state
     - clearAuth(): Clears state
     - initAuth(): Initializes auth from storage on app start
     - refreshUser(): Refreshes user data

2. Store should:
   - Use authService from Nuxt app context (injected by plugin)
   - Persist token to storage
   - Clear storage on logout
   - Handle errors gracefully

File structure:
- stores/auth.store.ts

Important: Store should NOT directly call API - use AuthService instead.
```

#### Prompt 2.4: Auth Composable
```
Create composable for authentication operations.

1. Create composables/useAuth.ts:
   - Returns: { user, isAuthenticated, login, register, logout, loading, error }
   - Uses authStore from Pinia
   - Uses authService from Nuxt app context
   - Provides reactive state
   - Handles loading and error states

2. Create composables/useRole.ts:
   - Returns: { canAccess, hasRole, hasAnyRole, isAdmin, isSalesManager, isSalesRep }
   - Uses authStore to check user roles
   - Helper functions for common role checks

File structure:
- composables/useAuth.ts
- composables/useRole.ts

Important: Composables should be the primary way components interact with auth.
```

#### Prompt 2.5: Auth Middleware & Route Guards
```
Create authentication and role-based route guards.

1. Create middleware/auth.ts:
   - Checks if user is authenticated
   - Redirects to /login if not authenticated
   - Skips check for public routes (marked with public: true)
   - Handles token expiry

2. Create middleware/role.ts:
   - Checks user roles against route requirements
   - Supports single role, multiple roles (ANY), or multiple roles (ALL)
   - Redirects to /unauthorized if access denied
   - Must be used after auth middleware

3. Create pages/login.vue:
   - Login form with email/password
   - Uses ZOD schema for validation
   - Calls useAuth().login()
   - Redirects to dashboard on success
   - Shows error messages

4. Create pages/register.vue:
   - Registration form
   - Uses ZOD schema for validation
   - Calls useAuth().register()
   - Redirects to dashboard on success

5. Create pages/unauthorized.vue:
   - Shows unauthorized access message
   - Link back to dashboard or home

File structure:
- middleware/auth.ts
- middleware/role.ts
- pages/login.vue
- pages/register.vue
- pages/unauthorized.vue

Important: Middleware should be composable and work together (auth then role).
```

#### Prompt 2.6: Component-Level Guards
```
Create component-level guards for conditional rendering.

1. Create components/guards/AuthGuard.vue:
   - Shows/hides content based on authentication
   - Props: none (uses authStore)
   - Slot: default content
   - Slot: fallback (for unauthenticated)

2. Create components/guards/RoleGuard.vue:
   - Shows/hides content based on roles
   - Props: roles (string | string[]), requireAll (boolean)
   - Slot: default content
   - Uses useRole composable

File structure:
- components/guards/AuthGuard.vue
- components/guards/RoleGuard.vue

Important: These are for UI-level access control, not security (that's middleware).
```

#### Prompt 2.7: Auth Initialization Plugin
```
Create plugin to initialize authentication on app start.

1. Create plugins/auth-init.client.ts:
   - Runs only on client side
   - Calls authStore.initAuth() after Pinia is ready
   - Sets up token expiry checking
   - Handles automatic token refresh if needed

2. Ensure this plugin runs AFTER:
   - Pinia is initialized
   - API client plugin is initialized
   - Auth service is injected

File structure:
- plugins/auth-init.client.ts

Important: This should run in onMounted or after all plugins are ready. Use nextTick if needed.
```

---

### PHASE 3: Business Modules (Categories, Products, Customers, etc.)

#### Prompt 3.1: Module Pattern Template
```
For each business module (Category, Product, Customer, Client, Location), follow this pattern:

1. **Types** (types/{module}.types.ts):
   - Entity interface (Category, Product, etc.)
   - CreateDTO interface
   - UpdateDTO interface (extends Partial<CreateDTO>)
   - List filters interface
   - All related types

2. **Schemas** (schemas/{module}.schema.ts):
   - createSchema: ZOD schema for creation
   - updateSchema: ZOD schema for updates
   - All with proper validation

3. **API Service** (services/api/wrappers/{module}.api.ts):
   - {Module}ApiService class
   - Methods: getAll, getById, create, update, delete
   - Uses CachedApiClient
   - Returns ApiResponse<T>

4. **Store** (stores/{module}.store.ts):
   - State: items[], currentItem, loading, error
   - Getters: filtered items, itemById
   - Actions: setItems, setCurrentItem, addItem, updateItem, removeItem, setLoading, setError, clearError

5. **Composable** (composables/use{Module}.ts):
   - Returns: { items, loading, error, fetchAll, fetchById, create, update, delete }
   - Uses store for state
   - Uses API service from Nuxt app context
   - Handles loading and error states

6. **Update Plugin** (plugins/api.client.ts):
   - Import and initialize {Module}ApiService
   - Inject as ${module}Api in app context

Example module: Category
- types/category.types.ts
- schemas/category.schema.ts
- services/api/wrappers/category.api.ts
- stores/category.store.ts
- composables/useCategory.ts

Important: Follow this exact pattern for consistency across all modules.
```

#### Prompt 3.2: Category Module
```
Implement the Category module following the pattern from Prompt 3.1.

Category-specific requirements:
- Categories can have parent categories (hierarchical)
- Need getters for: rootCategories, subCategories(parentId)
- Tree view support in UI
- Parent category selection in forms

Create all files following the module pattern.
```

#### Prompt 3.3: Product Module
```
Implement the Product module following the pattern from Prompt 3.1.

Product-specific requirements:
- Products belong to a category
- Products have: name, description, price, sku, stock, images
- Need getters for: activeProducts, featuredProducts, productsByCategory
- Image upload support
- Stock management

Create all files following the module pattern.
```

#### Prompt 3.4: Customer Module
```
Implement the Customer module following the pattern from Prompt 3.1.

Customer-specific requirements:
- Customers belong to a Client
- Customers have: billing address, shipping addresses (multiple)
- Need: getCustomersByClient(clientId)
- Address management (add, edit, delete shipping addresses)
- Customer detail view with tabs

Create all files following the module pattern.
```

#### Prompt 3.5: Client Module
```
Implement the Client module following the pattern from Prompt 3.1.

Client-specific requirements:
- Clients are top-level entities
- Clients have: name, contact info, settings
- Need: getAllClients, getClientById
- Client detail view

Create all files following the module pattern.
```

#### Prompt 3.6: Location Module
```
Implement the Location module following the pattern from Prompt 3.1.

Location-specific requirements:
- Locations belong to a Client
- Locations have: name, address, type, settings
- Need: getLocationsByClient(clientId)
- Location filtering by client

Create all files following the module pattern.
```

---

## Key Principles to Follow

1. **SOLID Principles**: Use interfaces, dependency injection, single responsibility
2. **Type Safety**: No `any` or `unknown` types
3. **Error Handling**: Consistent error handling throughout
4. **Loading States**: Always handle loading and error states
5. **Validation**: Use ZOD for all form validation
6. **Caching**: Use CachedApiClient for GET requests
7. **Plugin Order**: Ensure proper plugin initialization order
8. **Store Access**: Only access stores after Pinia is initialized
9. **Service Injection**: Use Nuxt app context for service injection
10. **Composables**: Primary way components interact with business logic

## Testing Each Phase

After each phase, test:
1. ✅ Project builds without errors
2. ✅ Dev server starts successfully
3. ✅ No TypeScript errors
4. ✅ Services are properly injected
5. ✅ Stores work correctly
6. ✅ Composables return expected data
7. ✅ Error handling works
8. ✅ Loading states work

---

## Notes

- Start with Phase 1, test thoroughly before moving to Phase 2
- Each prompt is self-contained but builds on previous phases
- Follow the exact patterns established in earlier prompts
- If something doesn't work, fix it before moving to the next phase
- Keep the codebase clean and consistent
