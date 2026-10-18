<template>
    <div class="organisation-switcher">
        <v-btn
            v-if="access.canSwitchOrganisations"
            :to="{ path: '/switch-organisation', query: { returnTo: route.path } }"
            :disabled="access.busy"
            block
            variant="outlined"
            prepend-icon="mdi-swap-horizontal"
            class="justify-start"
        >
            Switch Organisation
        </v-btn>
        <div class="text-caption text-medium-emphasis" :class="{ 'mt-3': access.canSwitchOrganisations }">
            {{ contextType }}
        </div>
        <div class="text-body-2 font-weight-medium text-break">{{ contextName }}</div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAccessStore } from '~/stores/access.store'

const route = useRoute()
const access = useAccessStore()
const contextType = computed(() => (access.isPlatformContext ? 'Platform' : 'Organisation'))
const contextName = computed(() => access.actingContext?.organisationName ?? 'No organisation selected')
</script>
