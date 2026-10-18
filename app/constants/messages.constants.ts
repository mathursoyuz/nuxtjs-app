/**
 * Centralized message constants for API responses
 * Structure: MODULE_ACTION_TYPE (e.g., ORGANISATION_CREATE_SUCCESS)
 *
 * Usage:
 * - Import: import { ORGANISATION_MESSAGES } from '~/constants/messages.constants'
 * - Use with useApiMessage composable for API response fallback
 */

// ============================================
// ORGANISATION MESSAGES
// ============================================
export const ORGANISATION_MESSAGES = {
    // Success messages
    CREATE_SUCCESS: 'Organisation created successfully',
    UPDATE_SUCCESS: 'Organisation updated successfully',
    DELETE_SUCCESS: 'Organisation deleted successfully',
    ACTIVATE_SUCCESS: 'Organisation activated successfully',
    DEACTIVATE_SUCCESS: 'Organisation deactivated successfully',
    FETCH_SUCCESS: 'Organisations fetched successfully',

    // Error messages
    CREATE_ERROR: 'Failed to create organisation',
    UPDATE_ERROR: 'Failed to update organisation',
    DELETE_ERROR: 'Failed to delete organisation',
    FETCH_ERROR: 'Failed to fetch organisations',
    NOT_FOUND: 'Organisation not found',

    // Warning messages
    LOGO_UPLOAD_FAILED: 'Organisation created but logo upload failed',
    LOGO_UPDATE_FAILED: 'Organisation updated but logo upload failed',

    // Credit card messages
    CREDIT_CARD_ADD_SUCCESS: 'Billing and credit card added successfully',
    CREDIT_CARD_ADD_ERROR: 'Failed to add billing and credit card',
    CREDIT_CARD_UPDATE_SUCCESS: 'Credit card updated successfully',
    CREDIT_CARD_UPDATE_ERROR: 'Failed to update credit card',
    CREDIT_CARD_ACTIVATE_SUCCESS: 'Credit card activated',
    CREDIT_CARD_DEACTIVATE_SUCCESS: 'Credit card deactivated',
    CREDIT_CARD_ADDED_SUCCESS: 'Credit card added successfully',
    CREDIT_CARD_ADDED_ERROR: 'Failed to add credit card',
    CREDIT_CARD_DELETE_SUCCESS: 'Credit card deleted successfully',
    CREDIT_CARD_DELETE_ERROR: 'Failed to delete credit card',
    CREDIT_CARD_STATUS_UPDATED: 'Credit card status updated',
    CREDIT_CARD_FETCH_ERROR: 'Failed to fetch credit cards',

    // Validation
    EMAIL_CHECK_ERROR: 'Error checking email availability',
} as const

// ============================================
// CUSTOMER MESSAGES
// ============================================
export const CUSTOMER_MESSAGES = {
    // Success messages
    CREATE_SUCCESS: 'Customer created successfully!',
    UPDATE_SUCCESS: 'Customer updated successfully!',
    DELETE_SUCCESS: 'Customer deleted successfully',
    FETCH_SUCCESS: 'Customers fetched successfully',

    // Error messages
    CREATE_ERROR: 'Failed to create customer',
    UPDATE_ERROR: 'Failed to update customer',
    DELETE_ERROR: 'Failed to delete customer',
    FETCH_ERROR: 'Failed to fetch customers',
    NOT_FOUND: 'Customer not found',

    // Warning messages
    AVATAR_UPLOAD_FAILED: 'Customer created but avatar upload failed',
    AVATAR_UPDATE_FAILED: 'Customer updated but avatar upload failed',

    // Import/Sync messages
    IMPORT_QB_SUCCESS: 'Customers imported from QuickBooks successfully',
    IMPORT_QB_ERROR: 'Failed to import customers from QuickBooks',
    IMPORT_SQUARE_SUCCESS: 'Customers imported from Square successfully',
    IMPORT_SQUARE_ERROR: 'Failed to import customers from Square',
    SYNC_QB_SUCCESS: 'Customer synced to QuickBooks successfully!',
    SYNC_QB_RESYNC_SUCCESS: 'Customer resynced to QuickBooks successfully!',
    SYNC_QB_ERROR: 'Failed to sync customer to QuickBooks',
    SYNC_SQUARE_SUCCESS: 'Customer synced to Square successfully!',
    SYNC_SQUARE_ERROR: 'Failed to sync customer to Square',

    // Billing/Shipping
    BILLING_UPDATE_SUCCESS: 'Billing address updated successfully!',
    BILLING_UPDATE_ERROR: 'Failed to update billing address',
    SHIPPING_ADD_SUCCESS: 'Shipping address added successfully!',
    SHIPPING_UPDATE_SUCCESS: 'Shipping address updated successfully!',
    SHIPPING_SAVE_ERROR: 'Failed to save shipping address',
    SHIPPING_DEACTIVATE_SUCCESS: 'Shipping address deactivated',
    SHIPPING_REMOVE_SUCCESS: 'Shipping address deleted successfully',
    SHIPPING_REMOVE_ERROR: 'Failed to remove shipping address',
    SHIPPING_UPDATE_BULK_SUCCESS: 'Shipping addresses updated successfully!',
    SHIPPING_UPDATE_BULK_ERROR: 'Failed to save shipping addresses',

    // Password
    PASSWORD_UPDATE_SUCCESS: 'Password updated successfully!',
    PASSWORD_UPDATE_ERROR: 'Failed to update password',

    // Credit card
    CREDIT_CARD_UPDATE_INFO:
        'Credit card active status updated. Note: This requires backend support for credit card management.',
    CREDIT_CARD_ADD_SUCCESS: 'Credit card added successfully!',
    CREDIT_CARD_ADD_ERROR: 'Failed to add credit card',
    CREDIT_CARD_UPDATE_SUCCESS: 'Credit card updated successfully',
    CREDIT_CARD_UPDATE_ERROR: 'Failed to update credit card',
    CREDIT_CARD_ACTIVATE_SUCCESS: 'Credit card activated',
    CREDIT_CARD_DEACTIVATE_SUCCESS: 'Credit card deactivated',

    // Validation
    ORGANISATION_ID_REQUIRED: 'Organisation ID is required',
    NO_CHANGES: 'No changes detected',
    FILE_SIZE_ERROR: 'File size must be less than 2MB',
    FILE_TYPE_ERROR: 'Please select an image file',
} as const

// ============================================
// PRODUCT MESSAGES
// ============================================
export const PRODUCT_MESSAGES = {
    // Success messages
    CREATE_SUCCESS: 'Product created successfully',
    UPDATE_SUCCESS: 'Product updated successfully',
    DELETE_SUCCESS: 'Product deleted successfully',
    FETCH_SUCCESS: 'Products fetched successfully',

    // Error messages
    CREATE_ERROR: 'Failed to create product',
    UPDATE_ERROR: 'Failed to update product',
    DELETE_ERROR: 'Failed to delete product',
    FETCH_ERROR: 'Failed to fetch products',
    NOT_FOUND: 'Product not found',

    // Sync messages
    SYNC_QB_SUCCESS: 'Product synced to QuickBooks successfully',
    SYNC_QB_RESYNC_SUCCESS: 'Product resynced to QuickBooks successfully!',
    SYNC_QB_ERROR: 'Failed to sync product to QuickBooks',
    SYNC_SQUARE_SUCCESS: 'Product synced to Square successfully',
    SYNC_SQUARE_ERROR: 'Failed to sync product to Square',

    // Import messages
    IMPORT_SQUARE_FETCH_SUCCESS: 'Successfully fetched products from Square',
    IMPORT_SQUARE_FETCH_ERROR: 'Failed to fetch products',
    IMPORT_SQUARE_NO_PRODUCTS: 'No products found matching the filters',
    IMPORT_SQUARE_SELECT_REQUIRED: 'Please select at least one product to import',
    IMPORT_SQUARE_SUCCESS: 'Product imported successfully',
    IMPORT_SQUARE_ERROR: 'Failed to import products',
    IMPORT_SQUARE_SINGLE_ERROR: 'Failed to import product',
    IMPORT_SQUARE_SKIPPED: 'Product skipped (may already exist)',
    IMPORT_SQUARE_FAILED: 'Import failed',
} as const

// ============================================
// CATEGORY MESSAGES
// ============================================
export const CATEGORY_MESSAGES = {
    // Success messages
    CREATE_SUCCESS: 'Category created successfully!',
    UPDATE_SUCCESS: 'Category updated successfully!',
    DELETE_SUCCESS: 'Category deleted successfully!',
    FETCH_SUCCESS: 'Categories fetched successfully',

    // Error messages
    CREATE_ERROR: 'Failed to create category',
    UPDATE_ERROR: 'Failed to update category',
    DELETE_ERROR: 'Failed to delete category',
    FETCH_ERROR: 'Failed to fetch categories',
    NOT_FOUND: 'Category not found',

    // Import/Sync messages
    IMPORT_SQUARE_FETCH_ERROR: 'Failed to fetch Square categories',
    IMPORT_SQUARE_FETCH_SUCCESS: 'Successfully fetched categories from Square',
    IMPORT_SQUARE_NO_CATEGORIES: 'No categories found',
    IMPORT_SQUARE_SELECT_REQUIRED: 'Please select at least one category to import',
    IMPORT_SQUARE_SUCCESS: 'Category imported successfully',
    IMPORT_SQUARE_ERROR: 'Failed to import category from Square',
    IMPORT_SQUARE_SKIPPED: 'Category skipped (may already exist)',
    IMPORT_SQUARE_FAILED: 'Import failed',
    SYNC_QB_SUCCESS: 'Category synced to QuickBooks successfully',
    SYNC_QB_ERROR: 'Failed to sync category to QuickBooks',
    SYNC_QB_SLUG_REQUIRED: 'Company slug not available. Please configure QuickBooks integration.',
} as const

// ============================================
// LOCATION MESSAGES
// ============================================
export const LOCATION_MESSAGES = {
    // Success messages
    CREATE_SUCCESS: 'Location created successfully!',
    UPDATE_SUCCESS: 'Location updated successfully!',
    DELETE_SUCCESS: 'Location deleted successfully',
    FETCH_SUCCESS: 'Locations fetched successfully',

    // Error messages
    CREATE_ERROR: 'Failed to create location',
    UPDATE_ERROR: 'Failed to update location',
    DELETE_ERROR: 'Failed to delete location',
    SAVE_ERROR: 'Failed to save location',
    FETCH_ERROR: 'Failed to fetch locations',
    NOT_FOUND: 'Location not found',

    // Import/Sync messages
    IMPORT_SQUARE_FETCH_ERROR: 'Failed to fetch Square locations',
    IMPORT_SQUARE_FETCH_SUCCESS: 'Successfully fetched locations from Square',
    IMPORT_SQUARE_NO_LOCATIONS: 'No locations found',
    IMPORT_SQUARE_SELECT_REQUIRED: 'Please select at least one location to import',
    IMPORT_SQUARE_SUCCESS: 'Location imported successfully',
    IMPORT_SQUARE_ERROR: 'Failed to import location from Square',
    IMPORT_SQUARE_SKIPPED: 'Location skipped (may already exist)',
    IMPORT_SQUARE_FAILED: 'Import failed',
    IMPORT_SQUARE_WARNING: 'Import warning',
    SYNC_QB_SUCCESS: 'Location synced to QuickBooks successfully',
    SYNC_QB_ERROR: 'Failed to sync location to QuickBooks',
    SYNC_QB_SLUG_REQUIRED: 'Company slug not available. Please configure QuickBooks integration.',
    SYNC_QB_NOT_IMPLEMENTED: 'QuickBooks location sync not yet implemented',
} as const

// ============================================
// ORDER MESSAGES
// ============================================
export const ORDER_MESSAGES = {
    CREATE_SUCCESS: 'Order created successfully',
    UPDATE_SUCCESS: 'Order updated successfully',
    DELETE_SUCCESS: 'Order deleted successfully',
    FETCH_SUCCESS: 'Orders fetched successfully',
    FETCH_ERROR: 'Failed to fetch orders',
    CREATE_ERROR: 'Failed to create order',
    UPDATE_ERROR: 'Failed to update order',
    DELETE_ERROR: 'Failed to delete order',
} as const

// ============================================
// ORGANISATION PRODUCT MESSAGES
// ============================================
export const ORGANISATION_PRODUCT_MESSAGES = {
    CREATE_SUCCESS: 'Organisation product created successfully',
    CREATE_ERROR: 'Failed to create organisation product',
    UPDATE_SUCCESS: 'Organisation product updated successfully',
    UPDATE_ERROR: 'Failed to update organisation product',
    DELETE_SUCCESS: 'Product deleted successfully',
    DELETE_ERROR: 'Failed to delete product',
    FETCH_ERROR: 'Failed to fetch organisation products',
    TOGGLE_ERROR: 'Failed to toggle product status',
    EDIT_COMING_SOON: 'Edit functionality coming soon',
    ADD_COMING_SOON: 'Add product functionality coming soon',
    TOGGLE_COMING_SOON: 'Toggle active functionality coming soon',
    PURCHASE_SUCCESS: 'Products purchased successfully',
    PURCHASE_ERROR: 'Failed to purchase products',
} as const

// ============================================
// INTEGRATION MESSAGES
// ============================================
export const INTEGRATION_MESSAGES = {
    // QuickBooks
    QB_CONNECT_SUCCESS: 'Connected to QuickBooks successfully',
    QB_CONNECT_ERROR: 'Failed to connect to QuickBooks',
    QB_DISCONNECT_SUCCESS: 'Disconnected from QuickBooks successfully',
    QB_FETCH_ERROR: 'Failed to fetch data from QuickBooks',

    // Square
    SQUARE_CONNECT_SUCCESS: 'Connected to Square successfully',
    SQUARE_CONNECT_ERROR: 'Failed to connect to Square',
    SQUARE_FETCH_ERROR: 'Failed to fetch data from Square',
    SQUARE_IMPORT_ERROR: 'Failed to import data from Square',

    // Corksy
    CORKSY_FETCH_ERROR: 'Failed to fetch Corksy orders',
    CORKSY_IMPORT_ERROR: 'Failed to import Corksy orders',
    CORKSY_BRAND_SLUG_REQUIRED: 'Please enter a brand slug',
    CORKSY_COMPANY_SLUG_REQUIRED: 'Please enter a company slug',

    // ShipStation
    SHIPSTATION_SYNC_SUCCESS: 'Synced to ShipStation successfully',
    SHIPSTATION_SYNC_ERROR: 'Failed to sync to ShipStation',
} as const

// ============================================
// TRANSACTION MESSAGES
// ============================================
export const TRANSACTION_MESSAGES = {
    FETCH_SUCCESS: 'Transactions fetched successfully',
    FETCH_ERROR: 'Failed to fetch transactions',
    IMPORT_SQUARE_SUCCESS: 'Transactions imported successfully',
    IMPORT_SQUARE_ERROR: 'Failed to import transactions',
} as const

// ============================================
// VENDOR MESSAGES
// ============================================
export const VENDOR_MESSAGES = {
    FETCH_SUCCESS: 'Vendors fetched successfully',
    FETCH_ERROR: 'Failed to fetch vendors',
    IMPORT_SQUARE_SUCCESS: 'Vendors imported successfully',
    IMPORT_SQUARE_ERROR: 'Failed to import vendors',
} as const

// ============================================
// DISCOUNT MESSAGES
// ============================================
export const DISCOUNT_MESSAGES = {
    FETCH_SUCCESS: 'Discounts fetched successfully',
    FETCH_ERROR: 'Failed to fetch discounts',
    IMPORT_SQUARE_SUCCESS: 'Discounts imported successfully',
    IMPORT_SQUARE_ERROR: 'Failed to import discounts',
} as const

// ============================================
// INVENTORY MESSAGES
// ============================================
export const INVENTORY_MESSAGES = {
    SYNC_SUCCESS: 'Inventory synced successfully',
    SYNC_ERROR: 'Failed to sync inventory',
    FETCH_ERROR: 'Failed to fetch inventory',
} as const

// ============================================
// GENERAL MESSAGES
// ============================================
export const GENERAL_MESSAGES = {
    SUCCESS: 'Operation completed successfully',
    ERROR: 'An error occurred',
    UNEXPECTED_ERROR: 'An unexpected error occurred',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'You are not authorized to perform this action',
    FORBIDDEN: 'Access forbidden',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Please fix the validation errors',
    LOADING: 'Loading...',
    SAVING: 'Saving...',
    DELETING: 'Deleting...',
    NO_DATA: 'No data available',
    SELECT_REQUIRED: 'Please select at least one item',
} as const

// ============================================
// TYPE EXPORTS
// ============================================
export type OrganisationMessageKey = keyof typeof ORGANISATION_MESSAGES
export type CustomerMessageKey = keyof typeof CUSTOMER_MESSAGES
export type ProductMessageKey = keyof typeof PRODUCT_MESSAGES
export type CategoryMessageKey = keyof typeof CATEGORY_MESSAGES
export type LocationMessageKey = keyof typeof LOCATION_MESSAGES
export type OrderMessageKey = keyof typeof ORDER_MESSAGES
export type IntegrationMessageKey = keyof typeof INTEGRATION_MESSAGES
export type TransactionMessageKey = keyof typeof TRANSACTION_MESSAGES
export type VendorMessageKey = keyof typeof VENDOR_MESSAGES
export type DiscountMessageKey = keyof typeof DISCOUNT_MESSAGES
export type InventoryMessageKey = keyof typeof INVENTORY_MESSAGES
export type GeneralMessageKey = keyof typeof GENERAL_MESSAGES
