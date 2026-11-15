<template>
    <v-card variant="outlined">
        <v-card-title>Organisation products</v-card-title>
        <v-card-subtitle>
            Select sellable variants from the customer organisation’s inventory.
        </v-card-subtitle>
        <v-card-text class="pt-5">
            <v-select
                v-model="locationId"
                :items="locationOptions"
                label="Inventory location *"
                variant="outlined"
                :loading="loading"
                @update:model-value="changeLocation"
            />

            <v-alert v-if="!locationId" type="info" variant="tonal" class="mb-4">
                Select an inventory location to see available products.
            </v-alert>

            <v-data-table
                :headers="headers"
                :items="rows"
                :loading="loading"
                item-value="organisationProductVariantId"
            >
                <template #item.select="{ item }">
                    <v-checkbox
                        :model-value="isSelected(item.organisationProductVariantId)"
                        :disabled="item.available < 1"
                        hide-details
                        @update:model-value="toggle(item, !!$event)"
                    />
                </template>
                <template #item.unitPrice="{ item }">{{ money(item.unitPrice) }}</template>
                <template #item.available="{ item }">
                    <v-chip
                        :color="item.available > 0 ? 'success' : 'error'"
                        size="small"
                        variant="tonal"
                    >
                        {{ item.available }}
                    </v-chip>
                </template>
                <template #item.quantity="{ item }">
                    <v-text-field
                        v-if="isSelected(item.organisationProductVariantId)"
                        :model-value="lineFor(item.organisationProductVariantId)?.quantity ?? 1"
                        type="number"
                        min="1"
                        :max="item.available"
                        density="compact"
                        variant="outlined"
                        hide-details
                        style="max-width: 110px"
                        @update:model-value="setQuantity(item, Number($event))"
                    />
                    <span v-else>—</span>
                </template>
                <template #item.total="{ item }">
                    {{
                        isSelected(item.organisationProductVariantId)
                            ? money(
                                  item.unitPrice *
                                      (lineFor(item.organisationProductVariantId)?.quantity ?? 1)
                              )
                            : '—'
                    }}
                </template>
                <template #no-data>
                    <div class="pa-8 text-center text-medium-emphasis">
                        No active organisation products are available at this location.
                    </div>
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useToast } from '~/composables/useToast'
import type { OrganisationProduct } from '~/types/organisation-product.types'
import type { Location } from '~/types/location.types'
import type { CustomerOrderDraftLine } from '~/types/order.types'

const props = defineProps<{ organisationId: number }>()
const lines = defineModel<CustomerOrderDraftLine[]>({ required: true })
const { getCustomerOrderCatalog } = useOrders()
const { errorFromError } = useToast()

const locations = ref<Location[]>([])
const products = ref<OrganisationProduct[]>([])
const locationId = ref<number | null>(null)
const loading = ref(false)
let loadRevision = 0

const headers = [
    { title: 'Select', key: 'select', sortable: false },
    { title: 'Product', key: 'productName' },
    { title: 'SKU', key: 'sku' },
    { title: 'Unit price', key: 'unitPrice' },
    { title: 'Available', key: 'available' },
    { title: 'Quantity', key: 'quantity', sortable: false },
    { title: 'Total', key: 'total', sortable: false },
]

const locationOptions = computed(() =>
    locations.value
        .filter((location) => location.isActive)
        .map((location) => ({ title: location.name, value: location.id }))
)
const rows = computed<CustomerOrderDraftLine[]>(() => {
    if (!locationId.value) return []
    return products.value.flatMap((product) =>
        product.variants
            .filter((variant) => variant.isActive && !variant.isDeleted)
            .map((variant) => ({
                organisationProductVariantId: variant.id,
                inventoryLocationId: locationId.value as number,
                productName: product.name,
                sku: variant.sku,
                unitPrice: variant.price,
                available:
                    variant.inventory.find((balance) => balance.locationId === locationId.value)
                        ?.available ?? 0,
                quantity: 1,
            }))
    )
})

const money = (value: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

const lineFor = (variantId: number): CustomerOrderDraftLine | undefined => {
    return lines.value.find((line) => line.organisationProductVariantId === variantId)
}

const isSelected = (variantId: number): boolean => {
    return Boolean(lineFor(variantId))
}

const toggle = (row: CustomerOrderDraftLine, selected: boolean): void => {
    if (!selected) {
        lines.value = lines.value.filter(
            (line) => line.organisationProductVariantId !== row.organisationProductVariantId
        )
        return
    }
    if (!isSelected(row.organisationProductVariantId) && row.available > 0) {
        lines.value = [...lines.value, { ...row, quantity: 1 }]
    }
}

const setQuantity = (row: CustomerOrderDraftLine, value: number): void => {
    const quantity = Math.max(
        1,
        Math.min(Number.isFinite(value) ? Math.floor(value) : 1, row.available)
    )
    lines.value = lines.value.map((line) =>
        line.organisationProductVariantId === row.organisationProductVariantId
            ? { ...line, quantity }
            : line
    )
}

const changeLocation = (): void => {
    lines.value = []
}

const load = async (): Promise<void> => {
    const currentRevision = ++loadRevision
    loading.value = true
    locationId.value = null
    lines.value = []
    try {
        const response = await getCustomerOrderCatalog(props.organisationId)
        if (currentRevision !== loadRevision) return
        locations.value = response.data?.locations ?? []
        products.value = response.data?.products ?? []
        const activeLocations = locations.value.filter((location) => location.isActive)
        if (
            !locationId.value ||
            !activeLocations.some((location) => location.id === locationId.value)
        ) {
            locationId.value =
                activeLocations.length === 1 ? (activeLocations[0]?.id ?? null) : null
        }
    } catch (error) {
        if (currentRevision === loadRevision)
            errorFromError(error, 'Failed to load organisation products')
    } finally {
        if (currentRevision === loadRevision) loading.value = false
    }
}

watch(
    () => props.organisationId,
    () => void load(),
    { immediate: true }
)
</script>
