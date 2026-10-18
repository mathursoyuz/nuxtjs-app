<template>
    <v-card variant="outlined">
        <v-card-title>Order items</v-card-title>
        <v-card-subtitle>
            Add or remove organisation products and adjust quantities by inventory location.
        </v-card-subtitle>
        <v-card-text class="pt-5">
            <v-alert v-if="loadError" type="error" variant="tonal" class="mb-4">
                {{ loadError }}
                <template #append>
                    <v-btn size="small" variant="text" @click="load">Retry</v-btn>
                </template>
            </v-alert>

            <v-select
                v-model="locationId"
                :items="locationOptions"
                label="Inventory location *"
                variant="outlined"
                :loading="loading"
            />

            <v-alert v-if="!loading && locationOptions.length === 0" type="warning" variant="tonal">
                This organisation has no active inventory locations.
            </v-alert>
            <v-alert v-else-if="!locationId" type="info" variant="tonal" class="mb-4">
                Select an inventory location to see available products.
            </v-alert>

            <v-data-table
                v-if="locationId"
                :headers="catalogHeaders"
                :items="rows"
                :loading="loading"
                item-value="key"
            >
                <template #item.select="{ item }">
                    <v-checkbox
                        :model-value="isSelected(item.key)"
                        :disabled="!isSelected(item.key) && item.available < 1"
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
                <template #no-data>
                    <div class="pa-8 text-center text-medium-emphasis">
                        No active organisation products are available at this location.
                    </div>
                </template>
            </v-data-table>

            <v-divider class="my-5" />
            <div class="text-subtitle-1 mb-3">Selected items</div>
            <v-data-table
                :headers="selectedHeaders"
                :items="selectedRows"
                :loading="loading"
                item-value="key"
                density="comfortable"
            >
                <template #item.locationName="{ item }">
                    {{ item.locationName }}
                </template>
                <template #item.unitPrice="{ item }">{{ money(item.unitPrice) }}</template>
                <template #item.quantity="{ item }">
                    <v-text-field
                        :model-value="item.quantity"
                        type="number"
                        min="1"
                        :max="item.available"
                        density="compact"
                        variant="outlined"
                        hide-details
                        style="max-width: 110px"
                        :error="item.quantity > item.available"
                        @update:model-value="setQuantity(item.key, Number($event))"
                    />
                </template>
                <template #item.total="{ item }">
                    {{ money(item.unitPrice * item.quantity) }}
                </template>
                <template #item.actions="{ item }">
                    <v-btn
                        icon="mdi-delete"
                        color="error"
                        variant="text"
                        size="small"
                        title="Remove item"
                        @click="remove(item.key)"
                    />
                </template>
                <template #no-data>
                    <div class="pa-6 text-center text-medium-emphasis">
                        Select at least one product for this order.
                    </div>
                </template>
            </v-data-table>

            <v-alert v-if="hasUnavailableSelection" type="warning" variant="tonal" class="mt-4">
                One or more selected quantities exceed currently available inventory. Reduce the
                quantity or remove the item before saving.
            </v-alert>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useNuxtApp } from '#app'
import { useToast } from '~/composables/useToast'
import type { OrganisationProduct } from '~/types/organisation-product.types'
import type { Location } from '~/types/location.types'
import type { CustomerOrderDraftLine } from '~/types/order.types'

interface EditorRow extends CustomerOrderDraftLine {
    key: string
    locationName: string
}

const props = defineProps<{
    organisationId: number
    currency: string
    reservedLines: CustomerOrderDraftLine[]
    reservationsActive: boolean
}>()
const lines = defineModel<CustomerOrderDraftLine[]>({ required: true })
const valid = defineModel<boolean>('valid', { default: false })
const nuxtApp = useNuxtApp()
const locationApi =
    nuxtApp.$locationApi as import('~/services/api/wrappers/location.api').LocationApiService
const organisationProductApi =
    nuxtApp.$organisationProductApi as import('~/services/api/wrappers/organisation-product.api').OrganisationProductApiService
const { errorFromError } = useToast()

const locations = ref<Location[]>([])
const products = ref<OrganisationProduct[]>([])
const locationId = ref<number | null>(null)
const loading = ref(false)
const loadError = ref('')
let loadRevision = 0

const catalogHeaders = [
    { title: 'Select', key: 'select', sortable: false },
    { title: 'Product', key: 'productName' },
    { title: 'SKU', key: 'sku' },
    { title: 'Unit price', key: 'unitPrice' },
    { title: 'Available', key: 'available' },
]
const selectedHeaders = [
    { title: 'Product', key: 'productName' },
    { title: 'SKU', key: 'sku' },
    { title: 'Location', key: 'locationName' },
    { title: 'Unit price', key: 'unitPrice' },
    { title: 'Available', key: 'available' },
    { title: 'Quantity', key: 'quantity', sortable: false },
    { title: 'Total', key: 'total', sortable: false },
    { title: '', key: 'actions', sortable: false },
]

const lineKey = (variantId: number, inventoryLocationId: number): string =>
    `${variantId}:${inventoryLocationId}`

const locationOptions = computed(() =>
    locations.value
        .filter((location) => location.isActive)
        .map((location) => ({ title: location.name, value: location.id }))
)
const locationNames = computed(
    () => new Map(locations.value.map((location) => [location.id, location.name]))
)
const reservedQuantities = computed(() => {
    if (!props.reservationsActive) return new Map<string, number>()
    return new Map(
        props.reservedLines.map((line) => [
            lineKey(line.organisationProductVariantId, line.inventoryLocationId),
            line.quantity,
        ])
    )
})
const allRows = computed<EditorRow[]>(() =>
    products.value.flatMap((product) =>
        product.variants
            .filter((variant) => variant.isActive && !variant.isDeleted)
            .flatMap((variant) =>
                locations.value
                    .filter((location) => location.isActive)
                    .map((location) => {
                        const key = lineKey(variant.id, location.id)
                        const available =
                            (variant.inventory.find((balance) => balance.locationId === location.id)
                                ?.available ?? 0) + (reservedQuantities.value.get(key) ?? 0)
                        return {
                            key,
                            organisationProductVariantId: variant.id,
                            inventoryLocationId: location.id,
                            locationName: location.name,
                            productName: product.name,
                            sku: variant.sku,
                            unitPrice: variant.price,
                            available,
                            quantity: 1,
                        }
                    })
            )
    )
)
const rows = computed(() =>
    allRows.value.filter((row) => row.inventoryLocationId === locationId.value)
)
const rowByKey = computed(() => new Map(allRows.value.map((row) => [row.key, row])))
const selectedRows = computed<EditorRow[]>(() =>
    lines.value.map((line) => {
        const key = lineKey(line.organisationProductVariantId, line.inventoryLocationId)
        const current = rowByKey.value.get(key)
        return {
            ...line,
            key,
            productName: current?.productName ?? line.productName,
            sku: current?.sku ?? line.sku,
            unitPrice: current?.unitPrice ?? line.unitPrice,
            available: current?.available ?? 0,
            locationName:
                current?.locationName ??
                locationNames.value.get(line.inventoryLocationId) ??
                `Location #${line.inventoryLocationId}`,
        }
    })
)
const hasUnavailableSelection = computed(() =>
    selectedRows.value.some((line) => line.available < 1 || line.quantity > line.available)
)

function money(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: props.currency,
    }).format(value)
}

function isSelected(key: string): boolean {
    return lines.value.some(
        (line) => lineKey(line.organisationProductVariantId, line.inventoryLocationId) === key
    )
}

function toggle(row: EditorRow, selected: boolean): void {
    if (!selected) {
        remove(row.key)
        return
    }
    if (!isSelected(row.key) && row.available > 0) {
        const { key: _key, locationName: _locationName, ...line } = row
        lines.value = [...lines.value, { ...line, quantity: 1 }]
    }
}

function remove(key: string): void {
    lines.value = lines.value.filter(
        (line) => lineKey(line.organisationProductVariantId, line.inventoryLocationId) !== key
    )
}

function setQuantity(key: string, value: number): void {
    const row = rowByKey.value.get(key)
    const upperLimit = Math.max(1, row?.available ?? 1)
    const quantity = Math.max(
        1,
        Math.min(Number.isFinite(value) ? Math.floor(value) : 1, upperLimit)
    )
    lines.value = lines.value.map((line) =>
        lineKey(line.organisationProductVariantId, line.inventoryLocationId) === key
            ? { ...line, quantity }
            : line
    )
}

function reconcileLines(): void {
    lines.value = lines.value.map((line) => {
        const current = rowByKey.value.get(
            lineKey(line.organisationProductVariantId, line.inventoryLocationId)
        )
        return current
            ? {
                  ...line,
                  productName: current.productName,
                  sku: current.sku,
                  unitPrice: current.unitPrice,
                  available: current.available,
              }
            : { ...line, available: 0 }
    })
}

async function load(): Promise<void> {
    const currentRevision = ++loadRevision
    loading.value = true
    loadError.value = ''
    try {
        const [locationResponse, productResponse] = await Promise.all([
            locationApi.getAllLocations(props.organisationId),
            organisationProductApi.getAllOrganisationProducts(props.organisationId, true),
        ])
        if (currentRevision !== loadRevision) return
        locations.value = locationResponse.data ?? []
        products.value = productResponse.data ?? []
        const currentLocationIsActive = locationOptions.value.some(
            (option) => option.value === locationId.value
        )
        if (!currentLocationIsActive) {
            locationId.value =
                props.reservedLines[0]?.inventoryLocationId ??
                locationOptions.value[0]?.value ??
                null
        }
        reconcileLines()
    } catch (error) {
        if (currentRevision !== loadRevision) return
        loadError.value = 'Failed to load current products and inventory.'
        errorFromError(error, loadError.value)
    } finally {
        if (currentRevision === loadRevision) loading.value = false
    }
}

watch(
    [() => lines.value, loading, loadError],
    () => {
        valid.value =
            !loading.value &&
            !loadError.value &&
            lines.value.length > 0 &&
            !hasUnavailableSelection.value
    },
    { deep: true, immediate: true }
)
watch(
    () => props.organisationId,
    () => void load(),
    { immediate: true }
)
</script>
