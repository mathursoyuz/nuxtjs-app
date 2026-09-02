<template>
    <v-card variant="outlined" class="mb-4">
        <v-card-title class="d-flex align-center justify-space-between">
            <div class="d-flex align-center ga-2">
                <span>Client variant {{ index + 1 }}</span>
                <v-chip size="small" :color="variant.id ? 'info' : 'success'" variant="tonal">
                    {{ variant.id ? 'Existing' : 'New' }}
                </v-chip>
            </div>
            <v-btn
                v-if="canRemove"
                icon="mdi-delete"
                color="error"
                variant="text"
                size="small"
                title="Remove variant"
                @click="emit('remove')"
            />
        </v-card-title>

        <v-card-text>
            <v-row>
                <v-col cols="12" md="6">
                    <v-autocomplete
                        :model-value="variant.sourceProductVariantId || null"
                        :items="sourceVariants"
                        label="Platform product variant"
                        variant="outlined"
                        density="compact"
                        :disabled="Boolean(variant.id)"
                        :error-messages="errorFor('sourceProductVariantId')"
                        @update:model-value="selectSource"
                    />
                </v-col>
                <v-col cols="12" md="6">
                    <v-text-field
                        :model-value="variant.sku"
                        label="Client SKU"
                        variant="outlined"
                        density="compact"
                        :error-messages="errorFor('sku')"
                        @update:model-value="updateVariant({ sku: toStringValue($event) })"
                    />
                </v-col>
                <v-col cols="12" md="4">
                    <v-text-field
                        :model-value="variant.price"
                        label="Client selling price"
                        type="number"
                        min="0"
                        prefix="$"
                        variant="outlined"
                        density="compact"
                        :error-messages="errorFor('price')"
                        @update:model-value="updateVariant({ price: toNumber($event) })"
                    />
                </v-col>
                <v-col cols="12" md="4">
                    <v-text-field
                        :model-value="variant.cog"
                        label="COG"
                        type="number"
                        min="0"
                        prefix="$"
                        variant="outlined"
                        density="compact"
                        :error-messages="errorFor('cog')"
                        @update:model-value="updateVariant({ cog: toNumber($event) })"
                    />
                </v-col>
                <v-col cols="12" md="4">
                    <v-text-field
                        :model-value="variant.lowStockThreshold"
                        label="Default low-stock threshold"
                        type="number"
                        min="0"
                        variant="outlined"
                        density="compact"
                        :error-messages="errorFor('lowStockThreshold')"
                        @update:model-value="
                            updateVariant({ lowStockThreshold: toInteger($event) })
                        "
                    />
                </v-col>
                <v-col cols="12" md="4">
                    <v-switch
                        :model-value="variant.stockManaged"
                        label="Track stock"
                        color="primary"
                        hide-details
                        @update:model-value="setStockManaged(Boolean($event))"
                    />
                </v-col>
                <v-col cols="12" md="4">
                    <v-switch
                        :model-value="variant.isActive"
                        label="Active variant"
                        color="primary"
                        hide-details
                        @update:model-value="updateVariant({ isActive: Boolean($event) })"
                    />
                </v-col>
                <v-col cols="12" md="4" class="d-flex align-center">
                    <v-btn
                        v-if="variant.stockManaged"
                        block
                        color="primary"
                        variant="tonal"
                        prepend-icon="mdi-warehouse"
                        :disabled="!variant.sourceProductVariantId"
                        @click="emit('manage-inventory')"
                    >
                        {{
                            variant.id
                                ? 'Manage inventory'
                                : `Opening inventory (${inventoryCount})`
                        }}
                    </v-btn>
                </v-col>
                <v-col v-if="errorFor('inventory')" cols="12">
                    <v-alert type="error" variant="tonal" density="compact">
                        {{ errorFor('inventory') }}
                    </v-alert>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import type { ClientProductVariantFormData } from '~/schemas/client-product.schema'

interface SourceVariantOption {
    title: string
    value: number
}

type ClientVariantErrorField =
    | 'sourceProductVariantId'
    | 'sku'
    | 'price'
    | 'cog'
    | 'lowStockThreshold'
    | 'inventory'

interface Props {
    index: number
    canRemove: boolean
    sourceVariants: SourceVariantOption[]
    inventoryCount?: number
    errors?: Record<string, string | undefined>
}

const props = withDefaults(defineProps<Props>(), {
    inventoryCount: 0,
    errors: () => ({}),
})
const variant = defineModel<ClientProductVariantFormData>({ required: true })
const emit = defineEmits<{
    'select-source': [sourceVariantId: number]
    'manage-inventory': []
    remove: []
}>()

const updateVariant = (patch: Partial<ClientProductVariantFormData>): void => {
    variant.value = { ...variant.value, ...patch }
}

const selectSource = (value: unknown): void => {
    const sourceVariantId = toInteger(value)
    updateVariant({ sourceProductVariantId: sourceVariantId })
    emit('select-source', sourceVariantId)
}

const setStockManaged = (stockManaged: boolean): void => {
    updateVariant({
        stockManaged,
        ...(!stockManaged ? { inventory: [] } : {}),
    })
}

const errorFor = (field: ClientVariantErrorField): string | undefined => {
    return (
        props.errors[`variants[${props.index}].${field}`] ??
        props.errors[`variants.${props.index}.${field}`]
    )
}

const toStringValue = (value: unknown): string => String(value ?? '')

const toNumber = (value: unknown): number => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
}

const toInteger = (value: unknown): number => Math.max(0, Math.trunc(toNumber(value)))
</script>
