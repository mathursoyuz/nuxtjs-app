import HttpFactory from '@/repository/factory'
import type {
    AccessSnapshot,
    AccessContext,
    AccessRole,
    CreateManagedUser,
    ManagedUser,
    ManagedUserOverview,
    ManagedUserDetail,
    RoleInput,
    SystemRole,
    UpdateManagedUser,
    UserManagementOptions,
} from '~/types/access.types'
import type { ApiResponse } from '~/types/api.types'

/**
 * Access API wrapper service
 */
export class AccessApiService extends HttpFactory {
    async organisations(): Promise<ApiResponse<AccessSnapshot>> {
        return await this.call<AccessSnapshot>('GET', '/access/organisations', undefined, {
            skipCache: true,
        })
    }

    async context(organisationId: number): Promise<ApiResponse<AccessContext>> {
        return await this.call<AccessContext>(
            'GET',
            `/access/organisations/${organisationId}/context`,
            undefined,
            { skipCache: true }
        )
    }

    async roles(organisationId: number): Promise<ApiResponse<AccessRole[]>> {
        return await this.call<AccessRole[]>(
            'GET',
            `/access/organisations/${organisationId}/roles`,
            undefined,
            { skipCache: true }
        )
    }

    async permissions(
        organisationId: number
    ): Promise<ApiResponse<Array<{ code: string; name: string }>>> {
        return await this.call<Array<{ code: string; name: string }>>(
            'GET',
            `/access/organisations/${organisationId}/permissions`,
            undefined,
            { skipCache: true }
        )
    }

    async saveRole(
        organisationId: number,
        data: RoleInput,
        roleId?: number
    ): Promise<ApiResponse<AccessRole>> {
        return roleId
            ? await this.call<AccessRole, RoleInput>(
                  'PUT',
                  `/access/organisations/${organisationId}/roles/${roleId}`,
                  data
              )
            : await this.call<AccessRole, RoleInput>(
                  'POST',
                  `/access/organisations/${organisationId}/roles`,
                  data
              )
    }

    async deleteRole(organisationId: number, roleId: number): Promise<ApiResponse<unknown>> {
        return await this.call<unknown>(
            'DELETE',
            `/access/organisations/${organisationId}/roles/${roleId}`
        )
    }

    async changeSystemRole(
        userId: number,
        systemRole: SystemRole
    ): Promise<ApiResponse<unknown>> {
        return await this.call<unknown, { systemRole: SystemRole }>(
            'PUT',
            `/access/users/${userId}/system-role`,
            { systemRole }
        )
    }

    async managedUsers(organisationId: number): Promise<ApiResponse<ManagedUser[]>> {
        return await this.call<ManagedUser[]>(
            'GET',
            `/access/organisations/${organisationId}/managed-users`,
            undefined,
            { skipCache: true }
        )
    }

    async managedUsersOverview(
        organisationId?: number
    ): Promise<ApiResponse<ManagedUserOverview[]>> {
        return await this.call<ManagedUserOverview[]>(
            'GET',
            '/access/managed-users',
            undefined,
            {
                config: organisationId ? { params: { organisationId } } : undefined,
                skipCache: true,
            }
        )
    }

    async managedUser(
        organisationId: number,
        userId: number
    ): Promise<ApiResponse<ManagedUserDetail>> {
        return await this.call<ManagedUserDetail>(
            'GET',
            `/access/organisations/${organisationId}/managed-users/${userId}`,
            undefined,
            { skipCache: true }
        )
    }

    async userOptions(organisationId: number): Promise<ApiResponse<UserManagementOptions>> {
        return await this.call<UserManagementOptions>(
            'GET',
            `/access/organisations/${organisationId}/user-options`,
            undefined,
            { skipCache: true }
        )
    }

    async createManagedUser(
        organisationId: number,
        data: CreateManagedUser
    ): Promise<ApiResponse<ManagedUserDetail>> {
        return await this.call<ManagedUserDetail, CreateManagedUser>(
            'POST',
            `/access/organisations/${organisationId}/managed-users`,
            data
        )
    }

    async updateManagedUser(
        organisationId: number,
        userId: number,
        data: UpdateManagedUser
    ): Promise<ApiResponse<ManagedUserDetail>> {
        return await this.call<ManagedUserDetail, UpdateManagedUser>(
            'PUT',
            `/access/organisations/${organisationId}/managed-users/${userId}`,
            data
        )
    }

    async setUserStatus(
        organisationId: number,
        userId: number,
        isActive: boolean
    ): Promise<ApiResponse<ManagedUser>> {
        return await this.call<ManagedUser, { isActive: boolean }>(
            'PATCH',
            `/access/organisations/${organisationId}/managed-users/${userId}/status`,
            { isActive }
        )
    }
}

export default AccessApiService
