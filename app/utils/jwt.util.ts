import type { JwtPayload } from '~/types/auth.types'

export function decodeJwt(token: string): JwtPayload | null {
    try {
        const payload = token.split('.')[1]
        if (!payload) {
            return null
        }

        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
        const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
        const decoded = JSON.parse(atob(paddedBase64))
        return decoded as JwtPayload
    } catch {
        return null
    }
}

export function isTokenExpired(token: string): boolean {
    const payload = decodeJwt(token)
    if (!payload || !payload.exp) {
        return true
    }

    const exp = payload.exp * 1000 // Convert to milliseconds
    return Date.now() >= exp
}

export function getTokenExpirationTime(token: string): number | null {
    const payload = decodeJwt(token)
    if (!payload || !payload.exp) {
        return null
    }

    return payload.exp * 1000 // Return in milliseconds
}

/**
 * Extract role from JWT token
 * @param token - JWT token string
 * @returns Role name or null if not found
 */
export function getRoleFromToken(token: string): string | null {
    const payload = decodeJwt(token)
    return payload?.role || null
}

/**
 * Extract user ID from JWT token
 * @param token - JWT token string
 * @returns User ID or null if not found
 */
export function getUserIdFromToken(token: string): number | null {
    const payload = decodeJwt(token)
    return payload?.sub || null
}

/**
 * Extract role ID from JWT token
 * @param token - JWT token string
 * @returns Role ID or null if not found
 */
export function getRoleIdFromToken(token: string): number | null {
    const payload = decodeJwt(token)
    return payload?.roleId || null
}
