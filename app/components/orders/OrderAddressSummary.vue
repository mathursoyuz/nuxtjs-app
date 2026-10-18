<template>
    <div>
        <div class="font-weight-medium">{{ address.firstName }} {{ address.lastName }}</div>
        <div v-if="address.company">{{ address.company }}</div>
        <div>{{ address.address }}</div>
        <div>{{ address.city }}, {{ address.stateCode }} {{ address.postalCode }}</div>
        <div>{{ address.countryCode }}</div>
        <div class="text-medium-emphasis">{{ address.phone }} · {{ address.email }}</div>
    </div>
</template>

<script setup lang="ts">
import type { CustomerOrderAddress } from '~/types/order.types'

defineProps<{ address: CustomerOrderAddress }>()
</script>
