<template>
    <v-dialog
        :model-value="modelValue"
        max-width="900"
        scrollable
        persistent
        @update:model-value="emit('update:modelValue', $event)"
    >
        <v-card>
            <DialogsDialogHeader
                title="Platform opening inventory"
                scope="Platform"
                entity-label="Product"
                :entity-name="title"
                @close="close"
            />
            <v-divider />

            <v-card-text class="pa-5">
                <v-table density="comfortable" class="mb-5">
                    <thead>
                        <tr>
                            <th>Platform location</th>
                            <th>Opening quantity</th>
                            <th>Low-stock threshold</th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="balance in draftBalances" :key="balance.locationId">
                            <td>{{ locationName(balance.locationId) }}</td>
                            <td>{{ balance.onHand }}</td>
                            <td>{{ balance.lowStockThreshold }}</td>
                            <td class="text-right">
                                <v-btn
                                    icon="mdi-delete"
                                    size="small"
                                    color="error"
                                    variant="text"
                                    @click="removeBalance(balance.locationId)"
                                />
                            </td>
                        </tr>
                        <tr v-if="draftBalances.length === 0">
                            <td colspan="4" class="text-center text-medium-emphasis py-6">
                                No opening inventory has been added.
                            </td>
                        </tr>
                    </tbody>
                </v-table>

                <v-card variant="outlined">
                    <v-card-title>Add opening balance</v-card-title>
                    <v-card-text>
                        <v-row>
                            <v-col cols="12" md="4">
                                <v-autocomplete
                                    v-model="form.locationId"
                                    :items="availableLocations"
                                    label="Platform location"
                                    variant="outlined"
                                    :error-messages="errors.locationId"
                                />
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field
                                    v-model.number="form.onHand"
                                    label="Opening quantity"
                                    type="number"
                                    min="0"
                                    variant="outlined"
                                    :error-messages="errors.onHand"
                                />
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field
                                    v-model.number="form.lowStockThreshold"
                                    label="Low-stock threshold"
                                    type="number"
                                    min="0"
                                    variant="outlined"
                                    :error-messages="errors.lowStockThreshold"
                                />
                            </v-col>
                            <v-col cols="12" md="9">
                                <v-text-field
                                    v-model="form.reason"
                                    label="Reason"
                                    variant="outlined"
                                    :error-messages="errors.reason"
                                />
                            </v-col>
                            <v-col cols="12" md="3" class="d-flex align-center justify-end">
                                <v-btn color="primary" prepend-icon="mdi-plus" @click="addBalance">
                                    Add balance
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-card-text>

            <v-divider />
            <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn color="primary" @click="close">Done</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { INVENTORY_MESSAGES } from '~/constants/inventory.constants'
import { inventoryDraftBalanceSchema } from '~/schemas/inventory.schema'
import type { InventoryDraftBalance } from '~/types/inventory.types'

interface SelectOption {
    title: string
    value: number
}

interface Props {
    modelValue: boolean
    title: string
    locations: SelectOption[]
    draftBalances: InventoryDraftBalance[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'update:draftBalances': [value: InventoryDraftBalance[]]
}>()

const form = reactive<InventoryDraftBalance>(emptyForm())
const errors = reactive<Record<keyof InventoryDraftBalance, string>>({
    locationId: '',
    onHand: '',
    lowStockThreshold: '',
    reason: '',
})
const availableLocations = computed(() => {
    const used = new Set(props.draftBalances.map((balance) => balance.locationId))
    return props.locations.filter((location) => !used.has(location.value))
})

function emptyForm(): InventoryDraftBalance {
    return {
        locationId: 0,
        onHand: 0,
        lowStockThreshold: 0,
        reason: INVENTORY_MESSAGES.DRAFT_REASON,
    }
}

function locationName(locationId: number): string {
    return (
        props.locations.find((location) => location.value === locationId)?.title ?? `#${locationId}`
    )
}

function clearErrors(): void {
    Object.keys(errors).forEach((field) => {
        errors[field as keyof InventoryDraftBalance] = ''
    })
}

function addBalance(): void {
    clearErrors()
    const result = inventoryDraftBalanceSchema.safeParse(form)
    if (!result.success) {
        for (const issue of result.error.issues) {
            const field = issue.path[0] as keyof InventoryDraftBalance
            errors[field] = issue.message
        }
        return
    }
    if (props.draftBalances.some((balance) => balance.locationId === result.data.locationId)) {
        errors.locationId = 'This location already has an opening balance'
        return
    }
    emit('update:draftBalances', [...props.draftBalances, result.data])
    Object.assign(form, emptyForm())
}

function removeBalance(locationId: number): void {
    emit(
        'update:draftBalances',
        props.draftBalances.filter((balance) => balance.locationId !== locationId)
    )
}

function close(): void {
    emit('update:modelValue', false)
}

watch(
    () => props.modelValue,
    (isOpen) => {
        if (!isOpen) return
        Object.assign(form, emptyForm())
        clearErrors()
    },
    { immediate: true }
)
</script>
