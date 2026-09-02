import type { AuthService } from './AuthService'
import type { AuthRepository } from './AuthRepository'
import type { StorageService } from '../storage/StorageService'
import type { ApiClient } from '../api/ApiClient'
import type { LoginCredentials, RegisterData, AuthResponse, User } from '~/types/auth.types'
import { isTokenExpired } from '~/utils/jwt.util'

const AUTH_TOKEN_KEY = 'auth_token'
const USER_KEY = 'user'

export class AuthServiceImpl implements AuthService {
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly storageService: StorageService,
        private readonly apiClient: ApiClient
    ) {}

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await this.authRepository.login(credentials)
        this.saveAuth(response)
        return response
    }

    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await this.authRepository.register(data)
        this.saveAuth(response)
        return response
    }

    async logout(): Promise<void> {
        this.clearAuth()
    }

    async restoreSession(): Promise<Pick<AuthResponse, 'user' | 'accessToken'> | null> {
        const accessToken = this.storageService.get<string>(AUTH_TOKEN_KEY)
        if (!accessToken || isTokenExpired(accessToken)) {
            this.clearAuth()
            return null
        }

        this.apiClient.setAuthToken(accessToken)

        try {
            const user = await this.authRepository.getCurrentUser()
            this.storageService.set(USER_KEY, user)
            return { user, accessToken }
        } catch {
            this.clearAuth()
            return null
        }
    }

    async refreshUser(): Promise<User | null> {
        try {
            const user = await this.authRepository.getCurrentUser()
            this.storageService.set(USER_KEY, user)
            return user
        } catch (error) {
            console.error('Failed to refresh user:', error)
            this.clearAuth()
            return null
        }
    }

    private saveAuth(response: AuthResponse): void {
        this.storageService.set(AUTH_TOKEN_KEY, response.accessToken)
        this.storageService.set(USER_KEY, response.user)
        this.apiClient.setAuthToken(response.accessToken)
    }

    private clearAuth(): void {
        this.storageService.remove(AUTH_TOKEN_KEY)
        this.storageService.remove(USER_KEY)
        this.apiClient.setAuthToken(null)
    }
}
