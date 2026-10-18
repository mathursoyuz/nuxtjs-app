export interface OrganisationFilterOptions {
    permission: string
    allOrganisationsLabel?: string
    includePlatform?: boolean
}

declare module '#app' {
    interface PageMeta {
        organisationFilter?: false | OrganisationFilterOptions
    }
}

declare module 'vue-router' {
    interface RouteMeta {
        organisationFilter?: false | OrganisationFilterOptions
    }
}
