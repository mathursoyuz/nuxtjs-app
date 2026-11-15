import { darkThemeColors, lightThemeColors } from '~/config/theme'

/**
 * Returns a placeholder image URL (SVG data URI)
 * This can be used when an image is not available
 */
export const getPlaceholderImage = (): string => {
    const colors =
        typeof document !== 'undefined' && document.querySelector('.v-theme--dark')
            ? darkThemeColors
            : lightThemeColors
    // SVG placeholder with a simple image icon
    const svg = `
        <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
            <rect width="300" height="300" fill="${colors.surface}"/>
            <g transform="translate(150, 150)">
                <path d="M-60,-40 L60,-40 L60,40 L-60,40 Z" fill="none" stroke="${colors.secondary}" stroke-width="2"/>
                <circle cx="-30" cy="-10" r="8" fill="${colors.secondary}"/>
                <path d="M-60,10 L-20,10 L-10,20 L-60,20 Z" fill="${colors.secondary}"/>
            </g>
            <text x="150" y="250" text-anchor="middle" fill="${colors.info}" font-family="Arial, sans-serif" font-size="14">No Image</text>
        </svg>
    `
        .trim()
        .replace(/\s+/g, ' ')

    return `data:image/svg+xml;base64,${btoa(svg)}`
}

/**
 * Returns the full image URL with base URL prepended, or placeholder if image is not available
 * @param imagePath - The image filename/path (e.g., "logo.png", "avatar.jpg")
 * @param uploadDir - The upload directory (e.g., "organisations", "customers", "products", "categories")
 * @returns The full image URL or placeholder
 */
export const getFullImageUrl = (
    imagePath: string | null | undefined,
    uploadDir: string
): string => {
    if (!imagePath) {
        return getPlaceholderImage()
    }

    // Get base URL from runtime config (works in component context)
    try {
        const runtimeConfig = useRuntimeConfig()
        return `${runtimeConfig.public.apiBaseUrl}/uploads/${uploadDir}/${imagePath}`
    } catch {
        // Fallback if useRuntimeConfig is not available (e.g., in non-component context)
        return getPlaceholderImage()
    }
}
