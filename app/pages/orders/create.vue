<template>
    <v-container fluid>
        <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
            <div>
                <h1 class="text-h4">Create customer order</h1>
                <div class="text-body-2 text-medium-emphasis">
                    <span v-if="selectedCustomer">
                        Organisation:
                        <strong>{{ organisationName }}</strong>
                    </span>
                    <span v-else>Search for a customer to begin.</span>
                </div>
            </div>
            <v-btn variant="text" prepend-icon="mdi-arrow-left" to="/orders">Back to orders</v-btn>
        </div>

        <v-card>
            <v-tabs v-model="tab" grow>
                <v-tab value="customer">1. Customer</v-tab>
                <v-tab value="details" :disabled="!selectedCustomer">2. Billing & shipping</v-tab>
                <v-tab value="products" :disabled="!detailsValid">3. Products</v-tab>
                <v-tab value="review" :disabled="!productsValid">4. Order review</v-tab>
            </v-tabs>
            <v-divider />

            <v-card-text class="pa-5">
                <v-window v-model="tab">
                    <v-window-item value="customer">
                        <CustomerSearchStep v-model="selectedCustomer" />
                    </v-window-item>

                    <v-window-item value="details">
                        <OrderAddressStep
                            v-if="selectedCustomer"
                            v-model:billing="billingAddress"
                            v-model:shipping="shippingAddress"
                            @select-shipping="showShippingDialog = true"
                        />
                    </v-window-item>

                    <v-window-item value="products">
                        <OrderProductStep
                            v-if="selectedCustomer"
                            :organisation-id="selectedCustomer.organisationId"
                            v-model="lines"
                        />
                    </v-window-item>

                    <v-window-item value="review">
                        <OrderReviewStep
                            v-if="selectedCustomer"
                            :lines="lines"
                            :billing="billingAddress"
                            :shipping="shippingAddress"
                            v-model:notes="notes"
                            :cards="cards"
                            :selected-card-id="selectedCardId"
                            :loading-cards="loadingCards"
                            @update:selected-card-id="selectedCardId = $event"
                            @add-card="showCardDialog = true"
                            @change-shipping="showShippingDialog = true"
                        />
                    </v-window-item>
                </v-window>
            </v-card-text>

            <v-divider />
            <v-card-actions class="pa-4">
                <v-btn
                    v-if="tab !== 'customer'"
                    variant="text"
                    prepend-icon="mdi-arrow-left"
                    @click="previousStep"
                >
                    Back
                </v-btn>
                <v-spacer />
                <v-btn variant="outlined" to="/orders">Cancel</v-btn>
                <v-btn
                    v-if="tab !== 'review'"
                    color="primary"
                    append-icon="mdi-arrow-right"
                    :disabled="!canContinue"
                    @click="nextStep"
                >
                    Continue
                </v-btn>
                <v-btn
                    v-else
                    color="primary"
                    prepend-icon="mdi-credit-card"
                    :loading="submitting"
                    :disabled="!canCharge"
                    @click="submitOrder"
                >
                    Charge customer {{ money(subtotal) }}
                </v-btn>
            </v-card-actions>
        </v-card>

        <OrderShippingAddressDialog
            v-if="selectedCustomer"
            v-model="showShippingDialog"
            :customer="selectedCustomer"
            :selected-address-id="shippingAddressId"
            @select="selectShippingAddress"
            @manage="openShippingManagement"
        />

        <ManageShippingAddressesDialog
            v-if="selectedCustomer && showManageShippingDialog"
            v-model="showManageShippingDialog"
            :customer="selectedCustomer"
            :organisation-id="selectedCustomer.organisationId"
            @submit="refreshCustomerShipping"
        />

        <OrderAddCreditCardDialog
            v-if="selectedCustomer && showCardDialog"
            v-model="showCardDialog"
            :customer="selectedCustomer"
            @added="handleCardAdded"
        />
    </v-container>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useNuxtApp, useRoute } from '#app'
import CustomerSearchStep from '~/components/orders/CustomerSearchStep.vue'
import OrderAddressStep from '~/components/orders/OrderAddressStep.vue'
import OrderProductStep from '~/components/orders/OrderProductStep.vue'
import OrderReviewStep from '~/components/orders/OrderReviewStep.vue'
import OrderBillingAddressDialog from '~/components/orders/OrderBillingAddressDialog.vue'
import OrderShippingAddressDialog from '~/components/orders/OrderShippingAddressDialog.vue'
import OrderAddCreditCardDialog from '~/components/orders/OrderAddCreditCardDialog.vue'
import ManageShippingAddressesDialog from '~/components/customers/ManageShippingAddressesDialog.vue'
import { useAccessStore } from '~/stores/access.store'
import { useToast } from '~/composables/useToast'
import type { Customer } from '~/services/api/wrappers/customer.api'
import type { CustomerCreditCard } from '~/services/api/wrappers/customer-credit-card.api'
import type { CustomerOrderAddress, CustomerOrderDraftLine } from '~/types/order.types'
import { CUSTOMER_ORDER_PERMISSIONS } from '~/components/orders/order.permissions'

definePageMeta({
    middleware: ['auth', 'permission'],
    access: { permission: CUSTOMER_ORDER_PERMISSIONS.WRITE, allowAnyOrganisation: true },
})

type WizardTab = 'customer' | 'details' | 'products' | 'review'

const nuxtApp = useNuxtApp()
const route = useRoute()
const access = useAccessStore()
const customerApi =
    nuxtApp.$customerApi as import('~/services/api/wrappers/customer.api').CustomerApiService
const cardApi =
    nuxtApp.$customerCreditCardApi as import('~/services/api/wrappers/customer-credit-card.api').CustomerCreditCardApiService
const orderApi = nuxtApp.$orderApi as import('~/services/api/wrappers/order.api').OrderApiService
const { successFromResponse, errorFromError, error: showError } = useToast()

const emptyAddress = (): CustomerOrderAddress => ({
    firstName: '',
    lastName: '',
    company: '',
    address: '',
    city: '',
    stateCode: '',
    postalCode: '',
    countryCode: '',
    phone: '',
    email: '',
})

const tab = ref<WizardTab>('customer')
const selectedCustomer = ref<Customer | null>(null)
const billingAddress = ref<CustomerOrderAddress>(emptyAddress())
const shippingAddress = ref<CustomerOrderAddress>(emptyAddress())
const shippingAddressId = ref<number | null>(null)
const shippingMethod = ref('Standard')
const notes = ref('')
const lines = ref<CustomerOrderDraftLine[]>([])
const cards = ref<CustomerCreditCard[]>([])
const selectedCardId = ref<number | null>(null)
const loadingCards = ref(false)
const submitting = ref(false)
const showBillingDialog = ref(false)
const showShippingDialog = ref(false)
const showManageShippingDialog = ref(false)
const showCardDialog = ref(false)

const organisationName = computed(
    () =>
        access.organisations.find((organisation) => organisation.id === selectedCustomer.value?.organisationId)?.name ??
        `Organisation #${selectedCustomer.value?.organisationId ?? ''}`
)
const requiredAddressFields: Array<keyof CustomerOrderAddress> = [
    'firstName',
    'lastName',
    'address',
    'city',
    'stateCode',
    'postalCode',
    'countryCode',
    'phone',
    'email',
]
const addressValid = (address: CustomerOrderAddress): boolean =>
    requiredAddressFields.every((field) => address[field].trim().length > 0) &&
    /^\S+@\S+\.\S+$/.test(address.email)
const detailsValid = computed(
    () =>
        Boolean(selectedCustomer.value) &&
        addressValid(billingAddress.value) &&
        addressValid(shippingAddress.value) &&
        shippingMethod.value.trim().length > 0
)
const productsValid = computed(
    () =>
        detailsValid.value &&
        lines.value.length > 0 &&
        lines.value.every(
            (line) =>
                Number.isInteger(line.quantity) &&
                line.quantity > 0 &&
                line.quantity <= line.available
        )
)
const subtotal = computed(() =>
    lines.value.reduce((total, line) => total + line.unitPrice * line.quantity, 0)
)
const canCharge = computed(
    () => productsValid.value && selectedCardId.value !== null && !submitting.value
)
const canContinue = computed(() => {
    if (tab.value === 'customer') return Boolean(selectedCustomer.value)
    if (tab.value === 'details') return detailsValid.value
    if (tab.value === 'products') return productsValid.value
    return false
})

function toBilling(customer: Customer): CustomerOrderAddress {
    return {
        firstName: customer.firstName,
        lastName: customer.lastName,
        company: customer.billing.company ?? '',
        address: customer.billing.address,
        city: customer.billing.city,
        stateCode: customer.billing.stateCode,
        postalCode: customer.billing.postalCode,
        countryCode: customer.billing.countryCode,
        phone: customer.phoneNumber,
        email: customer.email,
    }
}

function toPrimaryShipping(customer: Customer): CustomerOrderAddress {
    return {
        firstName: customer.shipping.firstName ?? customer.firstName,
        lastName: customer.shipping.lastName ?? customer.lastName,
        company: customer.shipping.company ?? '',
        address: customer.shipping.address,
        city: customer.shipping.city,
        stateCode: customer.shipping.stateCode,
        postalCode: customer.shipping.postalCode,
        countryCode: customer.shipping.countryCode,
        phone: customer.phoneNumber,
        email: customer.email,
    }
}

function money(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

function nextStep(): void {
    if (!canContinue.value) return
    const order: WizardTab[] = ['customer', 'details', 'products', 'review']
    tab.value = order[Math.min(order.indexOf(tab.value) + 1, order.length - 1)] ?? 'review'
}

function previousStep(): void {
    const order: WizardTab[] = ['customer', 'details', 'products', 'review']
    tab.value = order[Math.max(order.indexOf(tab.value) - 1, 0)] ?? 'customer'
}

function selectShippingAddress(payload: {
    id: number | null
    address: CustomerOrderAddress
}): void {
    shippingAddressId.value = payload.id
    shippingAddress.value = payload.address
}

function openShippingManagement(): void {
    showShippingDialog.value = false
    showManageShippingDialog.value = true
}

async function refreshCards(selectActive = false): Promise<void> {
    const customer = selectedCustomer.value
    if (!customer) return
    loadingCards.value = true
    try {
        const response = await cardApi.refreshCustomerCreditCards(customer.id)
        cards.value = response.data ?? []
        const selectedStillExists = cards.value.some((card) => card.id === selectedCardId.value)
        if (selectActive || !selectedStillExists) {
            selectedCardId.value =
                cards.value.find((card) => card.isActive)?.id ?? cards.value[0]?.id ?? null
        }
    } catch (error) {
        errorFromError(error, 'Failed to load customer cards')
    } finally {
        loadingCards.value = false
    }
}

async function handleCardAdded(): Promise<void> {
    const customer = selectedCustomer.value
    if (!customer) return
    try {
        const response = await customerApi.getCustomerById(customer.id)
        if (response.data) {
            selectedCustomer.value = response.data
            billingAddress.value = toBilling(response.data)
        }
    } catch (error) {
        errorFromError(error, 'Card was added, but customer billing could not be refreshed')
    }
    await refreshCards(true)
}

async function refreshCustomerShipping(): Promise<void> {
    const customer = selectedCustomer.value
    if (!customer) return
    try {
        const response = await customerApi.getCustomerById(customer.id)
        if (response.data) selectedCustomer.value = response.data
    } catch (error) {
        errorFromError(error, 'Failed to refresh shipping addresses')
    }
}

async function submitOrder(): Promise<void> {
    const customer = selectedCustomer.value
    if (!customer || !canCharge.value || selectedCardId.value === null) return
    submitting.value = true
    try {
        const response = await orderApi.createCustomerOrder(customer.organisationId, {
            customerId: customer.id,
            creditCardId: selectedCardId.value,
            ...(shippingAddressId.value ? { shippingAddressId: shippingAddressId.value } : {}),
            billingAddress: { ...billingAddress.value },
            shippingAddress: { ...shippingAddress.value },
            shippingMethod: shippingMethod.value.trim(),
            ...(notes.value.trim() ? { notes: notes.value.trim() } : {}),
            items: lines.value.map((line) => ({
                organisationProductVariantId: line.organisationProductVariantId,
                inventoryLocationId: line.inventoryLocationId,
                quantity: line.quantity,
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

watch(selectedCustomer, async (customer, previous) => {
    if (!customer) {
        billingAddress.value = emptyAddress()
        shippingAddress.value = emptyAddress()
        shippingAddressId.value = null
        lines.value = []
        cards.value = []
        selectedCardId.value = null
        tab.value = 'customer'
        return
    }
    if (previous?.id === customer.id) return
    billingAddress.value = toBilling(customer)
    shippingAddress.value = toPrimaryShipping(customer)
    shippingAddressId.value = null
    lines.value = []
    cards.value = []
    selectedCardId.value = null
    await refreshCards()
    tab.value = 'details'
})

watch(showManageShippingDialog, (open, wasOpen) => {
    if (wasOpen && !open && selectedCustomer.value) showShippingDialog.value = true
})

await access.ensureReady()
const requestedCustomerId = Number(route.query.customerId)
if (Number.isSafeInteger(requestedCustomerId) && requestedCustomerId > 0) {
    try {
        const response = await customerApi.getCustomerById(requestedCustomerId)
        selectedCustomer.value = response.data ?? null
    } catch (error) {
        errorFromError(error, 'Failed to load the selected customer')
    }
}
</script>
