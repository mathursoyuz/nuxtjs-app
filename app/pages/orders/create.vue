<template>
    <v-container fluid>
        <div class="d-flex align-center justify-space-between mb-4">
            <div>
                <h1 class="text-h4">Create customer order</h1>
                <div class="text-body-2 text-medium-emphasis">
                    Sell the client’s white-label variants from a client inventory location.
                </div>
            </div>
            <v-btn variant="text" prepend-icon="mdi-arrow-left" to="/orders">Back to orders</v-btn>
        </div>

        <v-form @submit.prevent="submitOrder">
            <v-card class="mb-4">
                <v-card-title>Customer and fulfilment</v-card-title>
                <v-card-text>
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-select
                                v-model="clientId"
                                :items="clientOptions"
                                label="Client"
                                variant="outlined"
                                :loading="loadingClients"
                                @update:model-value="loadClientContext"
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-select
                                v-model="customerId"
                                :items="customerOptions"
                                label="Customer"
                                variant="outlined"
                                :disabled="!clientId"
                                :loading="loadingContext"
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-select
                                v-model="shippingAddressId"
                                :items="shippingOptions"
                                label="Shipping address"
                                variant="outlined"
                                clearable
                                hint="Leave empty to use the customer's primary shipping address"
                                persistent-hint
                                :disabled="!customerId"
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-select
                                v-model="locationId"
                                :items="locationOptions"
                                label="Inventory location"
                                variant="outlined"
                                :disabled="!clientId"
                                @update:model-value="clearSelectedProducts"
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model="shippingMethod"
                                label="Shipping method"
                                variant="outlined"
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-textarea v-model="notes" label="Notes" rows="2" variant="outlined" />
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>

            <v-card>
                <v-card-title>Client products</v-card-title>
                <v-card-subtitle>
                    Availability is the client-owned quantity at the selected location, not platform
                    stock.
                </v-card-subtitle>
                <v-card-text>
                    <v-alert
                        v-if="clientId && !locationId"
                        type="info"
                        variant="tonal"
                        class="mb-4"
                    >
                        Select an inventory location to see sellable stock.
                    </v-alert>

                    <v-data-table
                        v-model="selectedVariantIds"
                        :headers="headers"
                        :items="sellableVariants"
                        :loading="loadingContext"
                        item-value="clientProductVariantId"
                        show-select
                    >
                        <template #item.price="{ item }">{{ money(item.price) }}</template>
                        <template #item.available="{ item }">
                            <v-chip size="small" color="success" variant="tonal">
                                {{ item.available }}
                            </v-chip>
                        </template>
                        <template #item.quantity="{ item }">
                            <v-text-field
                                :model-value="quantities[item.clientProductVariantId] ?? 1"
                                type="number"
                                min="1"
                                :max="item.available"
                                density="compact"
                                variant="outlined"
                                hide-details
                                style="max-width: 110px"
                                @update:model-value="
                                    setQuantity(
                                        item.clientProductVariantId,
                                        Number($event),
                                        item.available
                                    )
                                "
                            />
                        </template>
                        <template #no-data>
                            <div class="pa-8 text-center text-medium-emphasis">
                                No client products have available inventory at this location.
                            </div>
                        </template>
                    </v-data-table>

                    <v-divider class="my-4" />
                    <div class="d-flex flex-wrap align-center justify-space-between ga-3">
                        <div>
                            <div class="text-caption text-medium-emphasis">Order total</div>
                            <div class="text-h5">{{ money(orderTotal) }}</div>
                        </div>
                        <div class="d-flex ga-2">
                            <v-btn variant="outlined" to="/orders">Cancel</v-btn>
                            <v-btn
                                color="primary"
                                type="submit"
                                prepend-icon="mdi-credit-card"
                                :loading="submitting"
                                :disabled="!canSubmit"
                            >
                                Create and charge
                            </v-btn>
                        </div>
                    </div>
                </v-card-text>
            </v-card>
        </v-form>
    </v-container>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useNuxtApp } from '#app'
import { useToast } from '~/composables/useToast'
import type { ClientProduct } from '~/types/client-product.types'
import type { Client } from '~/types/client.types'
import type { Location } from '~/types/location.types'
import type { Customer } from '~/services/api/wrappers/customer.api'

definePageMeta({ middleware: ['auth'] })

interface SellableVariant {
    clientProductVariantId: number
    name: string
    sku: string
    price: number
    available: number
}

const nuxtApp = useNuxtApp()
const clientApi =
    nuxtApp.$clientApi as import('~/services/api/wrappers/client.api').ClientApiService
const customerApi =
    nuxtApp.$customerApi as import('~/services/api/wrappers/customer.api').CustomerApiService
const locationApi =
    nuxtApp.$locationApi as import('~/services/api/wrappers/location.api').LocationApiService
const clientProductApi =
    nuxtApp.$clientProductApi as import('~/services/api/wrappers/client-product.api').ClientProductApiService
const orderApi = nuxtApp.$orderApi as import('~/services/api/wrappers/order.api').OrderApiService
const { successFromResponse, errorFromError, error: showError } = useToast()

const clients = ref<Client[]>([])
const customers = ref<Customer[]>([])
const locations = ref<Location[]>([])
const clientProducts = ref<ClientProduct[]>([])
const clientId = ref<number | null>(null)
const customerId = ref<number | null>(null)
const shippingAddressId = ref<number | null>(null)
const locationId = ref<number | null>(null)
const shippingMethod = ref('Standard')
const notes = ref('')
const selectedVariantIds = ref<number[]>([])
const quantities = reactive<Record<number, number>>({})
const loadingClients = ref(false)
const loadingContext = ref(false)
const submitting = ref(false)

const headers = [
    { title: 'Product', key: 'name' },
    { title: 'SKU', key: 'sku' },
    { title: 'Price', key: 'price' },
    { title: 'Available here', key: 'available' },
    { title: 'Quantity', key: 'quantity', sortable: false },
]

const clientOptions = computed(() =>
    clients.value
        .filter((client) => client.isActive)
        .map((client) => ({ title: client.name, value: client.id }))
)
const customerOptions = computed(() =>
    customers.value
        .filter((customer) => customer.isActive)
        .map((customer) => ({
            title: `${customer.firstName} ${customer.lastName} — ${customer.email}`,
            value: customer.id,
        }))
)
const selectedCustomer = computed(() =>
    customers.value.find((customer) => customer.id === customerId.value)
)
const shippingOptions = computed(() =>
    (selectedCustomer.value?.shippingAddresses ?? [])
        .filter((address) => address.isActive)
        .map((address) => ({
            title: `${address.firstName} ${address.lastName}, ${address.address}, ${address.city}`,
            value: address.id,
        }))
)
const locationOptions = computed(() =>
    locations.value
        .filter((location) => location.isActive)
        .map((location) => ({ title: location.name, value: location.id }))
)
const sellableVariants = computed<SellableVariant[]>(() => {
    if (!locationId.value) return []
    return clientProducts.value.flatMap((product) =>
        product.variants
            .filter((variant) => variant.isActive && !variant.isDeleted)
            .map((variant) => {
                const inventory = variant.inventory.find(
                    (balance) => balance.locationId === locationId.value
                )
                return {
                    clientProductVariantId: variant.id,
                    name: product.name,
                    sku: variant.sku,
                    price: variant.price,
                    available: inventory?.available ?? 0,
                }
            })
            .filter((variant) => variant.available > 0)
    )
})
const selectedVariants = computed(() =>
    sellableVariants.value.filter((variant) =>
        selectedVariantIds.value.includes(variant.clientProductVariantId)
    )
)
const orderTotal = computed(() =>
    selectedVariants.value.reduce(
        (total, variant) =>
            total + variant.price * (quantities[variant.clientProductVariantId] ?? 1),
        0
    )
)
const canSubmit = computed(
    () =>
        Boolean(clientId.value && customerId.value && locationId.value) &&
        shippingMethod.value.trim().length > 0 &&
        selectedVariants.value.length > 0 &&
        selectedVariants.value.every((variant) => {
            const quantity = quantities[variant.clientProductVariantId] ?? 1
            return quantity >= 1 && quantity <= variant.available
        })
)

function money(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

function setQuantity(variantId: number, quantity: number, available: number): void {
    quantities[variantId] = Math.max(
        1,
        Math.min(Number.isFinite(quantity) ? quantity : 1, available)
    )
}

function clearSelectedProducts(): void {
    selectedVariantIds.value = []
    Object.keys(quantities).forEach((key) => delete quantities[Number(key)])
}

async function loadClientContext(): Promise<void> {
    customerId.value = null
    shippingAddressId.value = null
    locationId.value = null
    customers.value = []
    locations.value = []
    clientProducts.value = []
    clearSelectedProducts()
    if (!clientId.value) return

    loadingContext.value = true
    try {
        const [customerResponse, locationResponse, productResponse] = await Promise.all([
            customerApi.getAllCustomers(clientId.value, 1, 1000),
            locationApi.getAllLocations(clientId.value),
            clientProductApi.getAllClientProducts(clientId.value),
        ])
        customers.value = customerResponse.data?.customers ?? []
        locations.value = locationResponse.data ?? []
        clientProducts.value = productResponse.data ?? []
    } catch (error) {
        errorFromError(error, 'Failed to load client order data')
    } finally {
        loadingContext.value = false
    }
}

async function submitOrder(): Promise<void> {
    if (!canSubmit.value || !clientId.value || !customerId.value || !locationId.value) return
    submitting.value = true
    try {
        const response = await orderApi.createCustomerOrder(clientId.value, {
            customerId: customerId.value,
            ...(shippingAddressId.value ? { shippingAddressId: shippingAddressId.value } : {}),
            shippingMethod: shippingMethod.value.trim(),
            ...(notes.value.trim() ? { notes: notes.value.trim() } : {}),
            items: selectedVariants.value.map((variant) => ({
                clientProductVariantId: variant.clientProductVariantId,
                inventoryLocationId: locationId.value as number,
                quantity: quantities[variant.clientProductVariantId] ?? 1,
            })),
            idempotencyKey: `customer-order-${crypto.randomUUID()}`,
        })
        if (response.data?.status === 'PAID') {
            successFromResponse(response, 'Customer order created and charged')
        } else {
            showError(response.message || 'Order was created but its charge did not complete')
        }
        await navigateTo('/orders')
    } catch (error) {
        errorFromError(error, 'Failed to create customer order')
    } finally {
        submitting.value = false
    }
}

watch(customerId, () => {
    shippingAddressId.value = null
})

loadingClients.value = true
try {
    const response = await clientApi.getAllClients()
    clients.value = response.data ?? []
} catch (error) {
    errorFromError(error, 'Failed to load clients')
} finally {
    loadingClients.value = false
}
</script>
