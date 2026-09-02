import type { LoginCredentials, RegisterData, AuthResponse, User } from '~/types/auth.types'

export interface AuthRepository {
    login(credentials: LoginCredentials): Promise<AuthResponse>
    register(data: RegisterData): Promise<AuthResponse>
    getCurrentUser(): Promise<User>
}
