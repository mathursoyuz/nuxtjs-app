import type { AuthRepository } from './AuthRepository'
import type { ApiClient } from '../api/ApiClient'
import type { LoginCredentials, RegisterData, AuthResponse, User } from '~/types/auth.types'
import { AUTH_ENDPOINT } from '~/constants/auth.constants'

export class AuthRepositoryImpl implements AuthRepository {
    constructor(private readonly apiClient: ApiClient) {}
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await this.apiClient.post<AuthResponse>(AUTH_ENDPOINT.LOGIN, credentials)
        if (!response.data?.accessToken || !response.data.user)
            throw new Error('Invalid authentication response.')
        return response.data
    }
    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await this.apiClient.post<AuthResponse>(AUTH_ENDPOINT.REGISTER, data)
        if (!response.data?.accessToken || !response.data.user)
            throw new Error('Invalid authentication response.')
        return response.data
    }
    async getCurrentUser(): Promise<User> {
        const response = await this.apiClient.get<User>(AUTH_ENDPOINT.ME)
        if (!response.data) throw new Error('Invalid account response.')
        return response.data
    }
    async logout(allSessions = false): Promise<void> {
        await this.apiClient.post(allSessions ? AUTH_ENDPOINT.LOGOUT_ALL : AUTH_ENDPOINT.LOGOUT)
    }
}
