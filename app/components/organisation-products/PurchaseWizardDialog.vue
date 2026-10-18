<template>
    <v-dialog
        :model-value="modelValue"
        max-width="1300"
        scrollable
        persistent
        @update:model-value="emit('update:modelValue', $event)"
    >
        <v-card>
            <v-card-title class="d-flex align-center justify-space-between pa-4">
                <div>
                    <div class="text-h5">Procure platform products</div>
                    <div class="text-caption text-medium-emphasis">
                        Purchase platform variants into this organisation's location inventory.
                    </div>
                </div>
                <v-btn icon="mdi-close" variant="text" @click="close" />
            </v-card-title>

            <v-divider />

            <v-tabs v-model="tab" class="px-4">
                <v-tab value="purchase">New procurement</v-tab>
                <v-tab value="pending">
                    Pending orders
                    <v-badge
                        v-if="pendingOrders.length"
                        :content="pendingOrders.length"
                        color="error"
                        inline
                        class="ml-2"
                    />
                </v-tab>
            </v-tabs>

            <v-card-text class="pa-5">
                <v-window v-model="tab">
                    <v-window-item value="purchase">
                        <v-row>
                            <v-col cols="12" md="8">
                                <v-select
                                    v-model="destinationLocationId"
                                    :items="locationOptions"
                                    label="Destination organisation location"
                                    variant="outlined"
                                    :loading="loading"
                                    :disabled="processing"
                                />
                            </v-col>
                            <v-col
                                v-if="canUseInternalProcurement"
                                cols="12"
                                md="4"
                                class="d-flex align-center"
                            >
                                <v-switch
                                    v-model="isInternal"
                                    label="Internal/free procurement"
                                    color="primary"
                                    hint="Allowed only for the configured platform organisation"
                                    persistent-hint
                                />
                            </v-col>
                        </v-row>

                        <v-alert
                            v-if="!loading && !isInternal && !activeCreditCard"
                            type="warning"
                            variant="tonal"
                            class="mb-4"
                        >
                            This organisation needs an active payment card before procurement can be
                            charged.
                        </v-alert>

                        <v-alert
                            v-if="!loading && locationOptions.length === 0"
                            type="warning"
                            variant="tonal"
                            class="mb-4"
                        >
                            Add an active location for this organisation before creating a procurement
                            order.
                        </v-alert>

                        <v-alert
                            v-if="!loading && variantRows.length > 0 && !hasPurchasableVariants"
                            type="warning"
                            variant="tonal"
                            class="mb-4"
                        >
                            Platform inventory is out of stock. Add inventory under the Platform
                            Organisation's organisation products before procuring.
                        </v-alert>

                        <div class="d-flex justify-end mb-3">
                            <v-btn
                                prepend-icon="mdi-refresh"
                                variant="tonal"
                                :loading="catalogLoading"
                                :disabled="processing"
                                @click="loadCatalog"
                            >
                                Refresh availability
                            </v-btn>
                        </div>

                        <v-data-table
                            :headers="productHeaders"
                            :items="variantRows"
                            :loading="loading || catalogLoading"
                            item-value="productVariantId"
                            density="comfortable"
                        >
                            <template #item.select="{ item }">
                                <v-checkbox
                                    :model-value="selectedVariantIds.has(item.productVariantId)"
                                    hide-details
                                    :disabled="
                                        !selectedVariantIds.has(item.productVariantId) &&
                                        !isPurchasable(item)
                                    "
                                    @update:model-value="
                                        toggleVariant(item.productVariantId, Boolean($event))
                                    "
                                />
                            </template>
                            <template #item.price="{ item }">{{ money(item.price) }}</template>
                            <template #item.availableQty="{ item }">
                                <v-chip :color="availabilityColor(item)" size="small">
                                    {{ availabilityLabel(item) }}
                                </v-chip>
                            </template>
                            <template #item.quantity="{ item }">
                                <v-text-field
                                    v-if="selectedVariantIds.has(item.productVariantId)"
                                    :model-value="quantities[item.productVariantId] ?? 1"
                                    type="number"
                                    min="1"
                                    :max="item.availableQty ?? undefined"
                                    density="compact"
                                    variant="outlined"
                                    hide-details
                                    style="max-width: 110px"
                                    @update:model-value="setQuantity(item, $event)"
                                />
                                <span v-else>—</span>
                            </template>
                            <template #item.total="{ item }">
                                {{
                                    selectedVariantIds.has(item.productVariantId)
                                        ? money(
                                              item.price * (quantities[item.productVariantId] ?? 1)
                                          )
                                        : '—'
                                }}
                            </template>
                        </v-data-table>

                        <v-card variant="outlined" class="mt-4">
                            <v-card-text
                                class="d-flex align-center justify-space-between flex-wrap ga-3"
                            >
                                <div>
                                    <div class="text-caption text-medium-emphasis">
                                        Selected quantity
                                    </div>
                                    <div class="text-h6">{{ selectedQuantity }}</div>
                                </div>
                                <div class="text-right">
                                    <div class="text-caption text-medium-emphasis">Order total</div>
                                    <div class="text-h5 text-primary">{{ money(orderTotal) }}</div>
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-window-item>

                    <v-window-item value="pending">
                        <div class="d-flex justify-end mb-3">
                            <v-btn
                                prepend-icon="mdi-refresh"
                                variant="tonal"
                                :loading="loadingOrders"
                                @click="loadOrders"
                            >
                                Refresh
                            </v-btn>
                        </div>
                        <v-data-table
                            :headers="pendingHeaders"
                            :items="pendingOrders"
                            :loading="loadingOrders"
                            item-value="id"
                        >
                            <template #item.orderNumber="{ item }">
                                #{{ item.orderNumber }}
                            </template>
                            <template #item.parties="{ item }">
                                <div class="d-flex align-center ga-2">
                                    <span>
                                        {{
                                            item.sellerOrganisation?.name || 'Platform Organisation'
                                        }}
                                    </span>
                                    <v-icon icon="tabler-arrow-right" size="16" />
                                    <span>
                                        {{
                                            item.buyerOrganisation?.name ||
                                            'Organisation #' + item.organisationId
                                        }}
                                    </span>
                                </div>
                            </template>
                            <template #item.status="{ item }">
                                <v-chip :color="statusColor(item.status)" size="small">
                                    {{ formatStatus(item.status) }}
                                </v-chip>
                            </template>
                            <template #item.totalAmount="{ item }">
                                {{ money(item.totalAmount) }}
                            </template>
                            <template #item.items="{ item }">
                                {{ item.items.reduce((total, line) => total + line.quantity, 0) }}
                            </template>
                            <template #item.lastAttempt="{ item }">
                                <div v-if="lastAttempt(item)">
                                    <div>{{ formatStatus(lastAttempt(item)?.status ?? '') }}</div>
                                    <div class="text-caption text-error">
                                        {{
                                            item.lastPaymentError ||
                                            lastAttempt(item)?.errorMessage ||
                                            '—'
                                        }}
                                    </div>
                                </div>
                                <span v-else>Not attempted</span>
                            </template>
                            <template #item.createdAt="{ item }">
                                {{ formatDate(item.createdAt) }}
                            </template>
                            <template #item.actions="{ item }">
                                <div class="d-flex ga-2 flex-wrap">
                                    <v-btn
                                        size="small"
                                        variant="tonal"
                                        prepend-icon="mdi-eye"
                                        @click="viewOrder(item)"
                                    >
                                        View details
                                    </v-btn>
                                    <v-btn
                                        color="primary"
                                        size="small"
                                        prepend-icon="mdi-credit-card-refresh"
                                        :disabled="!isChargeable(item)"
                                        :loading="processingOrderId === item.id"
                                        @click="charge(item)"
                                    >
                                        Charge order
                                    </v-btn>
                                </div>
                            </template>
                            <template #no-data>
                                <div class="text-center pa-8 text-medium-emphasis">
                                    No pending procurement orders.
                                </div>
                            </template>
                        </v-data-table>
                    </v-window-item>
                </v-window>
            </v-card-text>

            <v-divider />
            <v-card-actions class="pa-4">
                <span v-if="submitBlockReason" class="text-caption text-medium-emphasis">
                    {{ submitBlockReason }}
                </span>
                <v-spacer />
                <v-btn variant="outlined" :disabled="processing" @click="close">Close</v-btn>
                <v-btn
                    v-if="tab === 'purchase'"
                    color="primary"
                    prepend-icon="mdi-credit-card"
                    :loading="processing"
                    :disabled="!canSubmit"
                    @click="createOrder"
                >
                    {{ isInternal ? 'Create free procurement' : 'Create and charge' }}
                </v-btn>
            </v-card-actions>
        </v-card>
        <OrderDetailsDialog
            v-if="selectedOrder"
            v-model="showDetails"
            :order="selectedOrder"
            can-write
            @updated="updateOrder"
        />
    </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useNuxtApp } from '#app'
import { useToast } from '~/composables/useToast'
import type { OrganisationCreditCard } from '~/types/organisation-credit-card.types'
import type { Location } from '~/types/location.types'
import type { CommerceOrder, ProcurementCatalogItem, ProcurementOrder } from '~/types/order.types'

interface Props {
    modelValue: boolean
    organisationId: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    submit: []
}>()

const nuxtApp = useNuxtApp()
const organisationProductApi =
    nuxtApp.$organisationProductApi as import('~/services/api/wrappers/organisation-product.api').OrganisationProductApiService
const creditCardApi =
    nuxtApp.$organisationCreditCardApi as import('~/services/api/wrappers/organisation-credit-card.api').OrganisationCreditCardApiService
const locationApi =
    nuxtApp.$locationApi as import('~/services/api/wrappers/location.api').LocationApiService
const { successFromResponse, errorFromError, error: showError } = useToast()

const tab = ref<'purchase' | 'pending'>('purchase')
const loading = ref(false)
const catalogLoading = ref(false)
const loadingOrders = ref(false)
const processing = ref(false)
const processingOrderId = ref<number | null>(null)
const selectedOrder = ref<CommerceOrder | null>(null)
const showDetails = ref(false)
const locations = ref<Location[]>([])
const orders = ref<ProcurementOrder[]>([])
const activeCreditCard = ref<OrganisationCreditCard | null>(null)
const catalogItems = ref<ProcurementCatalogItem[]>([])
const canUseInternalProcurement = ref(false)
const destinationLocationId = ref<number | null>(null)
const selectedVariantIds = ref<Set<number>>(new Set())
const quantities = ref<Record<number, number>>({})
const isInternal = ref(false)

const productHeaders = [
    { title: 'Select', key: 'select', sortable: false },
    { title: 'Product', key: 'productName' },
    { title: 'Platform SKU', key: 'sku' },
    { title: 'Unit price', key: 'price' },
    { title: 'Platform available', key: 'availableQty' },
    { title: 'Quantity', key: 'quantity', sortable: false },
    { title: 'Total', key: 'total', sortable: false },
]

const pendingHeaders = [
    { title: 'Order', key: 'orderNumber' },
    { title: 'Procurement', key: 'parties', sortable: false },
    { title: 'Status', key: 'status' },
    { title: 'Quantity', key: 'items', sortable: false },
    { title: 'Total', key: 'totalAmount' },
    { title: 'Last attempt', key: 'lastAttempt', sortable: false },
    { title: 'Created', key: 'createdAt' },
    { title: 'Actions', key: 'actions', sortable: false },
]

const variantRows = computed<ProcurementCatalogItem[]>(() => catalogItems.value)
const catalogByVariantId = computed<Map<number, ProcurementCatalogItem>>(
    () => new Map(variantRows.value.map((item) => [item.productVariantId, item]))
)

const locationOptions = computed(() =>
    locations.value
        .filter((location) => location.isActive)
        .map((location) => ({ title: location.name, value: location.id }))
)

const pendingOrders = computed(() =>
    orders.value.filter((order) =>
        ['PENDING_PAYMENT', 'PAYMENT_FAILED', 'PAYMENT_PROCESSING', 'PAYMENT_HELD'].includes(
            order.status
        )
    )
)

const selectedQuantity = computed(() =>
    [...selectedVariantIds.value].reduce(
        (total, variantId) => total + (quantities.value[variantId] ?? 1),
        0
    )
)

const orderTotal = computed(() =>
    variantRows.value.reduce(
        (total, row) =>
            total +
            (selectedVariantIds.value.has(row.productVariantId)
                ? row.price * (quantities.value[row.productVariantId] ?? 1)
                : 0),
        0
    )
)

const selectionsAreValid = computed<boolean>(() =>
    [...selectedVariantIds.value].every((productVariantId) => {
        const item = catalogByVariantId.value.get(productVariantId)
        const quantity = quantities.value[productVariantId] ?? 1
        if (!item || !Number.isInteger(quantity) || quantity <= 0) return false
        return !item.stockManaged || quantity <= (item.availableQty ?? 0)
    })
)
const hasPurchasableVariants = computed<boolean>(() =>
    variantRows.value.some((item) => isPurchasable(item))
)
const canSubmit = computed<boolean>(
    () =>
        !loading.value &&
        !catalogLoading.value &&
        !processing.value &&
        Boolean(destinationLocationId.value) &&
        selectedVariantIds.value.size > 0 &&
        selectionsAreValid.value &&
        (isInternal.value || Boolean(activeCreditCard.value))
)
const submitBlockReason = computed<string | null>(() => {
    if (loading.value || catalogLoading.value) return 'Loading procurement requirements…'
    if (!destinationLocationId.value) return 'Select an active destination location.'
    if (selectedVariantIds.value.size === 0) return 'Select at least one platform variant.'
    if (!selectionsAreValid.value) return 'Selected quantity exceeds current platform inventory.'
    if (!isInternal.value && !activeCreditCard.value) {
        return 'Add or activate a organisation payment card before charging.'
    }
    return null
})

const toggleVariant = (variantId: number, selected: boolean): void => {
    const next = new Set(selectedVariantIds.value)
    if (selected) {
        const item = catalogByVariantId.value.get(variantId)
        if (!item || !isPurchasable(item)) return
        next.add(variantId)
        quantities.value = { ...quantities.value, [variantId]: quantities.value[variantId] ?? 1 }
    } else {
        next.delete(variantId)
        const nextQuantities = { ...quantities.value }
        delete nextQuantities[variantId]
        quantities.value = nextQuantities
    }
    selectedVariantIds.value = next
}

const setQuantity = (item: ProcurementCatalogItem, value: unknown): void => {
    const parsed = Math.trunc(Number(value))
    const positiveQuantity = Number.isFinite(parsed) ? Math.max(parsed, 1) : 1
    const quantity = item.stockManaged
        ? Math.min(positiveQuantity, item.availableQty ?? 0)
        : positiveQuantity
    quantities.value = {
        ...quantities.value,
        [item.productVariantId]: quantity,
    }
}

const isPurchasable = (item: ProcurementCatalogItem): boolean =>
    !item.stockManaged || (item.availableQty ?? 0) > 0

const availabilityLabel = (item: ProcurementCatalogItem): string =>
    item.stockManaged ? String(item.availableQty ?? 0) : 'Not tracked'

const availabilityColor = (item: ProcurementCatalogItem): string => {
    if (!item.stockManaged) return 'info'
    return (item.availableQty ?? 0) > 0 ? 'success' : 'error'
}

const money = (value: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

const formatDate = (value: string): string => {
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value))
}

const formatStatus = (value: string): string => {
    return value.replaceAll('_', ' ').toLowerCase()
}

const statusColor = (status: string): string => {
    if (status === 'PAID' || status === 'COMPLETED') return 'success'
    if (status === 'PAYMENT_FAILED') return 'error'
    if (status === 'PENDING_PAYMENT') return 'warning'
    return 'info'
}

const lastAttempt = (order: ProcurementOrder) => {
    return order.attempts.at(-1)
}

const isChargeable = (order: ProcurementOrder): boolean => {
    return order.status === 'PENDING_PAYMENT' || order.status === 'PAYMENT_FAILED'
}

const viewOrder = (order: ProcurementOrder): void => {
    selectedOrder.value = { ...order, orderType: 'PROCUREMENT' }
    showDetails.value = true
}

const updateOrder = (order: CommerceOrder): void => {
    if (order.orderType !== 'PROCUREMENT') return
    orders.value = orders.value.map((candidate) => (candidate.id === order.id ? order : candidate))
    selectedOrder.value = order
}

const idempotencyKey = (prefix: string): string => {
    return `${prefix}-${Date.now()}-${crypto.randomUUID()}`
}

const loadOrders = async (): Promise<void> => {
    if (!props.organisationId) return
    loadingOrders.value = true
    try {
        const response = await organisationProductApi.getProcurementOrders(
            props.organisationId,
            undefined,
            true
        )
        orders.value = response.data?.data ?? []
    } catch (error) {
        errorFromError(error, 'Failed to load procurement orders')
    } finally {
        loadingOrders.value = false
    }
}

const loadCatalog = async (): Promise<void> => {
    if (!props.organisationId) return
    catalogLoading.value = true
    try {
        const response = await organisationProductApi.getProcurementCatalog(props.organisationId)
        catalogItems.value = response.data?.items ?? []
        canUseInternalProcurement.value = response.data?.canUseInternalProcurement ?? false
        if (!canUseInternalProcurement.value) isInternal.value = false
    } catch (error) {
        catalogItems.value = []
        canUseInternalProcurement.value = false
        isInternal.value = false
        errorFromError(error, 'Failed to load platform inventory')
    } finally {
        catalogLoading.value = false
    }
}

const loadDialog = async (): Promise<void> => {
    if (!props.organisationId) return
    loading.value = true
    locations.value = []
    destinationLocationId.value = null
    activeCreditCard.value = null
    try {
        const [locationResponse, cardResponse] = await Promise.all([
            locationApi.refreshLocations(props.organisationId),
            creditCardApi.refreshOrganisationCreditCards(props.organisationId),
            loadCatalog(),
            loadOrders(),
        ])
        locations.value = locationResponse.data ?? []
        destinationLocationId.value =
            locations.value.find((location) => location.isActive)?.id ?? null
        activeCreditCard.value = cardResponse.data?.find((card) => card.isActive) ?? null
    } catch (error) {
        errorFromError(error, 'Failed to load procurement data')
    } finally {
        loading.value = false
    }
}

const createOrder = async (): Promise<void> => {
    const destinationId = destinationLocationId.value
    if (!canSubmit.value || destinationId === null) return
    processing.value = true
    try {
        const response = await organisationProductApi.createProcurementOrder(props.organisationId, {
            items: [...selectedVariantIds.value].map((productVariantId) => ({
                productVariantId,
                destinationLocationId: destinationId,
                quantity: quantities.value[productVariantId] ?? 1,
            })),
            idempotencyKey: idempotencyKey(`procurement-${props.organisationId}`),
            isInternal: isInternal.value,
        })
        if (!response.data) throw new Error(response.message || 'Procurement order was not created')
        if (response.data.status === 'COMPLETED') {
            successFromResponse(response, 'Procurement completed successfully')
            selectedVariantIds.value = new Set()
            quantities.value = {}
            emit('submit')
        } else {
            showError(
                response.message || 'Payment failed; retry the same order from Pending orders'
            )
            tab.value = 'pending'
        }
        await Promise.all([loadOrders(), loadCatalog()])
    } catch (error) {
        errorFromError(error, 'Failed to create procurement order')
    } finally {
        processing.value = false
    }
}

const charge = async (order: ProcurementOrder): Promise<void> => {
    processingOrderId.value = order.id
    try {
        const response = await organisationProductApi.chargeProcurementOrder(props.organisationId, order.id, {
            idempotencyKey: idempotencyKey(`procurement-charge-${order.id}`),
        })
        if (response.data?.status === 'COMPLETED') {
            successFromResponse(response, 'Order charged successfully')
            emit('submit')
            await loadCatalog()
        } else {
            showError(response.message || 'Charge attempt failed')
        }
        await loadOrders()
    } catch (error) {
        errorFromError(error, 'Failed to charge procurement order')
    } finally {
        processingOrderId.value = null
    }
}

const close = (): void => {
    emit('update:modelValue', false)
}

watch(
    () => props.modelValue,
    (isOpen) => {
        if (!isOpen) return
        tab.value = 'purchase'
        selectedVariantIds.value = new Set()
        quantities.value = {}
        isInternal.value = false
        void loadDialog()
    },
    { immediate: true }
)
</script>
