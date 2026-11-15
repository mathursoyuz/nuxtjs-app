<template>
    <div class="text-h6 mb-2">Movement history</div>
    <v-table density="compact">
        <thead>
            <tr>
                <th>Date</th>
                <th>Location</th>
                <th>Type</th>
                <th>On-hand change</th>
                <th>Reserved change</th>
                <th>Previous</th>
                <th>New</th>
                <th>Previous reserved</th>
                <th>New reserved</th>
                <th>Reason</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="movement in movements" :key="movement.id">
                <td>{{ formatInventoryDate(movement.createdAt) }}</td>
                <td>{{ movement.locationName }}</td>
                <td>{{ formatInventoryLabel(movement.movementType) }}</td>
                <td>{{ signedInventoryQuantity(movement.quantity) }}</td>
                <td>{{ signedInventoryQuantity(movement.reservedDelta) }}</td>
                <td>{{ movement.previousOnHand }}</td>
                <td>{{ movement.newOnHand }}</td>
                <td>{{ movement.previousReserved }}</td>
                <td>{{ movement.newReserved }}</td>
                <td>{{ movement.reason }}</td>
            </tr>
            <tr v-if="movements.length === 0">
                <td colspan="10" class="text-center text-medium-emphasis py-6">
                    No inventory movements found.
                </td>
            </tr>
        </tbody>
    </v-table>
</template>

<script setup lang="ts">
import type { InventoryMovement } from '~/types/inventory.types'
import {
    formatInventoryDate,
    formatInventoryLabel,
    signedInventoryQuantity,
} from '~/utils/inventory-display.util'

defineProps<{ movements: InventoryMovement[] }>()
</script>
