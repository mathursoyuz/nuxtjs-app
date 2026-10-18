import type { LoginCredentials, RegisterData, AuthResponse, User } from '~/types/auth.types'

export type AuthSession = Pick<AuthResponse, 'user' | 'accessToken'>

export interface AuthService {
    login(credentials: LoginCredentials): Promise<AuthResponse>
    register(data: RegisterData): Promise<AuthResponse>
    logout(allSessions?: boolean): Promise<void>
    clearSession(expectedToken?: string): boolean
    restoreSession(): Promise<AuthSession | null>
    refreshUser(): Promise<User | null>
}
