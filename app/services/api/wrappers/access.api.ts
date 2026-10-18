import type { CachedApiClient } from '../CachedApiClient'
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

/**
 * Access API wrapper service
 */
export class AccessApiService {
    constructor(private readonly cachedApi: CachedApiClient) {}

    organisations() {
        return this.cachedApi.get<AccessSnapshot>(
            '/access/organisations',
            undefined,
            undefined,
            undefined,
            true
        )
    }

    context(organisationId: number) {
        return this.cachedApi.get<AccessContext>(
            `/access/organisations/${organisationId}/context`,
            undefined,
            undefined,
            undefined,
            true
        )
    }

    roles(organisationId: number) {
        return this.cachedApi.get<AccessRole[]>(
            `/access/organisations/${organisationId}/roles`,
            undefined,
            undefined,
            undefined,
            true
        )
    }

    permissions(organisationId: number) {
        return this.cachedApi.get<{ code: string; name: string }[]>(
            `/access/organisations/${organisationId}/permissions`,
            undefined,
            undefined,
            undefined,
            true
        )
    }

    saveRole(organisationId: number, data: RoleInput, roleId?: number) {
        return roleId
            ? this.cachedApi.put<AccessRole>(`/access/organisations/${organisationId}/roles/${roleId}`, data)
            : this.cachedApi.post<AccessRole>(`/access/organisations/${organisationId}/roles`, data)
    }

    deleteRole(organisationId: number, roleId: number) {
        return this.cachedApi.delete(`/access/organisations/${organisationId}/roles/${roleId}`)
    }

    changeSystemRole(userId: number, systemRole: SystemRole) {
        return this.cachedApi.put(`/access/users/${userId}/system-role`, { systemRole })
    }

    managedUsers(organisationId: number) {
        return this.cachedApi.get<ManagedUser[]>(
            `/access/organisations/${organisationId}/managed-users`,
            undefined,
            undefined,
            undefined,
            true
        )
    }

    managedUsersOverview(organisationId?: number) {
        return this.cachedApi.get<ManagedUserOverview[]>(
            '/access/managed-users',
            organisationId ? { params: { organisationId } } : undefined,
            undefined,
            undefined,
            true
        )
    }

    managedUser(organisationId: number, userId: number) {
        return this.cachedApi.get<ManagedUserDetail>(
            `/access/organisations/${organisationId}/managed-users/${userId}`,
            undefined,
            undefined,
            undefined,
            true
        )
    }

    userOptions(organisationId: number) {
        return this.cachedApi.get<UserManagementOptions>(
            `/access/organisations/${organisationId}/user-options`,
            undefined,
            undefined,
            undefined,
            true
        )
    }

    createManagedUser(organisationId: number, data: CreateManagedUser) {
        return this.cachedApi.post<ManagedUserDetail>(
            `/access/organisations/${organisationId}/managed-users`,
            data
        )
    }

    updateManagedUser(organisationId: number, userId: number, data: UpdateManagedUser) {
        return this.cachedApi.put<ManagedUserDetail>(
            `/access/organisations/${organisationId}/managed-users/${userId}`,
            data
        )
    }

    setUserStatus(organisationId: number, userId: number, isActive: boolean) {
        return this.cachedApi.patch<ManagedUser>(
            `/access/organisations/${organisationId}/managed-users/${userId}/status`,
            { isActive }
        )
    }
}
