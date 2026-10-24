<template>
    <v-dialog
        :model-value="modelValue"
        max-width="1200"
        scrollable
        persistent
        @update:model-value="emit('update:modelValue', $event)"
    >
        <v-overlay :model-value="loading" contained persistent class="align-center justify-center">
            <v-progress-circular indeterminate color="primary" size="48" />
        </v-overlay>
        <v-card>
            <DialogsDialogHeader
                title="Manage Platform Organisation inventory"
                scope="Platform"
                entity-label="Product"
                :entity-name="title"
                @close="close"
            />
            <v-divider />

            <v-card-text class="pa-5">
                <div class="text-h6 mb-2">Supply by platform location</div>
                <v-table density="comfortable" class="mb-5">
                    <thead>
                        <tr>
                            <th>Location</th>
                            <th>On hand</th>
                            <th>Reserved for procurement</th>
                            <th>Available</th>
                            <th>Threshold</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="balance in snapshot.balances" :key="balance.id">
                            <td>{{ balance.locationName }}</td>
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
                                    {{ formatLabel(balance.stockStatus) }}
                                </v-chip>
                            </td>
                            <td>
                                <v-btn
                                    icon="mdi-tune"
                                    size="small"
                                    variant="text"
                                    title="Update low-stock threshold"
                                    @click="
                                        beginThresholdUpdate(
                                            balance.locationId ?? 0,
                                            balance.lowStockThreshold
                                        )
                                    "
                                />
                            </td>
                        </tr>
                        <tr v-if="snapshot.balances.length === 0">
                            <td colspan="7" class="text-center text-medium-emphasis py-6">
                                No Platform Organisation inventory has been recorded.
                            </td>
                        </tr>
                    </tbody>
                </v-table>

                <v-alert
                    v-if="thresholdLocationId"
                    type="info"
                    variant="tonal"
                    class="mb-5"
                    closable
                    @click:close="cancelThresholdUpdate"
                >
                    <div class="text-subtitle-2 mb-3">Update platform-location threshold</div>
                    <v-row>
                        <v-col cols="12" md="3">
                            <v-text-field
                                v-model.number="thresholdValue"
                                label="Low-stock threshold"
                                type="number"
                                min="0"
                                variant="outlined"
                                density="compact"
                                hide-details
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model="thresholdReason"
                                label="Reason"
                                variant="outlined"
                                density="compact"
                                :error-messages="thresholdError"
                                hide-details="auto"
                            />
                        </v-col>
                        <v-col cols="12" md="3" class="d-flex align-center">
                            <v-btn color="primary" :loading="saving" @click="saveThreshold">
                                Update threshold
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-alert>

                <v-card variant="outlined" class="mb-5">
                    <v-card-title>Record platform stock movement</v-card-title>
                    <v-card-text>
                        <form @submit.prevent="submitMovement">
                            <v-row>
                                <v-col cols="12" md="4">
                                    <v-select
                                        v-model="movementType"
                                        :items="movementOptions"
                                        label="Stock movement type"
                                        variant="outlined"
                                        :error-messages="errors.movementType"
                                    />
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-autocomplete
                                        v-model="locationId"
                                        :items="locationOptions"
                                        label="Platform location"
                                        variant="outlined"
                                        :error-messages="errors.locationId"
                                    />
                                </v-col>
                                <v-col v-if="isTransfer" cols="12" md="4">
                                    <v-autocomplete
                                        v-model="destinationLocationId"
                                        :items="destinationLocationOptions"
                                        label="Destination platform location"
                                        variant="outlined"
                                        :error-messages="errors.destinationLocationId"
                                    />
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field
                                        v-model.number="quantity"
                                        :label="quantityLabel"
                                        type="number"
                                        min="0"
                                        variant="outlined"
                                        :error-messages="errors.quantity"
                                    />
                                </v-col>
                                <v-col cols="12" md="8">
                                    <v-text-field
                                        v-model="reason"
                                        label="Reason"
                                        variant="outlined"
                                        :error-messages="errors.reason"
                                    />
                                </v-col>
                                <v-col cols="12">
                                    <v-textarea
                                        v-model="notes"
                                        label="Notes (optional)"
                                        rows="2"
                                        variant="outlined"
                                        :error-messages="errors.notes"
                                    />
                                </v-col>
                                <v-col cols="12" class="d-flex justify-end">
                                    <v-btn color="primary" type="submit" :loading="saving">
                                        Record movement
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </form>
                    </v-card-text>
                </v-card>

                <div class="text-h6 mb-2">Platform Organisation inventory history</div>
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
                            <th>Reason</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="movement in snapshot.movements" :key="movement.id">
                            <td>{{ formatDate(movement.createdAt) }}</td>
                            <td>{{ movement.locationName }}</td>
                            <td>{{ formatLabel(movement.movementType) }}</td>
                            <td>{{ signedQuantity(movement.quantity) }}</td>
                            <td>{{ signedQuantity(movement.reservedDelta) }}</td>
                            <td>{{ movement.previousOnHand }}</td>
                            <td>{{ movement.newOnHand }}</td>
                            <td>{{ movement.reason }}</td>
                        </tr>
                        <tr v-if="snapshot.movements.length === 0">
                            <td colspan="8" class="text-center text-medium-emphasis py-6">
                                No Platform Organisation inventory movements found.
                            </td>
                        </tr>
                    </tbody>
                </v-table>
            </v-card-text>

            <v-divider />
            <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn variant="outlined" @click="close">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import {
    INVENTORY_MOVEMENT_OPTIONS,
    INVENTORY_MOVEMENT_TYPE,
    INVENTORY_STOCK_STATUS,
} from '~/constants/inventory.constants'
import { useInventory, type InventoryContext } from '~/composables/useInventory'
import {
    inventoryMovementSchema,
    inventoryThresholdSchema,
    type InventoryMovementFormData,
} from '~/schemas/inventory.schema'
import type { InventorySnapshot } from '~/types/inventory.types'

interface Props {
    modelValue: boolean
    productId: number
    productVariantId: number
    platformOrganisationId: number
    title: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; saved: [] }>()
const {
    snapshotFor,
    locationsFor,
    isLoading,
    isSaving,
    inventoryKey,
    ownerKey,
    fetchInventory,
    recordMovement,
    updateThreshold,
} = useInventory()

const context = computed<InventoryContext>(() => ({
    entityId: props.productVariantId,
    organisationId: props.platformOrganisationId,
    scope: 'platform',
    productId: props.productId,
}))
const key = computed(() => inventoryKey(context.value))
const snapshot = computed<InventorySnapshot>(() => snapshotFor(key.value))
const loading = computed(() => isLoading(key.value))
const saving = computed(() => isSaving(key.value))
const locations = computed(() => locationsFor(ownerKey(context.value)))
const locationOptions = computed(() =>
    locations.value.map((location) => ({ title: location.name, value: location.id }))
)
const movementOptions = computed(() =>
    INVENTORY_MOVEMENT_OPTIONS.filter(
        (option) =>
            option.value !== INVENTORY_MOVEMENT_TYPE.OPENING_BALANCE ||
            !snapshot.value.balances.some((balance) => balance.locationId === locationId.value)
    )
)
const isTransfer = computed(() => movementType.value === INVENTORY_MOVEMENT_TYPE.LOCATION_TRANSFER)
const destinationLocationOptions = computed(() =>
    locationOptions.value.filter((location) => location.value !== locationId.value)
)
const quantityLabel = computed(() =>
    movementType.value === INVENTORY_MOVEMENT_TYPE.STOCK_RECOUNT
        ? 'Counted on-hand quantity'
        : 'Quantity'
)

const { errors, handleSubmit, resetForm, defineField } = useForm<InventoryMovementFormData>({
    validationSchema: toTypedSchema(inventoryMovementSchema),
    initialValues: movementDefaults(),
})
const [movementType] = defineField('movementType')
const [locationId] = defineField('locationId')
const [destinationLocationId] = defineField('destinationLocationId')
const [quantity] = defineField('quantity')
const [reason] = defineField('reason')
const [notes] = defineField('notes')
const thresholdLocationId = ref<number | null>(null)
const thresholdValue = ref(0)
const thresholdReason = ref('')
const thresholdError = ref('')

const submitMovement = handleSubmit(async (form) => {
    await recordMovement(context.value, form)
    resetForm({ values: movementDefaults() })
    emit('saved')
})

function movementDefaults(): InventoryMovementFormData {
    return {
        movementType: INVENTORY_MOVEMENT_TYPE.RESTOCK_RECEIVED,
        locationId: 0,
        destinationLocationId: undefined,
        quantity: 1,
        reason: '',
        notes: '',
    }
}

function beginThresholdUpdate(location: number, threshold: number): void {
    thresholdLocationId.value = location
    thresholdValue.value = threshold
    thresholdReason.value = ''
    thresholdError.value = ''
}

async function saveThreshold(): Promise<void> {
    if (!thresholdLocationId.value) return
    const result = inventoryThresholdSchema.safeParse({
        locationId: thresholdLocationId.value,
        lowStockThreshold: thresholdValue.value,
        reason: thresholdReason.value,
    })
    if (!result.success) {
        thresholdError.value = result.error.issues[0]?.message ?? 'Enter a valid threshold reason'
        return
    }
    await updateThreshold(context.value, result.data)
    cancelThresholdUpdate()
    emit('saved')
}

function cancelThresholdUpdate(): void {
    thresholdLocationId.value = null
    thresholdReason.value = ''
    thresholdError.value = ''
}

function stockStatusColor(status: string): string {
    if (status === INVENTORY_STOCK_STATUS.IN_STOCK) return 'success'
    if (status === INVENTORY_STOCK_STATUS.LOW_STOCK) return 'warning'
    return 'error'
}

function formatLabel(value: string): string {
    return value.replaceAll('_', ' ').toLowerCase()
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value))
}

function signedQuantity(value: number): string {
    return value > 0 ? `+${value}` : String(value)
}

function close(): void {
    emit('update:modelValue', false)
}

watch(
    () =>
        [
            props.modelValue,
            props.productId,
            props.productVariantId,
            props.platformOrganisationId,
        ] as const,
    async ([isOpen]) => {
        if (!isOpen || props.productId < 1 || props.productVariantId < 1) return
        resetForm({ values: movementDefaults() })
        cancelThresholdUpdate()
        await fetchInventory(context.value)
    },
    { immediate: true }
)
</script>
