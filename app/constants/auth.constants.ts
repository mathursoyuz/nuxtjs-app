export const AUTH_ENDPOINT = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
    LOGOUT_ALL: '/auth/logout-all',
} as const
export const AUTH_TOKEN_KEY = 'auth_token'
export const AUTHORIZATION_HEADER = 'Authorization'
export const BEARER_PREFIX = 'Bearer '
