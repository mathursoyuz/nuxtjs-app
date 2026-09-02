import type { AuthRepository } from './AuthRepository'
import type { ApiClient } from '../api/ApiClient'
import type { LoginCredentials, RegisterData, AuthResponse, User } from '~/types/auth.types'

const toAuthResponse = (value: unknown): AuthResponse | null => {
    if (!value || typeof value !== 'object') {
        return null
    }

    const candidate = value as Record<string, unknown>
    if (
        !candidate.user ||
        typeof candidate.user !== 'object' ||
        typeof candidate.accessToken !== 'string'
    ) {
        return null
    }

    return {
        user: candidate.user as User,
        accessToken: candidate.accessToken,
        tokenType: 'Bearer',
    }
}

export class AuthRepositoryImpl implements AuthRepository {
    constructor(private readonly apiClient: ApiClient) {}

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await this.apiClient.post<AuthResponse>('/auth/login', credentials)
        // Handle backend response format: { statusCode, success, message, data, ... }
        // If data is null, check if user/accessToken are at top level (backend interceptor bug workaround)
        const data = toAuthResponse(response.data)
        if (data) {
            return data
        }
        // Fallback: check if response has user/accessToken directly (for auth endpoints)
        const rootData = toAuthResponse(response)
        if (rootData) {
            return rootData
        }
        throw new Error(response.message || 'Invalid response from server')
    }

    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await this.apiClient.post<AuthResponse>('/auth/register', data)
        // Handle backend response format: { statusCode, success, message, data, ... }
        // The backend ResponseInterceptor wraps the response, but for auth endpoints,
        // the actual auth data might be in data or at the root level
        const responseData = toAuthResponse(response.data)
        if (responseData) {
            return responseData
        }
        // Fallback: check if response has user/accessToken directly (shouldn't happen with interceptor, but just in case)
        const rootData = toAuthResponse(response)
        if (rootData) {
            return rootData
        }
        // If data is null but we have a success response (201), this means the backend
        // ResponseInterceptor didn't find data.data, so it set data to null.
        // The actual auth response from the service is lost. We need to handle this gracefully.
        // For registration, we can redirect to login since the user was created successfully.
        if (response.success && response.statusCode === 201) {
            // Registration was successful, but we don't have the auth data
            // This is a backend issue - the ResponseInterceptor should handle auth responses differently
            // For now, we'll throw a specific error that the registration page can handle
            const error = new Error(
                'Registration successful! Please login to continue.'
            ) as Error & {
                isRegistrationSuccess: boolean
                statusCode: number
            }
            error.isRegistrationSuccess = true
            error.statusCode = 201
            throw error
        }
        throw new Error(response.message || 'Invalid response from server')
    }

    async getCurrentUser(): Promise<User> {
        const response = await this.apiClient.get<User>('/auth/me')
        // Handle backend response format
        if (response.data) {
            return response.data
        }
        throw new Error(response.message || 'Invalid response from server')
    }
}
