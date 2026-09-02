# Route-Level and Component-Level Guards

This project implements both route-level and component-level guards for authentication and role-based access control.

## Route-Level Guards

Route-level guards are implemented using Nuxt middleware. They protect entire routes/pages.

### 1. Auth Middleware (`middleware/auth.ts`)

Protects routes that require authentication. Routes marked as `public: true` in `definePageMeta` are excluded.

**Usage:**
```vue
<script setup lang="ts">
definePageMeta({
    middleware: 'auth', // Requires authentication
    // OR
    public: true, // Public route, no auth required
});
</script>
```

### 2. Role Middleware (`middleware/role.ts`)

Protects routes based on user roles. Can check for single role, multiple roles (ANY), or multiple roles (ALL).

**Usage:**
```vue
<script setup lang="ts">
// Single role
definePageMeta({
    middleware: ['auth', 'role'],
    roles: 'admin', // Only admins can access
});

// Multiple roles (ANY - user needs at least one)
definePageMeta({
    middleware: ['auth', 'role'],
    roles: ['admin', 'sales_manager'], // Admin OR sales_manager
});

// Multiple roles (ALL - user must have all)
definePageMeta({
    middleware: ['auth', 'role'],
    roles: ['admin', 'sales_manager'],
    requireAllRoles: true, // User must be BOTH admin AND sales_manager
});
</script>
```

## Component-Level Guards

Component-level guards are implemented as Vue components. They conditionally render content based on authentication/roles.

### 1. AuthGuard Component

Shows/hides content based on authentication status.

**Usage:**
```vue
<template>
    <AuthGuard>
        <v-card>Only authenticated users see this</v-card>
        <template #fallback>
            <v-alert>Please login</v-alert>
        </template>
    </AuthGuard>
</template>
```

### 2. RoleGuard Component

Shows/hides content based on user roles.

**Usage:**
```vue
<template>
    <!-- Single role -->
    <RoleGuard roles="admin">
        <v-card>Only admins see this</v-card>
    </RoleGuard>

    <!-- Multiple roles (ANY) -->
    <RoleGuard :roles="['admin', 'sales_manager']">
        <v-card>Admins or sales managers see this</v-card>
    </RoleGuard>

    <!-- Multiple roles (ALL) -->
    <RoleGuard :roles="['admin', 'sales_manager']" :require-all="true">
        <v-card>Must be both admin AND sales manager</v-card>
    </RoleGuard>
</template>
```

## Composables

### useRole()

Provides role checking functions for programmatic use and template v-if directives.

```vue
<template>
    <!-- Direct v-if usage -->
    <v-btn v-if="canAccess('admin')">Admin Button</v-btn>
    <v-btn v-if="canAccess(['admin', 'sales_manager'])">Manage Users</v-btn>
</template>

<script setup lang="ts">
const { canAccess, hasRole, hasAnyRole, isAdmin, isSalesManager, isSalesRep } = useRole();

// Programmatic usage
if (isAdmin()) {
    // Admin logic
}

if (canAccess(['admin', 'sales_manager'])) {
    // Admin or sales manager logic
}

if (hasAnyRole(['admin', 'sales_manager'])) {
    // Same as canAccess for arrays
}
</script>
```

**Available functions:**
- `canAccess(roles: string | string[])` - Main function for v-if usage, supports single role or array
- `hasRole(role: string)` - Check single role
- `hasAnyRole(roles: string[])` - Check if user has any of the roles
- `isAdmin()` - Check if admin
- `isSalesManager()` - Check if sales manager
- `isSalesRep()` - Check if sales rep

### useRouteGuard()

Provides route-level guard checks for programmatic use.

```vue
<script setup lang="ts">
const { canAccessRoute, requireAuth } = useRouteGuard();

if (canAccessRoute('admin')) {
    // Can access admin route
}

if (canAccessRoute(['admin', 'sales_manager'], false)) {
    // Can access if user has ANY of these roles
}
</script>
```

## Examples

### Example 1: Protected Admin Page
```vue
<!-- pages/admin/users.vue -->
<template>
    <v-container>
        <h1>User Management</h1>
        <!-- Only admins can see this page -->
    </v-container>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ['auth', 'role'],
    roles: 'admin',
});
</script>
```

### Example 2: Conditional UI Elements (Direct v-if)
```vue
<template>
    <v-app-bar>
        <v-btn to="/dashboard">Dashboard</v-btn>
        
        <!-- Direct v-if usage with canAccess -->
        <v-btn v-if="canAccess('admin')" to="/admin">Admin</v-btn>
        
        <v-btn v-if="canAccess(['admin', 'sales_manager'])" to="/reports">
            Manage Users
        </v-btn>
        
        <v-btn v-if="canAccess('sales_rep')" to="/my-sales">View My Sales</v-btn>
    </v-app-bar>
</template>

<script setup lang="ts">
const { canAccess } = useRole();
</script>
```

### Example 2b: Conditional UI Elements (Component Guards)
```vue
<template>
    <v-app-bar>
        <v-btn to="/dashboard">Dashboard</v-btn>
        
        <RoleGuard roles="admin">
            <v-btn to="/admin">Admin</v-btn>
        </RoleGuard>
        
        <RoleGuard :roles="['admin', 'sales_manager']">
            <v-btn to="/reports">Reports</v-btn>
        </RoleGuard>
    </v-app-bar>
</template>
```

### Example 3: Programmatic Check
```vue
<script setup lang="ts">
const { canAccessRoute } = useRouteGuard();

function handleAction() {
    if (canAccessRoute('admin')) {
        // Perform admin action
    } else {
        // Show error or redirect
    }
}
</script>
```

## Best Practices

1. **Use route-level guards for page protection** - Prevents unauthorized access at the route level
2. **Use component-level guards for UI elements** - Conditionally show/hide buttons, cards, etc.
3. **Combine both** - Use route guards for security, component guards for UX
4. **Always check authentication first** - Role checks should only happen after auth check
5. **Use composables for programmatic checks** - When you need to check access in functions/methods
