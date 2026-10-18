import type { LoginCredentials, RegisterData, AuthResponse, User } from '~/types/auth.types'

export interface AuthRepository {
    login(credentials: LoginCredentials): Promise<AuthResponse>
    register(data: RegisterData): Promise<AuthResponse>
    logout(allSessions?: boolean): Promise<void>
    getCurrentUser(): Promise<User>
}
