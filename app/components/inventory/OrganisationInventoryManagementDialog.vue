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
            <v-card-title class="d-flex align-center justify-space-between pa-4">
                <div>
                    <div class="text-h5">Manage organisation inventory</div>
                    <div class="text-caption text-medium-emphasis">
                        {{ title }} — quantities are maintained independently per location.
                    </div>
                </div>
                <v-btn icon="mdi-close" variant="text" @click="close" />
            </v-card-title>
            <v-divider />

            <v-card-text class="pa-5">
                <v-alert v-if="draft" type="info" variant="tonal" class="mb-4">
                    These opening balances will be recorded when the product is saved.
                </v-alert>

                <div class="text-h6 mb-2">Inventory by location</div>
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
                        <tr v-for="balance in displayedBalances" :key="balance.key">
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
                                    {{ formatLabel(balance.stockStatus) }}
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
                                        beginThresholdUpdate(
                                            balance.locationId,
                                            balance.lowStockThreshold
                                        )
                                    "
                                />
                                <v-btn
                                    v-else
                                    icon="mdi-delete"
                                    size="small"
                                    color="error"
                                    variant="text"
                                    @click="removeDraftBalance(balance.locationId)"
                                />
                            </td>
                        </tr>
                        <tr v-if="displayedBalances.length === 0">
                            <td colspan="8" class="text-center text-medium-emphasis py-6">
                                No inventory balances have been recorded.
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
                    <div class="text-subtitle-2 mb-3">Update location threshold</div>
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
                    <v-card-title>
                        {{ draft ? 'Add opening balance' : 'Record stock movement' }}
                    </v-card-title>
                    <v-card-text>
                        <v-row v-if="draft">
                            <v-col cols="12" md="4">
                                <v-autocomplete
                                    v-model="draftForm.locationId"
                                    :items="locationOptions"
                                    label="Location"
                                    variant="outlined"
                                    :error-messages="draftErrors.locationId"
                                />
                            </v-col>
                            <v-col cols="12" md="2">
                                <v-text-field
                                    model-value="0"
                                    label="Previous stock"
                                    variant="outlined"
                                    readonly
                                />
                            </v-col>
                            <v-col cols="12" md="3">
                                <v-text-field
                                    v-model.number="draftForm.onHand"
                                    label="Opening quantity"
                                    type="number"
                                    min="0"
                                    variant="outlined"
                                    :error-messages="draftErrors.onHand"
                                />
                            </v-col>
                            <v-col cols="12" md="3">
                                <v-text-field
                                    v-model.number="draftForm.lowStockThreshold"
                                    label="Low-stock threshold"
                                    type="number"
                                    min="0"
                                    variant="outlined"
                                    :error-messages="draftErrors.lowStockThreshold"
                                />
                            </v-col>
                            <v-col cols="12" md="9">
                                <v-text-field
                                    v-model="draftForm.reason"
                                    label="Reason"
                                    variant="outlined"
                                    :error-messages="draftErrors.reason"
                                />
                            </v-col>
                            <v-col cols="12" md="3" class="d-flex align-center justify-end">
                                <v-btn
                                    color="primary"
                                    prepend-icon="mdi-plus"
                                    @click="addDraftBalance"
                                >
                                    Add balance
                                </v-btn>
                            </v-col>
                        </v-row>

                        <form v-else @submit.prevent="submitMovement">
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
                                        label="Source location"
                                        variant="outlined"
                                        :error-messages="errors.locationId"
                                    />
                                </v-col>
                                <v-col v-if="isTransfer" cols="12" md="4">
                                    <v-autocomplete
                                        v-model="destinationLocationId"
                                        :items="destinationLocationOptions"
                                        label="Destination location"
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

                <template v-if="!draft">
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
                            <tr v-for="movement in snapshot.movements" :key="movement.id">
                                <td>{{ formatDate(movement.createdAt) }}</td>
                                <td>{{ movement.locationName }}</td>
                                <td>{{ formatLabel(movement.movementType) }}</td>
                                <td>{{ signedQuantity(movement.quantity) }}</td>
                                <td>{{ signedQuantity(movement.reservedDelta) }}</td>
                                <td>{{ movement.previousOnHand }}</td>
                                <td>{{ movement.newOnHand }}</td>
                                <td>{{ movement.previousReserved }}</td>
                                <td>{{ movement.newReserved }}</td>
                                <td>{{ movement.reason }}</td>
                            </tr>
                            <tr v-if="snapshot.movements.length === 0">
                                <td colspan="10" class="text-center text-medium-emphasis py-6">
                                    No inventory movements found.
                                </td>
                            </tr>
                        </tbody>
                    </v-table>
                </template>
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
import { computed, reactive, ref, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import {
    INVENTORY_MESSAGES,
    INVENTORY_MOVEMENT_OPTIONS,
    INVENTORY_MOVEMENT_TYPE,
    INVENTORY_STOCK_STATUS,
} from '~/constants/inventory.constants'
import { useInventory, type InventoryContext } from '~/composables/useInventory'
import {
    inventoryDraftBalanceSchema,
    inventoryMovementSchema,
    inventoryThresholdSchema,
    type InventoryMovementFormData,
} from '~/schemas/inventory.schema'
import type { InventoryDraftBalance, InventorySnapshot } from '~/types/inventory.types'

interface Props {
    modelValue: boolean
    entityId?: number
    organisationId: number
    title: string
    draft?: boolean
    draftBalances?: InventoryDraftBalance[]
    defaultLowStockThreshold?: number
}

interface DisplayBalance {
    key: string
    locationId: number
    locationName: string
    previousOnHand: number
    onHand: number
    reserved: number
    available: number
    lowStockThreshold: number
    stockStatus: string
}

const props = withDefaults(defineProps<Props>(), {
    entityId: 0,
    draft: false,
    draftBalances: () => [],
    defaultLowStockThreshold: 0,
})
const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'update:draftBalances': [value: InventoryDraftBalance[]]
    saved: []
}>()

const {
    snapshotFor,
    locationsFor,
    isLoading,
    isSaving,
    inventoryKey,
    ownerKey,
    fetchInventory,
    fetchOwnerLocations,
    recordMovement,
    updateThreshold,
} = useInventory()

const context = computed<InventoryContext>(() => ({
    entityId: props.entityId,
    organisationId: props.organisationId,
}))
const key = computed(() => inventoryKey(context.value))
const locationKey = computed(() => ownerKey(context.value))
const snapshot = computed<InventorySnapshot>(() => snapshotFor(key.value))
const loading = computed(() => isLoading(key.value))
const saving = computed(() => isSaving(key.value))
const locations = computed(() => locationsFor(locationKey.value))
const locationOptions = computed(() =>
    locations.value.map((location) => ({ title: location.name, value: location.id }))
)
const displayedBalances = computed<DisplayBalance[]>(() => {
    if (props.draft) {
        return props.draftBalances.map((balance) => ({
            key: `draft-${balance.locationId}`,
            locationId: balance.locationId,
            locationName:
                locations.value.find((location) => location.id === balance.locationId)?.name ??
                `Location #${balance.locationId}`,
            previousOnHand: 0,
            onHand: balance.onHand,
            reserved: 0,
            available: balance.onHand,
            lowStockThreshold: balance.lowStockThreshold,
            stockStatus: stockStatus(balance.onHand, balance.lowStockThreshold),
        }))
    }
    return snapshot.value.balances.map((balance) => ({
        key: String(balance.id),
        locationId: balance.locationId ?? 0,
        locationName: balance.locationName,
        previousOnHand: balance.onHand,
        onHand: balance.onHand,
        reserved: balance.reserved,
        available: balance.available,
        lowStockThreshold: balance.lowStockThreshold,
        stockStatus: balance.stockStatus,
    }))
})

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
    initialValues: {
        movementType: INVENTORY_MOVEMENT_TYPE.RESTOCK_RECEIVED,
        locationId: 0,
        destinationLocationId: undefined,
        quantity: 1,
        reason: '',
        notes: '',
    },
})
const [movementType] = defineField('movementType')
const [locationId] = defineField('locationId')
const [destinationLocationId] = defineField('destinationLocationId')
const [quantity] = defineField('quantity')
const [reason] = defineField('reason')
const [notes] = defineField('notes')

const draftForm = reactive<InventoryDraftBalance>({
    locationId: 0,
    onHand: 0,
    lowStockThreshold: props.defaultLowStockThreshold,
    reason: INVENTORY_MESSAGES.DRAFT_REASON,
})
const draftErrors = reactive<Record<keyof InventoryDraftBalance, string>>({
    locationId: '',
    onHand: '',
    lowStockThreshold: '',
    reason: '',
})
const thresholdLocationId = ref<number | null>(null)
const thresholdValue = ref(0)
const thresholdReason = ref('')
const thresholdError = ref('')

const submitMovement = handleSubmit(async (form) => {
    await recordMovement(context.value, form)
    resetMovementForm()
    emit('saved')
})

function addDraftBalance(): void {
    clearDraftErrors()
    const result = inventoryDraftBalanceSchema.safeParse(draftForm)
    if (!result.success) {
        for (const issue of result.error.issues) {
            const field = issue.path[0] as keyof InventoryDraftBalance
            draftErrors[field] = issue.message
        }
        return
    }
    if (props.draftBalances.some((balance) => balance.locationId === result.data.locationId)) {
        draftErrors.locationId = 'This location already has an opening balance'
        return
    }
    emit('update:draftBalances', [...props.draftBalances, result.data])
    Object.assign(draftForm, {
        locationId: 0,
        onHand: 0,
        lowStockThreshold: props.defaultLowStockThreshold,
        reason: INVENTORY_MESSAGES.DRAFT_REASON,
    })
}

function removeDraftBalance(locationIdToRemove: number): void {
    emit(
        'update:draftBalances',
        props.draftBalances.filter((balance) => balance.locationId !== locationIdToRemove)
    )
}

function beginThresholdUpdate(locationIdToUpdate: number, currentThreshold: number): void {
    thresholdLocationId.value = locationIdToUpdate
    thresholdValue.value = currentThreshold
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

function clearDraftErrors(): void {
    Object.keys(draftErrors).forEach((field) => {
        draftErrors[field as keyof InventoryDraftBalance] = ''
    })
}

function resetMovementForm(): void {
    resetForm({
        values: {
            movementType: INVENTORY_MOVEMENT_TYPE.RESTOCK_RECEIVED,
            locationId: 0,
            destinationLocationId: undefined,
            quantity: 1,
            reason: '',
            notes: '',
        },
    })
}

function stockStatus(available: number, threshold: number): string {
    if (available <= 0) return INVENTORY_STOCK_STATUS.OUT_OF_STOCK
    if (available <= threshold) return INVENTORY_STOCK_STATUS.LOW_STOCK
    return INVENTORY_STOCK_STATUS.IN_STOCK
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
    () => [props.modelValue, props.entityId, props.organisationId, props.draft] as const,
    async ([isOpen]) => {
        if (!isOpen) return
        resetMovementForm()
        cancelThresholdUpdate()
        if (props.draft) {
            await fetchOwnerLocations(context.value)
        } else if (props.entityId > 0) {
            await fetchInventory(context.value)
        }
    },
    { immediate: true }
)
</script>
