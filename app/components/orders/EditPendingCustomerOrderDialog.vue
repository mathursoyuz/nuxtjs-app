<template>
    <v-dialog
        :model-value="modelValue"
        max-width="1250"
        scrollable
        persistent
        @update:model-value="close"
    >
        <v-card>
            <v-card-title class="d-flex align-center pa-4">
                <div>
                    <div>Edit pending order</div>
                    <div class="text-caption text-medium-emphasis">{{ order.orderNumber }}</div>
                </div>
                <v-spacer />
                <v-btn icon="mdi-close" variant="text" :disabled="busy" @click="close(false)" />
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-5">
                <v-alert v-if="initializing" type="info" variant="tonal" class="mb-4">
                    Loading current customer, payment, product, and inventory details…
                </v-alert>
                <v-alert v-else-if="initializationError" type="error" variant="tonal" class="mb-4">
                    {{ initializationError }}
                    <template #append>
                        <v-btn size="small" variant="text" @click="initialize">Retry</v-btn>
                    </template>
                </v-alert>
                <template v-else-if="customer">
                    <PendingOrderItemsEditor
                        :key="editorRevision"
                        v-model="lines"
                        v-model:valid="itemsValid"
                        :organisation-id="order.organisationId"
                        :currency="order.currency"
                        :reserved-lines="reservedLines"
                        :reservations-active="order.status === 'PENDING_PAYMENT'"
                    />

                    <v-row class="mt-3">
                        <v-col cols="12" md="6">
                            <v-card variant="outlined" height="100%">
                                <v-card-title class="d-flex align-center">
                                    Billing details
                                    <v-spacer />
                                    <v-btn size="small" variant="tonal" @click="showBilling = true">
                                        Change
                                    </v-btn>
                                </v-card-title>
                                <v-card-text>
                                    <OrderAddressSummary :address="billing" />
                                </v-card-text>
                            </v-card>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-card variant="outlined" height="100%">
                                <v-card-title class="d-flex align-center">
                                    Fulfilment
                                    <v-spacer />
                                    <v-switch
                                        v-model="pickup"
                                        label="Customer pickup"
                                        color="primary"
                                        hide-details
                                    />
                                </v-card-title>
                                <v-card-text>
                                    <div v-if="pickup" class="text-medium-emphasis">
                                        No shipment is required. Inventory locations remain recorded
                                        against the selected order items.
                                    </div>
                                    <template v-else>
                                        <OrderAddressSummary :address="shipping" />
                                        <v-btn
                                            class="mt-3"
                                            size="small"
                                            variant="tonal"
                                            @click="showShipping = true"
                                        >
                                            Change shipping address
                                        </v-btn>
                                    </template>
                                </v-card-text>
                            </v-card>
                        </v-col>
                        <v-col cols="12">
                            <v-card variant="outlined">
                                <v-card-title class="d-flex align-center">
                                    Payment card
                                    <v-spacer />
                                    <v-btn
                                        size="small"
                                        variant="tonal"
                                        prepend-icon="mdi-plus"
                                        @click="showAddCard = true"
                                    >
                                        Add card
                                    </v-btn>
                                </v-card-title>
                                <v-card-text>
                                    <v-radio-group
                                        v-if="cards.length"
                                        v-model="selectedCardId"
                                        hide-details
                                    >
                                        <v-row>
                                            <v-col
                                                v-for="card in cards"
                                                :key="card.id"
                                                cols="12"
                                                sm="6"
                                                md="4"
                                            >
                                                <v-card
                                                    variant="outlined"
                                                    @click="selectedCardId = card.id"
                                                >
                                                    <v-card-text class="d-flex align-center ga-3">
                                                        <v-radio :value="card.id" />
                                                        <v-icon icon="mdi-credit-card" />
                                                        <div>
                                                            Ending {{ card.lastFour }}
                                                            <div class="text-caption">
                                                                Expires {{ card.expMonth }}/{{
                                                                    card.expYear
                                                                }}
                                                            </div>
                                                        </div>
                                                    </v-card-text>
                                                </v-card>
                                            </v-col>
                                        </v-row>
                                    </v-radio-group>
                                    <v-alert v-else type="warning" variant="tonal">
                                        Add a payment card before saving or charging this order.
                                    </v-alert>
                                </v-card-text>
                            </v-card>
                        </v-col>
                        <v-col cols="12">
                            <v-textarea
                                v-model="notes"
                                label="Order notes"
                                rows="2"
                                maxlength="2000"
                                counter
                                variant="outlined"
                            />
                        </v-col>
                    </v-row>
                </template>
            </v-card-text>
            <v-divider />
            <v-card-actions class="pa-4">
                <div class="text-subtitle-1">
                    Total:
                    <strong>{{ money(total) }}</strong>
                </div>
                <v-spacer />
                <v-btn variant="text" :disabled="busy" @click="close(false)">Cancel</v-btn>
                <v-btn
                    color="primary"
                    variant="tonal"
                    :loading="saving"
                    :disabled="!canSave || busy"
                    @click="save(false)"
                >
                    Save changes
                </v-btn>
                <v-btn
                    color="primary"
                    :loading="savingAndCharging"
                    :disabled="!canSave || busy"
                    @click="save(true)"
                >
                    Save and charge
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <OrderBillingAddressDialog
        v-if="customer"
        v-model="showBilling"
        :address="billing"
        @save="billing = $event"
    />
    <OrderShippingAddressDialog
        v-if="customer"
        v-model="showShipping"
        :customer="customer"
        :selected-address-id="shippingAddressId"
        @select="selectShipping"
        @manage="showManageShipping = true"
    />
    <OrderAddCreditCardDialog
        v-if="customer"
        v-model="showAddCard"
        :customer="customer"
        @added="handleCardAdded"
    />
    <ManageShippingAddressesDialog
        v-if="customer"
        v-model="showManageShipping"
        :customer="customer"
        :organisation-id="order.organisationId"
        @submit="handleShippingChanged"
    />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useNuxtApp } from '#app'
import ManageShippingAddressesDialog from '~/components/customers/ManageShippingAddressesDialog.vue'
import OrderAddCreditCardDialog from '~/components/orders/OrderAddCreditCardDialog.vue'
import OrderAddressSummary from '~/components/orders/OrderAddressSummary.vue'
import OrderBillingAddressDialog from '~/components/orders/OrderBillingAddressDialog.vue'
import OrderShippingAddressDialog from '~/components/orders/OrderShippingAddressDialog.vue'
import PendingOrderItemsEditor from '~/components/orders/PendingOrderItemsEditor.vue'
import { useCustomerCreditCards } from '~/composables/useCustomerCreditCards'
import { useToast } from '~/composables/useToast'
import type { Customer } from '~/services/api/wrappers/customer.api'
import type {
    CustomerOrderAddress,
    CustomerOrderDraftLine,
    CustomerSaleOrder,
} from '~/types/order.types'

const props = defineProps<{ modelValue: boolean; order: CustomerSaleOrder }>()
const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    saved: [order: CustomerSaleOrder]
    charged: [order: CustomerSaleOrder]
}>()
const nuxtApp = useNuxtApp()
const orderApi = nuxtApp.$orderApi as import('~/services/api/wrappers/order.api').OrderApiService
const customerApi =
    nuxtApp.$customerApi as import('~/services/api/wrappers/customer.api').CustomerApiService
const { successFromResponse, errorFromError } = useToast()

const customer = ref<Customer | null>(null)
const initializing = ref(false)
const initializationError = ref('')
const lines = ref<CustomerOrderDraftLine[]>([])
const reservedLines = ref<CustomerOrderDraftLine[]>([])
const itemsValid = ref(false)
const billing = ref<CustomerOrderAddress>({ ...props.order.payment.billing })
const shipping = ref<CustomerOrderAddress>({ ...props.order.payment.shipping })
const shippingAddressId = ref<number | null>(null)
const selectedCardId = ref<number | null>(null)
const pickup = ref(false)
const notes = ref('')
const saving = ref(false)
const savingAndCharging = ref(false)
const showBilling = ref(false)
const showShipping = ref(false)
const showAddCard = ref(false)
const showManageShipping = ref(false)
const { cards, fetchCards } = useCustomerCreditCards(() => props.order.customerId)
let initializationRevision = 0
const editorRevision = ref(0)

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
const total = computed(() =>
    lines.value.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
)
const busy = computed(() => saving.value || savingAndCharging.value)
const canSave = computed(
    () =>
        Boolean(customer.value) &&
        !initializing.value &&
        !initializationError.value &&
        itemsValid.value &&
        selectedCardId.value !== null &&
        addressValid(billing.value) &&
        addressValid(shipping.value)
)

const money = (value: number): string =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: props.order.currency }).format(
        value
    )

function close(value: boolean): void {
    if (busy.value) return
    emit('update:modelValue', value)
}

function resetChildDialogs(): void {
    showBilling.value = false
    showShipping.value = false
    showAddCard.value = false
    showManageShipping.value = false
}

function selectShipping(payload: { id: number | null; address: CustomerOrderAddress }): void {
    shippingAddressId.value = payload.id
    shipping.value = payload.address
}

async function reloadCustomer(): Promise<void> {
    const response = await customerApi.getCustomerById(props.order.customerId)
    if (!response.data) throw new Error(response.message || 'Customer details are unavailable')
    customer.value = response.data
}

async function reloadCards(selectActive = false): Promise<void> {
    const loaded = await fetchCards()
    const selectedStillExists = loaded.some((card) => card.id === selectedCardId.value)
    if (selectActive || !selectedStillExists) {
        selectedCardId.value =
            (selectActive ? loaded.find((card) => card.isActive)?.id : undefined) ??
            loaded.find((card) => card.lastFour === props.order.payment.lastFour)?.id ??
            loaded.find((card) => card.isActive)?.id ??
            loaded[0]?.id ??
            null
    }
}

async function handleCardAdded(): Promise<void> {
    try {
        await Promise.all([reloadCustomer(), reloadCards(true)])
        if (customer.value) {
            billing.value = {
                firstName: customer.value.firstName,
                lastName: customer.value.lastName,
                company: customer.value.billing.company ?? '',
                address: customer.value.billing.address,
                city: customer.value.billing.city,
                stateCode: customer.value.billing.stateCode,
                postalCode: customer.value.billing.postalCode,
                countryCode: customer.value.billing.countryCode,
                phone: customer.value.phoneNumber,
                email: customer.value.email,
            }
        }
    } catch (error) {
        errorFromError(error, 'Card was added, but order payment details could not be refreshed')
    }
}

async function handleShippingChanged(): Promise<void> {
    try {
        await reloadCustomer()
    } catch (error) {
        errorFromError(
            error,
            'Shipping address changed, but customer details could not be refreshed'
        )
    }
}

async function initialize(): Promise<void> {
    const currentRevision = ++initializationRevision
    initializing.value = true
    initializationError.value = ''
    resetChildDialogs()
    itemsValid.value = false
    editorRevision.value += 1
    try {
        const initialLines = props.order.items.map<CustomerOrderDraftLine>((item) => ({
            organisationProductVariantId: item.sellerOrganisationProductVariantId,
            inventoryLocationId: item.inventoryLocationId,
            productName: item.sellerProductName,
            sku: item.sellerSku,
            unitPrice: item.unitPrice,
            available: 0,
            quantity: item.quantity,
        }))
        lines.value = initialLines.map((line) => ({ ...line }))
        reservedLines.value = initialLines.map((line) => ({ ...line }))
        billing.value = { ...props.order.payment.billing }
        shipping.value = { ...props.order.payment.shipping }
        shippingAddressId.value = null
        pickup.value = props.order.shippingMethod === 'PICKUP'
        notes.value = props.order.notes ?? ''
        selectedCardId.value = null
        await Promise.all([reloadCustomer(), reloadCards()])
        if (currentRevision !== initializationRevision) return
    } catch (error) {
        if (currentRevision !== initializationRevision) return
        initializationError.value = 'Failed to load the current order editing details.'
        errorFromError(error, initializationError.value)
    } finally {
        if (currentRevision === initializationRevision) initializing.value = false
    }
}

async function save(chargeAfterSave: boolean): Promise<void> {
    if (!canSave.value || busy.value || selectedCardId.value === null) return
    const busyState = chargeAfterSave ? savingAndCharging : saving
    busyState.value = true
    try {
        const response = await orderApi.updatePendingCustomerOrder(props.order.id, {
            creditCardId: selectedCardId.value,
            ...(shippingAddressId.value && !pickup.value
                ? { shippingAddressId: shippingAddressId.value }
                : {}),
            billingAddress: { ...billing.value },
            shippingAddress: { ...shipping.value },
            shippingMethod: pickup.value ? 'PICKUP' : 'SHIPPING',
            notes: notes.value.trim(),
            items: lines.value.map((line) => ({
                organisationProductVariantId: line.organisationProductVariantId,
                inventoryLocationId: line.inventoryLocationId,
                quantity: line.quantity,
            })),
        })
        if (!response.data) throw new Error(response.message || 'Failed to update order')

        if (!chargeAfterSave) {
            successFromResponse(response, 'Order updated successfully')
            emit('saved', response.data)
            emit('update:modelValue', false)
            return
        }

        let charged: Awaited<ReturnType<typeof orderApi.chargeCustomerOrder>>
        try {
            charged = await orderApi.chargeCustomerOrder(response.data.id, {
                idempotencyKey: `admin-customer-sale-charge-${response.data.id}-${crypto.randomUUID()}`,
            })
        } catch (error) {
            emit('saved', response.data)
            emit('update:modelValue', false)
            errorFromError(error, 'Order was updated, but the payment attempt could not be made')
            return
        }
        if (!charged.data) {
            emit('saved', response.data)
            emit('update:modelValue', false)
            errorFromError(
                new Error(charged.message || 'Payment response was unavailable'),
                'Order was updated, but the payment result could not be confirmed'
            )
            return
        }
        successFromResponse(charged, 'Order updated and payment attempt completed')
        emit('charged', charged.data)
        emit('update:modelValue', false)
    } catch (error) {
        errorFromError(
            error,
            chargeAfterSave ? 'Failed to update and charge order' : 'Failed to update order'
        )
    } finally {
        busyState.value = false
    }
}

watch(
    [() => props.modelValue, () => props.order.id, () => props.order.updatedAt],
    ([open]) => {
        if (open) void initialize()
        else {
            initializationRevision += 1
            resetChildDialogs()
        }
    },
    { immediate: true }
)
watch(showManageShipping, (open, wasOpen) => {
    if (wasOpen && !open && customer.value) showShipping.value = true
})
</script>
