<template>
    <v-container v-if="access.canSwitchOrganisations" class="switch-organisation-page py-6">
        <div class="d-flex flex-wrap justify-space-between align-start ga-4 mb-6">
            <div>
                <h1 class="text-h4 font-weight-bold">Switch Organisation</h1>
                <p class="text-body-2 text-medium-emphasis mt-1">
                    Select the organisation you want to work in.
                </p>
            </div>
            <v-btn
                v-if="platformOrganisation && !access.isPlatformContext"
                variant="outlined"
                prepend-icon="mdi-arrow-left"
                :disabled="switching || access.loading"
                @click="openOrganisation(platformOrganisation.id, true)"
            >
                Return to Platform
            </v-btn>
        </div>

        <v-form
            class="d-flex align-start ga-2 mb-6"
            @submit.prevent="search = (query ?? '').trim()"
        >
            <v-text-field
                v-model="query"
                placeholder="Search by organisation name or ID"
                aria-label="Search by organisation name or ID"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                hide-details
                clearable
                @click:clear="search = ''"
            />
            <v-btn type="submit" color="primary" height="40">Search</v-btn>
        </v-form>

        <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>

        <v-row v-if="filteredOrganisations.length">
            <v-col v-for="organisation in filteredOrganisations" :key="organisation.id" cols="12" sm="6" lg="4">
                <v-card variant="outlined" rounded="lg" class="h-100 organisation-card">
                    <v-card-text class="pa-6">
                        <div class="d-flex justify-space-between align-center mb-4">
                            <v-avatar rounded="lg" color="grey-lighten-4" size="42">
                                <v-icon icon="mdi-office-building-outline" color="grey-darken-3" />
                            </v-avatar>
                            <v-chip
                                v-if="organisation.id === access.actingOrganisationId"
                                color="primary"
                                size="small"
                            >
                                Current
                            </v-chip>
                        </div>
                        <h2 class="text-body-1 font-weight-bold text-break">{{ organisation.name }}</h2>
                        <p class="text-body-2 text-medium-emphasis mt-1 mb-6">
                            Organisation ID: {{ organisation.id }}
                        </p>
                        <v-btn
                            color="primary"
                            block
                            :disabled="switching || access.loading"
                            :loading="switching && opening === organisation.id"
                            @click="openOrganisation(organisation.id)"
                        >
                            Open Organisation
                        </v-btn>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-sheet v-else class="text-center pa-8 text-medium-emphasis" rounded="lg" border>
            {{
                search ? 'No organisations match your search.' : 'No organisation organisations are available.'
            }}
        </v-sheet>
    </v-container>
</template>

<script setup lang="ts">
import { PRODUCT_PERMISSIONS } from '~/components/products/products.permissions'
import { ORGANISATION_PRODUCT_PERMISSIONS } from '~/components/organisation-products/organisation-products.permissions'
import { USER_PERMISSIONS } from '~/components/access/users.permissions'
import { ROLE_PERMISSIONS } from '~/components/access/roles.permissions'

import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAccessStore } from '~/stores/access.store'

definePageMeta({
    middleware: ['auth', 'permission'],
    access: { capability: 'canSwitchOrganisations' },
})

const access = useAccessStore()
const route = useRoute()
const query = ref('')
const search = ref('')
const switching = ref(false)
const opening = ref<number | null>(null)
const error = ref('')
let mounted = true
onBeforeUnmount(() => {
    mounted = false
})

const platformOrganisation = computed(() =>
    access.organisations.find((organisation) => organisation.id === access.platformOrganisationId)
)
const filteredOrganisations = computed(() => {
    const term = search.value.toLowerCase()
    return access.organisations.filter(
        (organisation) =>
            organisation.id !== access.platformOrganisationId &&
            (!term || organisation.name.toLowerCase().includes(term) || String(organisation.id).includes(term))
    )
})

async function openOrganisation(organisationId: number, platform = false) {
    if (switching.value || access.busy || !access.canSwitchOrganisations) return
    switching.value = true
    opening.value = organisationId
    error.value = ''
    try {
        await access.switchActingOrganisation(organisationId)
        if (!mounted || access.actingOrganisationId !== organisationId) return
        const destination = route.query.returnTo
        const canReadOrganisationProducts = access.isPlatformContext
            ? access.canAcrossOrganisations(ORGANISATION_PRODUCT_PERMISSIONS.READ)
            : access.can(ORGANISATION_PRODUCT_PERMISSIONS.READ)
        if (destination === '/users' && access.can(USER_PERMISSIONS.READ)) {
            await navigateTo('/users')
        } else if (destination === '/access' && access.can(ROLE_PERMISSIONS.READ)) {
            await navigateTo('/access')
        } else if (destination === '/organisations/organisation-products' && canReadOrganisationProducts) {
            await navigateTo('/organisations/organisation-products')
        } else if (platform && access.can(PRODUCT_PERMISSIONS.READ)) {
            await navigateTo('/products')
        } else if (canReadOrganisationProducts) {
            await navigateTo('/organisations/organisation-products')
        } else if (access.can(USER_PERMISSIONS.READ)) {
            await navigateTo('/users')
        } else {
            await navigateTo('/dashboard')
        }
    } catch (cause) {
        error.value = cause instanceof Error ? cause.message : 'Unable to switch organisation.'
    } finally {
        switching.value = false
    }
}
</script>

<style scoped>
.switch-organisation-page {
    max-width: 1120px;
}

.organisation-card {
    border-color: rgba(var(--v-border-color), var(--v-border-opacity));
    box-shadow: 0 1px 3px rgb(0 0 0 / 6%);
}
</style>
