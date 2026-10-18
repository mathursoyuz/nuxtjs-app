import { SYSTEM_ROLE, PERMISSION_SCOPE } from '~/constants/access.constants'
import type { AccountIdentity } from './account-identity.types'
export type SystemRole = (typeof SYSTEM_ROLE)[keyof typeof SYSTEM_ROLE]
export interface AccessIdentity extends AccountIdentity {
    systemRole: SystemRole
    systemOrganisationId: number
    role: {
        id: number
        name: string
        displayName: string
    }
}
export interface PermissionDefinition {
    code: string
    module: string
    action: string
    scope: (typeof PERMISSION_SCOPE)[keyof typeof PERMISSION_SCOPE]
    name: string
    allowAllOrganisations: boolean
}
export interface AccessCapabilities {
    canSwitchOrganisations: boolean
    canFilterOrganisations: boolean
}
export interface AccessSnapshot {
    platformOrganisationId: number
    systemRole: SystemRole
    identity: AccessIdentity
    organisations: AccessOrganisation[]
    capabilities: AccessCapabilities
    crossOrganisationPermissions: string[]
    crossOrganisationOrganisationIds: Record<string, number[]>
    organisationPermissionOrganisationIds: Record<string, number[]>
    permissionDefinitions: PermissionDefinition[]
}
export const SYSTEM_ROLE_LABELS: Record<SystemRole, string> = {
    PLATFORM_ADMIN: 'Platform Admin',
    PLATFORM_USER: 'Platform User',
    ORGANISATION_OWNER: 'Organisation Owner',
    ORGANISATION_TEAM_USER: 'Organisation Team User',
    CUSTOMER: 'Customer',
}
export interface AccessOrganisation {
    id: number
    name: string
}
export interface AccessContext {
    organisationId: number
    organisationName: string
    platformOrganisationId: number
    systemRole: SystemRole
    bypassPermissions: boolean
    permissions: string[]
}

export type AccessCapability = keyof AccessCapabilities

export type AccessRequirement =
    | {
          permission: string
          allowCrossOrganisation?: boolean
          allowCurrentContext?: boolean
          allowAnyOrganisation?: boolean
      }
    | { allPermissions: readonly string[] }
    | { anyPermissions: readonly string[]; allowCrossOrganisation?: boolean }
    | { capability: AccessCapability }
export interface AccessRole {
    id: number
    organisationId: number
    name: string
    code: string
    isSystem: boolean
    isActive: boolean
    permissions: string[]
}
export interface RoleInput {
    name: string
    code: string
    isActive: boolean
    permissions: string[]
}
export interface ManagedUser {
    id: number
    email: string
    firstName: string
    lastName: string
    phoneNumber: string
    isActive: boolean
    systemRole: SystemRole
    systemOrganisationId: number
    roleIds: number[]
    canEdit: boolean
    canChangeStatus: boolean
}
export interface ManagedUserOverview extends ManagedUser {
    organisationId: number
}
export interface UserOrganisationAssignment {
    organisationId: number
    roleIds: number[]
    isActive: boolean
}
export interface ManagedUserDetail extends ManagedUser {
    organisationAssignments: UserOrganisationAssignment[]
    assignmentActive: boolean
}
export interface UserManagementOptions {
    systemRoles: SystemRole[]
    roles: AccessRole[]
    canAssignRoles: boolean
    canAssignOrganisations: boolean
    organisations: (AccessOrganisation & { roles: AccessRole[] })[]
}
export interface UpdateManagedUser {
    email: string
    firstName: string
    lastName: string
    phoneNumber: string
    password?: string
    confirmPassword?: string
    roleIds?: number[]
    organisationAssignments?: UserOrganisationAssignment[]
    assignmentActive?: boolean
}

declare module '#app' {
    interface PageMeta {
        access?: AccessRequirement
    }
}

declare module 'vue-router' {
    interface RouteMeta {
        access?: AccessRequirement
    }
}
export interface CreateManagedUser extends UpdateManagedUser {
    password: string
    confirmPassword: string
    systemRole: SystemRole
}
export interface SourceProduct {
    id: number
    name: string
    slug: string
    description: string | null
    variants: {
        id: number
        sku: string
        price: number
        stockManaged: boolean
        color: string
        size: string
        attributes: Record<string, string>
        isActive: boolean
        isDeleted: boolean
    }[]
}
