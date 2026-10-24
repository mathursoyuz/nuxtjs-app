import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { existsSync, readFileSync } from 'node:fs'
import { registerHooks } from 'node:module'
import { createPinia, setActivePinia } from 'pinia'

const appRoot = new URL('../app/', import.meta.url)
registerHooks({
    resolve(specifier, context, next) {
        if (specifier.startsWith('~/'))
            return next(new URL(specifier.slice(2) + '.ts', appRoot).href, context)
        if (specifier.startsWith('.') && context.parentURL?.startsWith(appRoot.href)) {
            const file = new URL(specifier + '.ts', context.parentURL)
            if (existsSync(file)) return next(file.href, context)
        }
        return next(specifier, context)
    },
})

const { CachedApiClient } = await import('../app/services/api/CachedApiClient.ts')
const { CacheServiceImpl } = await import('../app/services/cache/CacheServiceImpl.ts')
const { useAccessStore } = await import('../app/stores/access.store.ts')
const { useAuthStore } = await import('../app/stores/auth.store.ts')
const { useSessionStore } = await import('../app/stores/session.store.ts')
const { useFilterStore } = await import('../app/stores/filter.store.ts')
const { useCustomerStore } = await import('../app/stores/customer.store.ts')

globalThis.defineNuxtRouteMiddleware = (middleware) => middleware
const { default: permissionMiddleware } = await import('../app/middleware/permission.ts')

const definitions = [
    { code: 'products.read', module: 'products', action: 'read', scope: 'platform' },
    { code: 'products.write', module: 'products', action: 'write', scope: 'platform' },
    { code: 'products.delete', module: 'products', action: 'delete', scope: 'platform' },
    {
        code: 'organisation-products.read',
        module: 'organisation-products',
        action: 'read',
        scope: 'organisation',
        allowAllOrganisations: true,
    },
    {
        code: 'organisation-products.write',
        module: 'organisation-products',
        action: 'write',
        scope: 'organisation',
    },
    {
        code: 'organisation-products.delete',
        module: 'organisation-products',
        action: 'delete',
        scope: 'organisation',
    },
    {
        code: 'users.read',
        module: 'users',
        action: 'read',
        scope: 'organisation',
        allowAllOrganisations: true,
    },
    { code: 'users.write', module: 'users', action: 'write', scope: 'organisation' },
].map((definition) => ({ name: definition.code, allowAllOrganisations: false, ...definition }))

let app

beforeEach(() => {
    setActivePinia(createPinia())
    app = {}
    globalThis.useNuxtApp = () => app
    globalThis.navigateTo = (path) => path
    globalThis.useRouter = () => ({
        currentRoute: { value: { path: '/login' } },
        push: async () => {},
    })
})

function fixture(role = 'PLATFORM_USER') {
    const contexts = {
        1: {
            organisationId: 1,
            organisationName: 'Platform',
            platformOrganisationId: 1,
            systemRole: role,
            bypassPermissions: role === 'PLATFORM_ADMIN',
            permissions: ['products.read', 'users.read'],
        },
        2: {
            organisationId: 2,
            organisationName: 'ABC',
            platformOrganisationId: 1,
            systemRole: role,
            bypassPermissions: ['PLATFORM_ADMIN', 'ORGANISATION_OWNER'].includes(role),
            permissions: ['organisation-products.read', 'users.read'],
        },
        3: {
            organisationId: 3,
            organisationName: 'XYZ',
            platformOrganisationId: 1,
            systemRole: role,
            bypassPermissions: role === 'PLATFORM_ADMIN',
            permissions: ['organisation-products.read', 'organisation-products.write'],
        },
    }
    const organisations = role.startsWith('PLATFORM_')
        ? [
              { id: 1, name: 'Platform' },
              { id: 2, name: 'ABC' },
              { id: 3, name: 'XYZ' },
          ]
        : role === 'CUSTOMER'
          ? []
          : [{ id: 2, name: 'ABC' }]
    const storage = new Map()
    const state = { role, contexts, organisations, storage }
    app.$contextStorage = {
        get: (key) => storage.get(key) ?? null,
        set: (key, value) => storage.set(key, value),
        remove: (key) => storage.delete(key),
        clear: () => storage.clear(),
        has: (key) => storage.has(key),
    }
    app.$apiClient = new CachedApiClient({ setAuthToken() {} }, new CacheServiceImpl())
    app.$accessApi = {
        organisations: async () => ({
            data: {
                platformOrganisationId: 1,
                systemRole: role,
                identity: {
                    id: 10,
                    email: 'user@winery.test',
                    firstName: 'Test',
                    lastName: 'User',
                    phoneNumber: '1234567890',
                    isActive: true,
                    systemRole: role,
                    systemOrganisationId: role.startsWith('PLATFORM_') ? 1 : 2,
                    role: { id: 1, name: role, displayName: role },
                },
                organisations,
                capabilities: {
                    canSwitchOrganisations: role.startsWith('PLATFORM_'),
                    canFilterOrganisations: role.startsWith('PLATFORM_'),
                },
                crossOrganisationPermissions: role.startsWith('PLATFORM_')
                    ? ['organisation-products.read', 'users.read']
                    : [],
                crossOrganisationOrganisationIds: {
                    'organisation-products.read': role.startsWith('PLATFORM_') ? [2, 3] : [],
                    'users.read': role.startsWith('PLATFORM_') ? [2, 3] : [],
                },
                organisationPermissionOrganisationIds: role.startsWith('PLATFORM_')
                    ? {
                          'organisation-products.read': [1, 2, 3],
                          'organisation-products.write': [3],
                          'organisation-products.delete': [],
                          'users.read': [1, 2, 3],
                          'users.write': [3],
                      }
                    : {},
                permissionDefinitions: definitions,
            },
        }),
        context: async (organisationId) => ({ data: structuredClone(contexts[organisationId]) }),
    }
    return state
}

test('permissions follow the acting organisation context', async () => {
    fixture()
    const access = useAccessStore()
    await access.ensureReady()
    assert.equal(access.actingOrganisationId, 1)
    assert.equal(access.can('products.read'), true)
    assert.equal(access.can('organisation-products.write'), false)

    const filters = useFilterStore()
    const customers = useCustomerStore()
    filters.setOrganisationId(2)
    customers.setCustomers([{ id: 100, organisationId: 2 }])

    await access.switchActingOrganisation(3)
    assert.equal(access.actingOrganisationId, 3)
    assert.equal(access.can('organisation-products.write'), true)
    assert.equal(access.can('products.write'), false)
    assert.equal(filters.organisationId, null)
    assert.deepEqual(customers.customers, [])
    await assert.rejects(access.switchActingOrganisation(99), /not available/)
})

test('explicit organisation targets use granted permissions without changing acting context', async () => {
    fixture()
    const access = useAccessStore()
    await access.ensureReady()

    assert.equal(access.actingOrganisationId, 1)
    assert.equal(access.can('organisation-products.read', 2), true)
    assert.equal(access.can('organisation-products.write', 3), true)
    assert.equal(access.can('organisation-products.write', 2), false)
    assert.equal(access.actingOrganisationId, 1)
})

test('restores the acting organisation saved in local storage after a hard reload', async () => {
    const state = fixture()
    const initialAccess = useAccessStore()
    await initialAccess.ensureReady()
    await initialAccess.switchActingOrganisation(3)
    assert.deepEqual([...state.storage.entries()], [['acting_organisation_id:10', 3]])

    // A fresh Pinia instance models a hard reload while the API-backed auth
    // session and browser local storage remain available.
    setActivePinia(createPinia())
    const reloadedAccess = useAccessStore()
    await reloadedAccess.ensureReady()

    assert.equal(reloadedAccess.actingOrganisationId, 3)
    assert.equal(reloadedAccess.isPlatformContext, false)
    assert.equal(reloadedAccess.can('organisation-products.write'), true)

    reloadedAccess.reset()
    assert.equal(state.storage.size, 0)
})

test('ignores and removes a locally stored organisation that is no longer accessible', async () => {
    const state = fixture()
    state.storage.set('acting_organisation_id:10', 99)

    const access = useAccessStore()
    await access.ensureReady()

    assert.equal(access.actingOrganisationId, 1)
    assert.equal(state.storage.size, 0)
})

test('organisation users and customers cannot switch organisations', async () => {
    for (const role of ['ORGANISATION_OWNER', 'ORGANISATION_TEAM_USER', 'CUSTOMER']) {
        setActivePinia(createPinia())
        fixture(role)
        const access = useAccessStore()
        await access.ensureReady()
        assert.equal(access.canSwitchOrganisations, false)
        await assert.rejects(access.switchActingOrganisation(3), /Only platform/)
    }
})

test('permission middleware reads the route access requirement', async () => {
    fixture()
    const allowed = await permissionMiddleware({
        params: {},
        meta: { access: { permission: 'products.read' } },
    })
    const denied = await permissionMiddleware({
        params: {},
        meta: { access: { permission: 'products.delete' } },
    })
    assert.equal(allowed, undefined)
    assert.equal(denied, '/unauthorized')
})

test('permission middleware authorizes an explicit route organisation independently of context', async () => {
    fixture()
    const allowed = await permissionMiddleware({
        params: { organisationId: '3' },
        meta: { access: { permission: 'organisation-products.write' } },
    })
    const denied = await permissionMiddleware({
        params: { organisationId: '2' },
        meta: { access: { permission: 'organisation-products.write' } },
    })

    assert.equal(allowed, undefined)
    assert.equal(denied, '/unauthorized')
})

test('target-selection pages remain available after switching organisation context', async () => {
    fixture()
    const access = useAccessStore()
    await access.ensureReady()
    await access.switchActingOrganisation(2)

    assert.equal(access.can('organisation-products.write'), false)
    assert.equal(access.can('organisation-products.write', 3), true)

    const allowed = await permissionMiddleware({
        params: {},
        meta: {
            access: {
                permission: 'organisation-products.write',
                allowAnyOrganisation: true,
            },
        },
    })
    assert.equal(allowed, undefined)
})

test('overlapping refresh and context switch always clear busy flags', async () => {
    const state = fixture()
    const access = useAccessStore()
    await access.ensureReady()

    let finishSwitch
    app.$accessApi.context = (organisationId) =>
        organisationId === 2
            ? new Promise((resolve) => {
                  finishSwitch = resolve
              })
            : Promise.resolve({ data: structuredClone(state.contexts[organisationId]) })

    const switching = access.switchActingOrganisation(2)
    await new Promise((resolve) => setImmediate(resolve))
    const refreshing = access.refresh()
    await refreshing
    finishSwitch({ data: structuredClone(state.contexts[2]) })
    await switching

    assert.equal(access.refreshing, false)
    assert.equal(access.switching, false)
    assert.equal(access.busy, false)
    assert.equal(access.actingOrganisationId, 1)
})

test('failed access bootstrap rolls back a new authentication session', async () => {
    fixture()
    app.$accessApi.organisations = async () => {
        throw new Error('Access unavailable')
    }
    const cleared = []
    const user = {
        id: 10,
        email: 'user@winery.test',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '1234567890',
        isActive: true,
    }
    app.$authService = {
        login: async () => ({ user, accessToken: 'new-token' }),
        register: async () => ({ user, accessToken: 'new-token' }),
        clearSession: (token) => {
            cleared.push(token)
            return true
        },
        logout: async () => {},
        restoreSession: async () => null,
        refreshUser: async () => user,
    }

    const auth = useAuthStore()
    const session = useSessionStore()
    await assert.rejects(session.login({ email: user.email, password: 'Password123!' }))
    assert.deepEqual(cleared, ['new-token'])
    assert.equal(auth.isAuthenticated, false)
    assert.equal(auth.token, null)
    assert.equal(auth.user, null)
})

test('permission actions and SPA route metadata use the current contract', () => {
    const authStore = readFileSync(new URL('../app/stores/auth.store.ts', import.meta.url), 'utf8')
    const accessStore = readFileSync(
        new URL('../app/stores/access.store.ts', import.meta.url),
        'utf8'
    )
    const sessionStore = readFileSync(
        new URL('../app/stores/session.store.ts', import.meta.url),
        'utf8'
    )
    const productPage = readFileSync(
        new URL('../app/pages/products/index.vue', import.meta.url),
        'utf8'
    )
    const topbar = readFileSync(
        new URL('../app/components/layouts/LayoutTopbar.vue', import.meta.url),
        'utf8'
    )
    const organisationDialog = readFileSync(
        new URL('../app/components/organisation-products/ViewOrganisationProductsDialog.vue', import.meta.url),
        'utf8'
    )

    assert.match(productPage, /access:\s*\{ permission: PRODUCT_PERMISSIONS\.READ \}/)
    assert.doesNotMatch(productPage, /PRODUCT_PERMISSIONS\.(CREATE|UPDATE)/)
    assert.doesNotMatch(topbar, /href:\s*['"`]/)
    assert.doesNotMatch(organisationDialog, /loadContext\(/)
    assert.match(organisationDialog, /access\.can\(ORGANISATION_PRODUCT_PERMISSIONS\.WRITE, props\.organisationId\)/)
    assert.doesNotMatch(authStore, /useAccessStore|access\.store/)
    assert.doesNotMatch(accessStore, /useAuthStore|auth\.store/)
    assert.match(sessionStore, /useAuthStore/)
    assert.match(sessionStore, /useAccessStore/)
})
