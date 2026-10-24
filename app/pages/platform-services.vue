<template>
    <v-container fluid>
        <div class="mb-4">
            <h1 class="text-h4">Platform Services</h1>
            <div class="text-body-2 text-medium-emphasis">
                Subscribe, upgrade, downgrade, or opt out of services for {{ organisationName }}.
            </div>
        </div>
        <v-card>
            <v-card-text>
                <v-row align="center">
                    <v-col cols="12" md="6">
                        <v-select
                            v-model="organisationId"
                            :items="organisationOptions"
                            item-title="name"
                            item-value="id"
                            label="Organisation"
                            hide-details
                        />
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-btn
                            color="primary"
                            prepend-icon="mdi-shield-star"
                            :disabled="!organisationId"
                            @click="dialogOpen = true"
                        >
                            Manage Platform Services
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
        <OrganisationPlatformServicesDialog
            v-if="organisationId"
            v-model="dialogOpen"
            :organisation-id="organisationId"
            :organisation-name="organisationName"
            :can-write="canWrite"
        />
    </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import OrganisationPlatformServicesDialog from '~/components/memberships/OrganisationPlatformServicesDialog.vue'
import { ORGANISATION_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS } from '~/components/memberships/membership.permissions'
import { useAccessStore } from '~/stores/access.store'

definePageMeta({
    middleware: ['auth', 'permission'],
    access: {
        permission: ORGANISATION_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS.READ,
        allowAnyOrganisation: true,
    },
})
const access = useAccessStore()
const dialogOpen = ref(false)
const organisationId = ref<number | null>(null)
const organisationOptions = computed(() =>
    access.organisations.filter(
        (item) =>
            item.id !== access.platformOrganisationId &&
            access.can(ORGANISATION_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS.READ, item.id)
    )
)
const organisationName = computed(
    () =>
        access.organisations.find((item) => item.id === organisationId.value)?.name ??
        'your organisation'
)
const canWrite = computed(
    () =>
        organisationId.value !== null &&
        access.can(ORGANISATION_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS.WRITE, organisationId.value)
)
onMounted(async () => {
    await access.ensureReady()
    const actingOrganisationId = access.actingOrganisationId
    organisationId.value = organisationOptions.value.some(
        (item) => item.id === actingOrganisationId
    )
        ? actingOrganisationId
        : (organisationOptions.value[0]?.id ?? null)
    dialogOpen.value = organisationId.value !== null
})
watch(organisationId, () => {
    dialogOpen.value = false
})
</script>
