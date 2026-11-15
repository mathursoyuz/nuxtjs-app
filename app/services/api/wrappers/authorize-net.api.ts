import HttpFactory from '@/repository/factory'
import type { ApiResponse } from '~/types/api.types'
import type {
    CreateAuthorizeNetProfileInput,
    CreateAuthorizeNetProfileResponse,
} from '~/types/authorize-net.types'

export class AuthorizeNetApiService extends HttpFactory {
    async createCustomerProfile(
        data: CreateAuthorizeNetProfileInput
    ): Promise<ApiResponse<CreateAuthorizeNetProfileResponse>> {
        return await this.call<CreateAuthorizeNetProfileResponse, CreateAuthorizeNetProfileInput>(
            'POST',
            '/payments/create-profile',
            data
        )
    }
}

export default AuthorizeNetApiService
