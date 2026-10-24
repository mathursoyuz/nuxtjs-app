<template>
    <v-dialog
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
        max-width="1200"
        scrollable
        persistent
        transition="dialog-bottom-transition"
    >
        <v-card>
            <DialogsDialogHeader
                title="Edit customer"
                :organisation-name="
                    organisations?.find((item) => item.id === customerOrganisationId)?.name
                "
                entity-label="Customer"
                :entity-name="
                    fullCustomerData
                        ? `${fullCustomerData.firstName} ${fullCustomerData.lastName}`
                        : customer
                          ? `${customer.firstName} ${customer.lastName}`
                          : undefined
                "
                @close="$emit('update:modelValue', false)"
            />

            <v-divider></v-divider>

            <v-card-text class="pa-6">
                <v-tabs v-model="activeTab" bg-color="transparent">
                    <v-tab value="basic">Basic Info</v-tab>
                    <v-tab value="billing">Billing + Credit Card</v-tab>
                    <v-tab value="shipping">Shipping Addresses</v-tab>
                    <v-tab v-if="canReadMemberships" value="memberships">Memberships</v-tab>
                    <v-tab value="password">Change Password</v-tab>
                </v-tabs>

                <v-window v-model="activeTab" class="mt-4">
                    <template v-if="loadingCustomer">
                        <div class="text-center pa-8">
                            <v-progress-circular
                                indeterminate
                                color="primary"
                            ></v-progress-circular>
                            <div class="mt-4">Loading Customer Data...</div>
                        </div>
                    </template>
                    <template v-else-if="fullCustomerData">
                        <!-- Tab 1: Basic Info -->
                        <v-window-item value="basic">
                            <Suspense>
                                <EditCustomerBasicInfoTab
                                    :customer="customer"
                                    :full-customer-data="fullCustomerData"
                                    :organisation-id="organisationId"
                                    :organisations="organisations"
                                    @submit="handleTabSubmit"
                                    @cancel="$emit('update:modelValue', false)"
                                />
                                <template #fallback>
                                    <div class="text-center pa-8">
                                        <v-progress-circular
                                            indeterminate
                                            color="primary"
                                        ></v-progress-circular>
                                        <div class="mt-4">Loading Basic Info...</div>
                                    </div>
                                </template>
                            </Suspense>
                        </v-window-item>

                        <!-- Tab 2: Billing + Credit Card -->
                        <v-window-item value="billing">
                            <Suspense>
                                <EditCustomerBillingTab
                                    :customer="customer"
                                    :full-customer-data="fullCustomerData"
                                    :basic-values="basicValues"
                                    @submit="handleTabSubmit"
                                    @cancel="$emit('update:modelValue', false)"
                                />
                                <template #fallback>
                                    <div class="text-center pa-8">
                                        <v-progress-circular
                                            indeterminate
                                            color="primary"
                                        ></v-progress-circular>
                                        <div class="mt-4">Loading Billing Info...</div>
                                    </div>
                                </template>
                            </Suspense>
                        </v-window-item>

                        <!-- Tab 3: Shipping Addresses -->
                        <v-window-item value="shipping">
                            <Suspense>
                                <EditCustomerShippingTab
                                    :customer="customer"
                                    :full-customer-data="fullCustomerData"
                                    @submit="handleTabSubmit"
                                />
                                <template #fallback>
                                    <div class="text-center pa-8">
                                        <v-progress-circular
                                            indeterminate
                                            color="primary"
                                        ></v-progress-circular>
                                        <div class="mt-4">Loading Shipping Addresses...</div>
                                    </div>
                                </template>
                            </Suspense>
                        </v-window-item>

                        <!-- Tab 4: Memberships -->
                        <v-window-item v-if="canReadMemberships" value="memberships">
                            <Suspense>
                                <CustomerMembershipManager
                                    :organisation-id="fullCustomerData.organisationId"
                                    :customer-id="fullCustomerData.id"
                                    :customer-name="`${fullCustomerData.firstName} ${fullCustomerData.lastName}`"
                                    :can-write="canWriteMemberships"
                                    :active="activeTab === 'memberships'"
                                    @updated="emit('submit')"
                                />
                                <template #fallback>
                                    <div class="text-center pa-8">
                                        <v-progress-circular indeterminate color="primary" />
                                        <div class="mt-4">Loading Memberships...</div>
                                    </div>
                                </template>
                            </Suspense>
                        </v-window-item>

                        <!-- Tab 5: Change Password -->
                        <v-window-item value="password">
                            <Suspense>
                                <EditCustomerPasswordTab
                                    :customer="customer"
                                    :full-customer-data="fullCustomerData"
                                    @submit="handleTabSubmit"
                                    @cancel="$emit('update:modelValue', false)"
                                />
                                <template #fallback>
                                    <div class="text-center pa-8">
                                        <v-progress-circular
                                            indeterminate
                                            color="primary"
                                        ></v-progress-circular>
                                        <div class="mt-4">Loading Password Form...</div>
                                    </div>
                                </template>
                            </Suspense>
                        </v-window-item>
                    </template>
                </v-window>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { defineAsyncComponent } from 'vue'
import { useCustomer } from '~/composables/useCustomer'
import { useLoadingTask } from '~/composables/useLoadingTask'
import { useAccessStore } from '~/stores/access.store'
import { CUSTOMER_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS } from '~/components/memberships/membership.permissions'
import type { Customer } from '~/services/api/wrappers/customer.api'

// Lazy load tab components
const EditCustomerBasicInfoTab = defineAsyncComponent(
    () => import('./tabs/EditCustomerBasicInfoTab.vue')
)
const EditCustomerBillingTab = defineAsyncComponent(
    () => import('./tabs/EditCustomerBillingTab.vue')
)
const EditCustomerShippingTab = defineAsyncComponent(
    () => import('./tabs/EditCustomerShippingTab.vue')
)
const EditCustomerPasswordTab = defineAsyncComponent(
    () => import('./tabs/EditCustomerPasswordTab.vue')
)
const CustomerMembershipManager = defineAsyncComponent(
    () => import('~/components/memberships/CustomerMembershipManager.vue')
)

interface Props {
    modelValue: boolean
    customer: Customer | null
    organisationId?: number
    organisations?: Array<{ id: number; name: string }>
}

const props = defineProps<Props>()
const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    submit: []
}>()

const { fetchCustomerById } = useCustomer()
const access = useAccessStore()
const activeTab = ref('basic')
const loadingCustomer = ref(false)
const fullCustomerData = ref<Customer | null>(null)
const basicValues = ref<{
    firstName?: string
    lastName?: string
    phoneNumber?: string
}>({})
const customerOrganisationId = computed(
    () => fullCustomerData.value?.organisationId ?? props.customer?.organisationId ?? 0
)
const canReadMemberships = computed(
    () =>
        customerOrganisationId.value > 0 &&
        access.can(CUSTOMER_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS.READ, customerOrganisationId.value)
)
const canWriteMemberships = computed(
    () =>
        customerOrganisationId.value > 0 &&
        access.can(CUSTOMER_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS.WRITE, customerOrganisationId.value)
)

// Load customer data once when dialog opens
const loadCustomerData = async () => {
    if (!props.customer?.id) {
        fullCustomerData.value = null
        return
    }

    loadingCustomer.value = true
    try {
        const loadingTask = useLoadingTask('load-customer-data')
        const customer = await loadingTask.execute(async () => {
            return await fetchCustomerById(props.customer!.id)
        })

        if (customer) {
            fullCustomerData.value = customer
            basicValues.value = {
                firstName: customer.firstName,
                lastName: customer.lastName,
                phoneNumber: customer.phoneNumber,
            }
        }
    } catch (err) {
        console.error('Error loading customer data:', err)
        fullCustomerData.value = null
    } finally {
        loadingCustomer.value = false
    }
}

// Handle tab submit - refresh customer data
const handleTabSubmit = async () => {
    emit('submit')
    // Refresh customer data after successful update
    await loadCustomerData()
}

// Watch for dialog open/close
watch(
    () => props.modelValue,
    async (isOpen) => {
        if (isOpen && props.customer) {
            await loadCustomerData()
        } else if (!isOpen) {
            activeTab.value = 'basic'
            basicValues.value = {}
            fullCustomerData.value = null
        }
    },
    { immediate: true }
)

// Watch for customer prop changes
watch(
    () => props.customer,
    async (newCustomer) => {
        if (props.modelValue && newCustomer) {
            await loadCustomerData()
        }
    }
)
</script>

<style scoped>
/* Styles moved to individual tab components */
</style>
