<template>
    <v-dialog
        :model-value="modelValue"
        max-width="1100"
        scrollable
        persistent
        transition="dialog-bottom-transition"
        @update:model-value="emit('update:modelValue', $event)"
    >
        <v-card>
            <v-card-title class="d-flex align-center pa-4">
                <span class="text-h5">Manage Shipping Addresses</span>
                <v-spacer />
                <v-btn icon="mdi-close" variant="text" @click="closeDialog" />
            </v-card-title>

            <v-divider />

            <v-card-text class="pa-6">
                <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-1">
                    <h3 class="text-h6">Shipping Addresses</h3>
                    <v-btn
                        color="primary"
                        prepend-icon="mdi-plus"
                        :disabled="hasReachedLimit || editingIndex !== null"
                        @click="addAddress"
                    >
                        Add New Address
                    </v-btn>
                </div>
                <p class="text-body-2 text-medium-emphasis mb-5">
                    You can save up to {{ MAX_SHIPPING_ADDRESSES }} shipping addresses.
                    {{ addresses.length }} of {{ MAX_SHIPPING_ADDRESSES }} used.
                </p>

                <v-alert v-if="hasReachedLimit" type="warning" variant="tonal" class="mb-4">
                    The maximum of {{ MAX_SHIPPING_ADDRESSES }} shipping addresses has been reached.
                    Delete an address before adding another.
                </v-alert>

                <v-row v-if="addresses.length">
                    <v-col
                        v-for="(address, index) in addresses"
                        :key="address.id || `new-${index}`"
                        cols="12"
                        md="6"
                    >
                        <v-card variant="outlined" height="100%">
                            <v-card-title class="d-flex align-center text-subtitle-1">
                                <span>Shipping Address {{ index + 1 }}</span>
                                <v-chip
                                    v-if="address.isActive"
                                    class="ml-2"
                                    color="success"
                                    size="x-small"
                                >
                                    Active
                                </v-chip>
                                <v-spacer />
                                <template v-if="editingIndex !== index">
                                    <v-btn
                                        icon="mdi-pencil"
                                        color="primary"
                                        size="small"
                                        variant="text"
                                        :disabled="editingIndex !== null"
                                        title="Edit shipping address"
                                        @click="startEdit(index)"
                                    />
                                    <v-btn
                                        icon="mdi-delete"
                                        color="error"
                                        size="small"
                                        variant="text"
                                        :disabled="editingIndex !== null"
                                        title="Delete shipping address"
                                        @click="requestDelete(index)"
                                    />
                                </template>
                            </v-card-title>

                            <v-card-text v-if="editingIndex !== index">
                                <div class="font-weight-medium">
                                    {{ address.firstName }} {{ address.lastName }}
                                </div>
                                <div v-if="address.company" class="text-medium-emphasis">
                                    {{ address.company }}
                                </div>
                                <div>{{ address.address }}</div>
                                <div>
                                    {{ address.city }}, {{ address.stateCode }}
                                    {{ address.postalCode }}
                                </div>
                                <div>{{ address.countryCode }}</div>
                            </v-card-text>

                            <v-card-text v-else>
                                <v-row dense>
                                    <v-col cols="12" sm="6">
                                        <v-text-field
                                            v-model="address.firstName"
                                            label="First Name *"
                                            variant="outlined"
                                            density="compact"
                                            :error-messages="fieldError('firstName')"
                                        />
                                    </v-col>
                                    <v-col cols="12" sm="6">
                                        <v-text-field
                                            v-model="address.lastName"
                                            label="Last Name *"
                                            variant="outlined"
                                            density="compact"
                                            :error-messages="fieldError('lastName')"
                                        />
                                    </v-col>
                                    <v-col cols="12">
                                        <v-text-field
                                            v-model="address.company"
                                            label="Company"
                                            variant="outlined"
                                            density="compact"
                                            :error-messages="fieldError('company')"
                                        />
                                    </v-col>
                                    <v-col cols="12">
                                        <v-text-field
                                            v-model="address.address"
                                            label="Address *"
                                            variant="outlined"
                                            density="compact"
                                            :error-messages="fieldError('address')"
                                        />
                                    </v-col>
                                    <v-col cols="12" sm="6">
                                        <v-text-field
                                            v-model="address.city"
                                            label="City *"
                                            variant="outlined"
                                            density="compact"
                                            :error-messages="fieldError('city')"
                                        />
                                    </v-col>
                                    <v-col cols="12" sm="6">
                                        <v-text-field
                                            v-model="address.postalCode"
                                            label="Postal Code *"
                                            variant="outlined"
                                            density="compact"
                                            :error-messages="fieldError('postalCode')"
                                        />
                                    </v-col>
                                    <v-col cols="12" sm="6">
                                        <v-select
                                            v-model="address.countryCode"
                                            :items="countryOptions"
                                            item-title="title"
                                            item-value="value"
                                            label="Country *"
                                            variant="outlined"
                                            density="compact"
                                            :error-messages="fieldError('countryCode')"
                                            @update:model-value="changeCountry(index, $event)"
                                        />
                                    </v-col>
                                    <v-col cols="12" sm="6">
                                        <v-select
                                            v-model="address.stateCode"
                                            :items="stateOptions(address.countryCode)"
                                            item-title="title"
                                            item-value="value"
                                            label="State *"
                                            variant="outlined"
                                            density="compact"
                                            :error-messages="fieldError('stateCode')"
                                        />
                                    </v-col>
                                    <v-col cols="12">
                                        <v-switch
                                            v-model="address.isActive"
                                            label="Active shipping address"
                                            color="primary"
                                            hide-details
                                        />
                                    </v-col>
                                </v-row>
                                <div class="d-flex justify-end ga-2 mt-2">
                                    <v-btn variant="text" @click="cancelEdit(index)">Cancel</v-btn>
                                    <v-btn
                                        color="primary"
                                        :loading="savingIndex === index"
                                        @click="saveAddress(index)"
                                    >
                                        {{ address.isNew ? 'Add Address' : 'Save Changes' }}
                                    </v-btn>
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

                <v-alert v-else type="info" variant="tonal">
                    No shipping addresses found. Use “Add New Address” to create one.
                </v-alert>
            </v-card-text>

            <v-divider />
            <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn variant="text" @click="closeDialog">Close</v-btn>
            </v-card-actions>
        </v-card>

        <ConfirmDialog
            v-model="showDeleteDialog"
            title="Delete Shipping Address"
            message="Are you sure you want to permanently delete this shipping address?"
            confirm-text="Delete"
            confirm-color="error"
            @confirm="deleteSelectedAddress"
            @cancel="deleteIndex = null"
        />
    </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ConfirmDialog from '~/components/dialogs/ConfirmDialog.vue'
import { useCountry } from '~/composables/useCountry'
import { useCustomer } from '~/composables/useCustomer'
import { useToast } from '~/composables/useToast'
import { customerShippingAddressSchema } from '~/schemas/customer.schema'
import { CUSTOMER_MESSAGES } from '~/constants/messages.constants'
import { CUSTOMER_LIMITS } from '~/constants/customer.constants'
import type { Customer, CustomerShippingAddress } from '~/services/api/wrappers/customer.api'

const MAX_SHIPPING_ADDRESSES = CUSTOMER_LIMITS.SHIPPING_ADDRESSES

type EditableShippingAddress = CustomerShippingAddress & {
    isNew?: boolean
}

interface Props {
    modelValue: boolean
    customer: Customer | null
    clientId: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    submit: []
}>()

const { fetchCustomerById, addShippingAddress, updateShippingAddress, deleteShippingAddress } =
    useCustomer()
const { countryOptions, fetchCountries, fetchStates } = useCountry()
const { success, errorFromError } = useToast()

const addresses = ref<EditableShippingAddress[]>([])
const originalAddress = ref<EditableShippingAddress | null>(null)
const editingIndex = ref<number | null>(null)
const savingIndex = ref<number | null>(null)
const deleteIndex = ref<number | null>(null)
const showDeleteDialog = ref(false)
const validationErrors = ref<Record<string, string>>({})
const stateOptionsCache = ref<Record<string, Array<{ title: string; value: string }>>>({})

const hasReachedLimit = computed(() => addresses.value.length >= MAX_SHIPPING_ADDRESSES)

function fieldError(field: string): string {
    return validationErrors.value[field] ?? ''
}

function stateOptions(countryCode: string): Array<{ title: string; value: string }> {
    return stateOptionsCache.value[countryCode] ?? []
}

async function ensureStates(countryCode: string): Promise<void> {
    if (!countryCode || stateOptionsCache.value[countryCode]) return
    const states = await fetchStates(countryCode)
    stateOptionsCache.value[countryCode] = states.map((state) => ({
        title: state.name,
        value: state.id,
    }))
}

async function changeCountry(index: number, countryCode: string): Promise<void> {
    const address = addresses.value[index]
    if (!address) return
    address.countryCode = countryCode
    address.stateCode = ''
    await ensureStates(countryCode)
}

function nextAddressType(): number {
    const usedTypes = new Set(addresses.value.map((address) => address.type))
    for (let type = 1; type <= MAX_SHIPPING_ADDRESSES; type += 1) {
        if (!usedTypes.has(type)) return type
    }
    return addresses.value.length + 1
}

function addAddress(): void {
    if (hasReachedLimit.value || !props.customer) return
    addresses.value.push({
        id: 0,
        customerId: props.customer.id,
        type: nextAddressType(),
        firstName: props.customer.firstName,
        lastName: props.customer.lastName,
        company: null,
        address: '',
        city: '',
        stateCode: '',
        postalCode: '',
        countryCode: '',
        isActive: true,
        createdAt: '',
        updatedAt: null,
        isNew: true,
    })
    editingIndex.value = addresses.value.length - 1
    validationErrors.value = {}
}

function startEdit(index: number): void {
    const address = addresses.value[index]
    if (!address) return
    originalAddress.value = structuredClone(address)
    editingIndex.value = index
    validationErrors.value = {}
}

function cancelEdit(index: number): void {
    const address = addresses.value[index]
    if (!address) return
    if (address.isNew) {
        addresses.value.splice(index, 1)
    } else if (originalAddress.value) {
        addresses.value[index] = structuredClone(originalAddress.value)
    }
    originalAddress.value = null
    editingIndex.value = null
    validationErrors.value = {}
}

function validateAddress(address: EditableShippingAddress): boolean {
    const result = customerShippingAddressSchema.safeParse(address)
    if (result.success) {
        validationErrors.value = {}
        return true
    }

    validationErrors.value = result.error.issues.reduce<Record<string, string>>((errors, issue) => {
        const field = String(issue.path[0] ?? '')
        if (field && !errors[field]) errors[field] = issue.message
        return errors
    }, {})
    return false
}

function addressPayload(address: EditableShippingAddress) {
    return {
        type: address.type,
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company?.trim() || null,
        address: address.address,
        city: address.city,
        stateCode: address.stateCode,
        postalCode: address.postalCode,
        countryCode: address.countryCode,
        isActive: address.isActive,
    }
}

async function saveAddress(index: number): Promise<void> {
    const address = addresses.value[index]
    if (!address || !props.customer || !validateAddress(address)) return

    savingIndex.value = index
    try {
        if (address.isNew) {
            await addShippingAddress(props.customer.id, addressPayload(address))
            success(CUSTOMER_MESSAGES.SHIPPING_ADD_SUCCESS)
        } else {
            await updateShippingAddress(props.customer.id, address.id, addressPayload(address))
            success(CUSTOMER_MESSAGES.SHIPPING_UPDATE_SUCCESS)
        }
        editingIndex.value = null
        originalAddress.value = null
        emit('submit')
        await loadAddresses()
    } catch (error) {
        errorFromError(error, CUSTOMER_MESSAGES.SHIPPING_SAVE_ERROR)
    } finally {
        savingIndex.value = null
    }
}

function requestDelete(index: number): void {
    deleteIndex.value = index
    showDeleteDialog.value = true
}

async function deleteSelectedAddress(): Promise<void> {
    const index = deleteIndex.value
    const address = index === null ? null : addresses.value[index]
    showDeleteDialog.value = false
    deleteIndex.value = null
    if (!address || !props.customer) return

    try {
        await deleteShippingAddress(props.customer.id, address.id)
        success(CUSTOMER_MESSAGES.SHIPPING_REMOVE_SUCCESS)
        emit('submit')
        await loadAddresses()
    } catch (error) {
        errorFromError(error, CUSTOMER_MESSAGES.SHIPPING_REMOVE_ERROR)
    }
}

async function loadAddresses(): Promise<void> {
    if (!props.customer) return
    const fullCustomer = await fetchCustomerById(props.customer.id)
    addresses.value = (fullCustomer.shippingAddresses ?? []).map((address) => ({ ...address }))
    await Promise.all(
        [...new Set(addresses.value.map((address) => address.countryCode).filter(Boolean))].map(
            ensureStates
        )
    )
}

function closeDialog(): void {
    emit('update:modelValue', false)
}

watch(
    [() => props.modelValue, () => props.customer?.id],
    async ([isOpen, customerId]) => {
        if (isOpen && customerId) {
            await fetchCountries()
            await loadAddresses()
        } else if (!isOpen) {
            addresses.value = []
            editingIndex.value = null
            originalAddress.value = null
            validationErrors.value = {}
        }
    },
    { immediate: true }
)
</script>
