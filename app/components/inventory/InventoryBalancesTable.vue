<template>
    <v-table density="comfortable" class="mb-5">
        <thead>
            <tr>
                <th>Location</th>
                <th>Previous on hand</th>
                <th>On hand</th>
                <th>Reserved</th>
                <th>Available</th>
                <th>Threshold</th>
                <th>Status</th>
                <th v-if="!draft">Actions</th>
                <th v-else />
            </tr>
        </thead>
        <tbody>
            <tr v-for="balance in balances" :key="balance.key">
                <td>{{ balance.locationName }}</td>
                <td>{{ balance.previousOnHand }}</td>
                <td>{{ balance.onHand }}</td>
                <td>{{ balance.reserved }}</td>
                <td>{{ balance.available }}</td>
                <td>{{ balance.lowStockThreshold }}</td>
                <td>
                    <v-chip
                        :color="stockStatusColor(balance.stockStatus)"
                        size="small"
                        variant="tonal"
                    >
                        {{ formatInventoryLabel(balance.stockStatus) }}
                    </v-chip>
                </td>
                <td>
                    <v-btn
                        v-if="!draft"
                        icon="mdi-tune"
                        size="small"
                        variant="text"
                        title="Update low-stock threshold"
                        @click="
                            emit('thresholdUpdate', balance.locationId, balance.lowStockThreshold)
                        "
                    />
                    <v-btn
                        v-else
                        icon="mdi-delete"
                        size="small"
                        color="error"
                        variant="text"
                        @click="emit('removeDraftBalance', balance.locationId)"
                    />
                </td>
            </tr>
            <tr v-if="balances.length === 0">
                <td colspan="8" class="text-center text-medium-emphasis py-6">
                    No inventory balances have been recorded.
                </td>
            </tr>
        </tbody>
    </v-table>
</template>

<script setup lang="ts">
import { INVENTORY_STOCK_STATUS } from '~/constants/inventory.constants'
import { formatInventoryLabel } from '~/utils/inventory-display.util'
import type { InventoryDisplayBalance } from './inventory-display.types'

defineProps<{ balances: InventoryDisplayBalance[]; draft: boolean }>()
const emit = defineEmits<{
    thresholdUpdate: [locationId: number, currentThreshold: number]
    removeDraftBalance: [locationId: number]
}>()

const stockStatusColor = (status: string): string => {
    if (status === INVENTORY_STOCK_STATUS.IN_STOCK) return 'success'
    if (status === INVENTORY_STOCK_STATUS.LOW_STOCK) return 'warning'
    return 'error'
}
</script>
