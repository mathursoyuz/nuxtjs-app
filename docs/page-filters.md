# Page filters

The default layout has a filter row at the top right of the header. The organisation
dropdown and sidebar Switch Organisation page use the same access store. Admins can
select all organisations or any available organisation. Platform users can select their
assigned organisations. Organisation owners, team members and customers cannot switch.

## Add a screen-specific filter

Place `PageFilters` inside the page's root element. Its controls appear beside
the global organisation dropdown and disappear when the page changes. Filter values
stay in the page, so the page owns how they affect its data. The Users screen
already uses this for its All / Active / Inactive filter.

```vue
<template>
    <v-container fluid>
        <PageFilters>
            <v-select
                v-model="status"
                :items="['All', 'Active', 'Inactive']"
                label="Status"
                variant="outlined"
                density="compact"
                hide-details
                style="width: 190px"
            />
        </PageFilters>
        <!-- Screen content -->
    </v-container>
</template>

<script setup lang="ts">
import PageFilters from '~/components/filters/PageFilters.vue'
const status = ref('All')
</script>
```

Use `v-if` on a filter, or on `PageFilters`, to show additional controls only to
users who have the relevant permission.

## Control the organisation dropdown per screen

It is enabled by default for both platform roles. Hide it on a particular page:

```ts
definePageMeta({ organisationFilter: false })
```

Or restrict that page's dropdown to admins:

```ts
definePageMeta({ organisationFilter: { roles: ['PLATFORM_ADMIN'] } })
```

Page settings can restrict switching further; they cannot enable it for
organisation users or customers. These settings affect the header dropdown.
The sidebar switcher remains available to platform roles.

## Load data after a organisation change

Organisation selection sets `access.loading` before changing context. Clear old rows
and close dialogs immediately; reload only when permissions have finished
loading. Ignore responses from an earlier request or organisation. Organisation products,
Users, and Roles & permissions already follow this pattern.

The Products catalogue remains platform-wide. Organisation products supports the
admin's All organisations overview. Users and Roles & permissions use the platform
context when All organisations is selected. Other modules can adopt the selected
context as their RBAC rollout continues; the filter area does not automatically
add organisation scoping to an API.
