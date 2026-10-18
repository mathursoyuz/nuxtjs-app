import type { AuthService } from './AuthService'
import type { AuthRepository } from './AuthRepository'
import type { StorageService } from '../storage/StorageService'
import type { ApiClient } from '../api/ApiClient'
import type { LoginCredentials, RegisterData, AuthResponse, User } from '~/types/auth.types'
import { isTokenExpired } from '~/utils/jwt.util'
import { AUTH_TOKEN_KEY } from '~/constants/auth.constants'

export class AuthServiceImpl implements AuthService {
    private revision = 0
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly storageService: StorageService,
        private readonly apiClient: ApiClient
    ) {}
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const current = ++this.revision
        const response = await this.authRepository.login(credentials)
        this.saveAuth(response, current)
        return response
    }
    async register(data: RegisterData): Promise<AuthResponse> {
        const current = ++this.revision
        const response = await this.authRepository.register(data)
        this.saveAuth(response, current)
        return response
    }
    async logout(allSessions = false): Promise<void> {
        const current = ++this.revision
        try {
            if (this.storageService.get<string>(AUTH_TOKEN_KEY))
                await this.authRepository.logout(allSessions)
        } finally {
            if (current === this.revision) this.clearSession()
        }
    }
    async restoreSession(): Promise<Pick<AuthResponse, 'user' | 'accessToken'> | null> {
        const current = this.revision
        const accessToken = this.storageService.get<string>(AUTH_TOKEN_KEY)
        if (!accessToken || isTokenExpired(accessToken)) {
            this.clearSession()
            return null
        }
        this.apiClient.setAuthToken(accessToken)
        try {
            const user = await this.authRepository.getCurrentUser()
            if (current !== this.revision) return null
            return { user, accessToken }
        } catch (error) {
            if (current === this.revision) this.clearSession(accessToken)
            throw error
        }
    }
    async refreshUser(): Promise<User | null> {
        const current = this.revision
        const user = await this.authRepository.getCurrentUser()
        return current === this.revision ? user : null
    }
    private saveAuth(response: AuthResponse, current: number): void {
        if (current !== this.revision) throw new Error('Authentication request was superseded.')
        if (isTokenExpired(response.accessToken)) throw new Error('Invalid authentication token.')
        this.storageService.set(AUTH_TOKEN_KEY, response.accessToken)
        this.apiClient.setAuthToken(response.accessToken)
    }
    clearSession(expectedToken?: string): boolean {
        if (
            expectedToken !== undefined &&
            expectedToken !== this.storageService.get<string>(AUTH_TOKEN_KEY)
        )
            return false
        this.revision++
        this.storageService.remove(AUTH_TOKEN_KEY)
        this.apiClient.setAuthToken(null)
        return true
    }
}
