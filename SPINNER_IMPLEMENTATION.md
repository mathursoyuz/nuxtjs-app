# Global Spinner Implementation

## Overview
The application uses a **global spinner** that automatically shows for all API requests and hides when requests complete.

## Architecture

### 1. Loading Store (`app/stores/loading.store.ts`)
- **Pinia store** that manages global loading state
- Tracks `requestCount` to handle multiple concurrent requests
- Provides `startLoading()` and `stopLoading()` actions
- Getter `isActive` returns `true` when loading

### 2. Global Loading Overlay (`app/components/globals/GlobalLoadingOverlay.vue`)
- **Full-screen overlay** component with spinner
- Shows when `loadingStore.isActive` is `true`
- Includes:
  - Blurred backdrop
  - Centered spinner (Vuetify `v-progress-circular`)
  - Loading message
  - Smooth fade transitions

### 3. Integration Points

#### Root App (`app/app.vue`)
```vue
<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
    <GlobalLoadingOverlay />  <!-- Global spinner component -->
</template>
```

#### API Request Interceptor (`app/services/api/interceptors/request.interceptor.ts`)
- **Automatically starts loading** when any API request is made
- Skips loading for validation endpoints: `/check-sku`, `/check-slug`
- Uses async import to access the loading store

#### API Response Interceptor (`app/services/api/interceptors/response.interceptor.ts`)
- **Automatically stops loading** when API response arrives
- Handles both success and error responses
- Uses async import to access the loading store

## How It Works

1. **User triggers an action** (e.g., clicks "Edit Product")
2. **API request is made** (e.g., `fetchProductById`)
3. **Request interceptor fires** → calls `loadingStore.startLoading()`
4. **Global spinner appears** → `GlobalLoadingOverlay` shows
5. **API response arrives**
6. **Response interceptor fires** → calls `loadingStore.stopLoading()`
7. **Global spinner disappears** → `GlobalLoadingOverlay` hides

## Files Structure

```
app/
├── stores/
│   └── loading.store.ts          # Pinia store for loading state
├── components/
│   └── globals/
│       └── GlobalLoadingOverlay.vue  # Spinner UI component
├── services/
│   └── api/
│       └── interceptors/
│           ├── request.interceptor.ts   # Starts loading
│           └── response.interceptor.ts # Stops loading
└── app.vue                       # Root component with spinner
```

## Features

✅ **Automatic** - No manual calls needed  
✅ **Application-wide** - Works for all API requests  
✅ **Request counting** - Handles multiple concurrent requests  
✅ **Smart skipping** - Skips validation endpoints  
✅ **Smooth transitions** - Fade in/out animations  
✅ **Blur effect** - Backdrop blurs page content  

## Testing

To test the spinner:
1. Open browser DevTools → Network tab
2. Perform any action that triggers an API call (e.g., edit product, submit form)
3. Observe the global spinner appearing during the request
4. Spinner should disappear when request completes

## Troubleshooting

If spinner doesn't show:
1. Check browser console for errors
2. Verify `GlobalLoadingOverlay` is in `app.vue`
3. Verify interceptors are registered in `ApiClientImpl`
4. Check if store is being imported correctly in interceptors
