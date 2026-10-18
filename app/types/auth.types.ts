import type { AccountIdentity } from './account-identity.types'

export type User = AccountIdentity

export interface AuthResponse {
    user: User
    accessToken: string
}

export interface LoginCredentials {
    email: string
    password: string
}

export interface RegisterData {
    email: string
    firstName: string
    lastName: string
    phoneNumber: string
    password: string
    confirmPassword: string
}

export interface JwtPayload {
    sub: number
    sid: string
    authVersion: number
    iat: number
    exp: number
}
