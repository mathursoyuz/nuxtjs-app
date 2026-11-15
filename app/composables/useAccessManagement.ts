import type { AccessApiService } from '~/services/api/wrappers/access.api'

export const useAccessManagement = (): {
    roles: (organisationId: number) => ReturnType<AccessApiService['roles']>
    permissions: (organisationId: number) => ReturnType<AccessApiService['permissions']>
    saveRole: (
        organisationId: number,
        data: import('~/types/access.types').RoleInput,
        roleId?: number | undefined
    ) => ReturnType<AccessApiService['saveRole']>
    deleteRole: (
        organisationId: number,
        roleId: number
    ) => ReturnType<AccessApiService['deleteRole']>
    changeSystemRole: (
        userId: number,
        systemRole: import('~/types/access.types').SystemRole
    ) => ReturnType<AccessApiService['changeSystemRole']>
    managedUsers: (organisationId: number) => ReturnType<AccessApiService['managedUsers']>
    managedUsersOverview: (
        organisationId?: number | undefined
    ) => ReturnType<AccessApiService['managedUsersOverview']>
    managedUser: (
        organisationId: number,
        userId: number
    ) => ReturnType<AccessApiService['managedUser']>
    userOptions: (organisationId: number) => ReturnType<AccessApiService['userOptions']>
    createManagedUser: (
        organisationId: number,
        data: import('~/types/access.types').CreateManagedUser
    ) => ReturnType<AccessApiService['createManagedUser']>
    updateManagedUser: (
        organisationId: number,
        userId: number,
        data: import('~/types/access.types').UpdateManagedUser
    ) => ReturnType<AccessApiService['updateManagedUser']>
    setUserStatus: (
        organisationId: number,
        userId: number,
        isActive: boolean
    ) => ReturnType<AccessApiService['setUserStatus']>
} => {
    const api = useNuxtApp().$accessApi as AccessApiService

    return {
        roles: (
            ...args: Parameters<AccessApiService['roles']>
        ): ReturnType<AccessApiService['roles']> => api.roles(...args),
        permissions: (
            ...args: Parameters<AccessApiService['permissions']>
        ): ReturnType<AccessApiService['permissions']> => api.permissions(...args),
        saveRole: (
            ...args: Parameters<AccessApiService['saveRole']>
        ): ReturnType<AccessApiService['saveRole']> => api.saveRole(...args),
        deleteRole: (
            ...args: Parameters<AccessApiService['deleteRole']>
        ): ReturnType<AccessApiService['deleteRole']> => api.deleteRole(...args),
        changeSystemRole: (
            ...args: Parameters<AccessApiService['changeSystemRole']>
        ): ReturnType<AccessApiService['changeSystemRole']> => api.changeSystemRole(...args),
        managedUsers: (
            ...args: Parameters<AccessApiService['managedUsers']>
        ): ReturnType<AccessApiService['managedUsers']> => api.managedUsers(...args),
        managedUsersOverview: (
            ...args: Parameters<AccessApiService['managedUsersOverview']>
        ): ReturnType<AccessApiService['managedUsersOverview']> =>
            api.managedUsersOverview(...args),
        managedUser: (
            ...args: Parameters<AccessApiService['managedUser']>
        ): ReturnType<AccessApiService['managedUser']> => api.managedUser(...args),
        userOptions: (
            ...args: Parameters<AccessApiService['userOptions']>
        ): ReturnType<AccessApiService['userOptions']> => api.userOptions(...args),
        createManagedUser: (
            ...args: Parameters<AccessApiService['createManagedUser']>
        ): ReturnType<AccessApiService['createManagedUser']> => api.createManagedUser(...args),
        updateManagedUser: (
            ...args: Parameters<AccessApiService['updateManagedUser']>
        ): ReturnType<AccessApiService['updateManagedUser']> => api.updateManagedUser(...args),
        setUserStatus: (
            ...args: Parameters<AccessApiService['setUserStatus']>
        ): ReturnType<AccessApiService['setUserStatus']> => api.setUserStatus(...args),
    }
}
