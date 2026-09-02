/**
 * Product-related constants
 */

export const PRODUCT_TYPES = {
    SIMPLE: 'simple',
    VARIABLE: 'variable',
    BUNDLE: 'bundle',
} as const

export const PRODUCT_TYPE_OPTIONS = [
    { title: 'Simple', value: PRODUCT_TYPES.SIMPLE },
    { title: 'Variable', value: PRODUCT_TYPES.VARIABLE },
    { title: 'Bundle', value: PRODUCT_TYPES.BUNDLE },
] as const

export const STOCK_STATUS = {
    IN_STOCK: 'in_stock',
    OUT_OF_STOCK: 'out_of_stock',
    LOW_STOCK: 'low_stock',
} as const

export const STOCK_STATUS_OPTIONS = [
    { title: 'In Stock', value: STOCK_STATUS.IN_STOCK },
    { title: 'Out of Stock', value: STOCK_STATUS.OUT_OF_STOCK },
    { title: 'Low Stock', value: STOCK_STATUS.LOW_STOCK },
] as const

export const PRODUCT_FORM_LABELS = {
    PRODUCT_NAME: 'Product Name',
    SLUG: 'Slug',
    SKU: 'SKU',
    DESCRIPTION: 'Description',
    THUMBNAIL: 'Thumbnail',
    GALLERY: 'Product Gallery',
    CATEGORIES: 'Categories',
    LOCATIONS: 'Locations',
    PRODUCT_TYPE: 'Product Type',
    INVENTORY: 'Inventory',
    VARIATIONS: 'Variations',
    SETTINGS: 'Settings',
    IS_FEATURED: 'Is Featured',
} as const

export const PRODUCT_FORM_HINTS = {
    PRODUCT_NAME: 'A product name is required and recommended to be unique.',
    SLUG: 'URL-friendly version of the name',
    DESCRIPTION: 'Set a description to the product for better visibility.',
    THUMBNAIL:
        'Set the product thumbnail image. Only *.png, *.jpg and *.jpeg image files are accepted.',
    GALLERY: 'Upload multiple images for the product gallery.',
    CATEGORIES: 'Select categories for this product.',
    LOCATIONS: 'Select locations where this product is available.',
} as const

export const VALIDATION_MESSAGES = {
    SKU_REQUIRED: 'SKU is required',
    SKU_MIN_LENGTH: 'SKU must be at least 5 characters',
    SKU_ALREADY_EXISTS: 'SKU already exists',
    SLUG_REQUIRED: 'Slug is required',
    SLUG_MIN_LENGTH: 'Slug must be at least 5 characters',
    SLUG_ALREADY_EXISTS: 'Slug already exists',
    NAME_REQUIRED: 'Product name is required',
    CATEGORIES_REQUIRED: 'At least one category is required',
    VARIATIONS_REQUIRED: "Variations are required when type is 'variable'",
    CHILDREN_REQUIRED: "Children are required when type is 'bundle'",
} as const

export const FILE_UPLOAD = {
    MAX_SIZE_MB: 2,
    MAX_SIZE_BYTES: 2 * 1024 * 1024,
    ACCEPTED_TYPES: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
    MAX_GALLERY_FILES: 10,
} as const

export const FILE_UPLOAD_MESSAGES = {
    MAX_SIZE: (filename: string) =>
        `${filename} is too large. Maximum size is ${FILE_UPLOAD.MAX_SIZE_MB}MB.`,
    INVALID_TYPE: (filename: string) => `${filename} must be a JPEG, PNG, or WebP image.`,
    MAX_GALLERY_FILES: `A gallery can contain at most ${FILE_UPLOAD.MAX_GALLERY_FILES} images.`,
} as const

export type ProductType = (typeof PRODUCT_TYPES)[keyof typeof PRODUCT_TYPES]
export type StockStatus = (typeof STOCK_STATUS)[keyof typeof STOCK_STATUS]
