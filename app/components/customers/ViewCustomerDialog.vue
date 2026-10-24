<template>
    <v-dialog
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
        max-width="1000"
        scrollable
        persistent
    >
        <v-card>
            <DialogsDialogHeader
                title="Customer details"
                entity-label="Customer"
                :entity-name="
                    currentCustomer
                        ? `${currentCustomer.firstName} ${currentCustomer.lastName}`
                        : undefined
                "
                @close="$emit('update:modelValue', false)"
            >
                <template #actions>
                    <v-btn
                        v-if="
                            organisationId && access.can(CUSTOMER_PERMISSIONS.WRITE, organisationId)
                        "
                        color="white"
                        variant="outlined"
                        prepend-icon="mdi-pencil"
                        @click="handleEdit"
                    >
                        Edit
                    </v-btn>
                </template>
            </DialogsDialogHeader>

            <v-divider />

            <v-card-text v-if="loading" class="pa-4">
                <v-skeleton-loader type="card" />
            </v-card-text>

            <v-card-text v-else-if="currentCustomer" class="pa-0">
                <v-tabs v-model="tab" class="px-4 pt-4">
                    <v-tab value="basic">Basic Information</v-tab>
                    <v-tab value="billing">Billing & Credit Cards</v-tab>
                    <v-tab value="shipping">Shipping Addresses</v-tab>
                </v-tabs>

                <v-window v-model="tab" class="pa-4">
                    <!-- Basic Information Tab -->
                    <v-window-item value="basic">
                        <v-row>
                            <v-col cols="12" md="4">
                                <v-img
                                    :src="getFullImageUrl(currentCustomer.avatar, 'customers')"
                                    height="300"
                                    cover
                                    class="rounded"
                                    :alt="`${currentCustomer.firstName} ${currentCustomer.lastName}`"
                                />
                            </v-col>
                            <v-col cols="12" md="8">
                                <v-list>
                                    <v-list-item>
                                        <v-list-item-title>Email</v-list-item-title>
                                        <v-list-item-subtitle>
                                            <a :href="`mailto:${currentCustomer.email}`">
                                                {{ currentCustomer.email }}
                                            </a>
                                        </v-list-item-subtitle>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-title>Phone Number</v-list-item-title>
                                        <v-list-item-subtitle>
                                            <a :href="`tel:${currentCustomer.phoneNumber}`">
                                                {{ currentCustomer.phoneNumber }}
                                            </a>
                                        </v-list-item-subtitle>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-title>Date of Birth</v-list-item-title>
                                        <v-list-item-subtitle>
                                            {{ currentCustomer.dob || 'N/A' }}
                                        </v-list-item-subtitle>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-title>CPI</v-list-item-title>
                                        <v-list-item-subtitle>
                                            {{ currentCustomer.cpi || 'N/A' }}
                                        </v-list-item-subtitle>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-title>App User</v-list-item-title>
                                        <v-list-item-subtitle>
                                            <v-chip
                                                :color="
                                                    currentCustomer.isAppUser
                                                        ? 'success'
                                                        : 'default'
                                                "
                                                size="small"
                                            >
                                                {{ currentCustomer.isAppUser ? 'Yes' : 'No' }}
                                            </v-chip>
                                        </v-list-item-subtitle>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-title>Status</v-list-item-title>
                                        <v-list-item-subtitle>
                                            <v-chip
                                                :color="
                                                    currentCustomer.isActive ? 'success' : 'error'
                                                "
                                                size="small"
                                            >
                                                {{
                                                    currentCustomer.isActive ? 'Active' : 'Inactive'
                                                }}
                                            </v-chip>
                                        </v-list-item-subtitle>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-title>QB Status</v-list-item-title>
                                        <v-list-item-subtitle>
                                            <v-chip
                                                :color="
                                                    currentCustomer.isQbSynced
                                                        ? 'success'
                                                        : 'warning'
                                                "
                                                size="small"
                                            >
                                                {{
                                                    currentCustomer.isQbSynced
                                                        ? 'Synced'
                                                        : 'Not Synced'
                                                }}
                                            </v-chip>
                                        </v-list-item-subtitle>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-title>Square Status</v-list-item-title>
                                        <v-list-item-subtitle>
                                            <v-chip
                                                :color="
                                                    currentCustomer.isSquareSynced
                                                        ? 'success'
                                                        : 'warning'
                                                "
                                                size="small"
                                            >
                                                {{
                                                    currentCustomer.isSquareSynced
                                                        ? 'Synced'
                                                        : 'Not Synced'
                                                }}
                                            </v-chip>
                                        </v-list-item-subtitle>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-title>Created At</v-list-item-title>
                                        <v-list-item-subtitle>
                                            {{ formatDate(currentCustomer.createdAt) }}
                                        </v-list-item-subtitle>
                                    </v-list-item>
                                </v-list>
                            </v-col>
                        </v-row>
                    </v-window-item>

                    <!-- Billing & Credit Cards Tab -->
                    <v-window-item value="billing">
                        <h3 class="text-h6 mb-4">Billing Address</h3>
                        <v-list class="mb-6">
                            <v-list-item>
                                <v-list-item-title>Company</v-list-item-title>
                                <v-list-item-subtitle>
                                    {{ currentCustomer.billing?.company || 'N/A' }}
                                </v-list-item-subtitle>
                            </v-list-item>
                            <v-list-item>
                                <v-list-item-title>Address</v-list-item-title>
                                <v-list-item-subtitle>
                                    {{ currentCustomer.billing?.address }},
                                    {{ currentCustomer.billing?.city }},
                                    {{ currentCustomer.billing?.stateCode }}
                                    {{ currentCustomer.billing?.postalCode }}
                                </v-list-item-subtitle>
                            </v-list-item>
                            <v-list-item>
                                <v-list-item-title>Country</v-list-item-title>
                                <v-list-item-subtitle>
                                    {{ currentCustomer.billing?.countryCode }}
                                </v-list-item-subtitle>
                            </v-list-item>
                        </v-list>

                        <v-divider class="my-4" />

                        <h3 class="text-h6 mb-4">Credit Cards</h3>
                        <v-table v-if="creditCards.length" density="compact">
                            <thead>
                                <tr>
                                    <th>Card</th>
                                    <th>Expiry</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="card in creditCards" :key="card.id">
                                    <td>•••• •••• •••• {{ card.lastFour }}</td>
                                    <td>{{ card.expMonth }}/{{ card.expYear }}</td>
                                    <td>
                                        <v-chip
                                            :color="card.isActive ? 'success' : 'default'"
                                            size="small"
                                        >
                                            {{ card.isActive ? 'Default / Active' : 'Inactive' }}
                                        </v-chip>
                                    </td>
                                </tr>
                            </tbody>
                        </v-table>
                        <v-alert v-else type="info" variant="tonal">
                            No credit cards on file.
                        </v-alert>
                    </v-window-item>

                    <!-- Shipping Addresses Tab -->
                    <v-window-item value="shipping">
                        <h3 class="text-h6 mb-4">Shipping Addresses</h3>
                        <v-alert v-if="!currentCustomer.shippingAddresses?.length" type="info">
                            No shipping addresses on file
                        </v-alert>
                        <v-list v-else>
                            <v-list-item
                                v-for="address in currentCustomer.shippingAddresses"
                                :key="address.id"
                                class="mb-2"
                            >
                                <v-list-item-title>
                                    {{ address.firstName }} {{ address.lastName }}
                                </v-list-item-title>
                                <v-list-item-subtitle>
                                    <div>{{ address.company || '' }}</div>
                                    <div>
                                        {{ address.address }}, {{ address.city }},
                                        {{ address.stateCode }} {{ address.postalCode }}
                                    </div>
                                    <div>{{ address.countryCode }}</div>
                                    <v-chip
                                        :color="address.isActive ? 'success' : 'default'"
                                        size="small"
                                        class="mt-1"
                                    >
                                        {{ address.isActive ? 'Active' : 'Inactive' }}
                                    </v-chip>
                                </v-list-item-subtitle>
                            </v-list-item>
                        </v-list>
                    </v-window-item>
                </v-window>
            </v-card-text>

            <v-card-text v-else class="pa-4">
                <v-alert type="error">Customer not found</v-alert>
            </v-card-text>

            <v-divider />

            <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn variant="outlined" @click="$emit('update:modelValue', false)">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCustomer } from '~/composables/useCustomer'
import { useCustomerCreditCards } from '~/composables/useCustomerCreditCards'
import { useAccessStore } from '~/stores/access.store'
import { CUSTOMER_PERMISSIONS } from '~/components/customers/customer.permissions'
import { getFullImageUrl } from '~/utils/image.util'
import { formatDate } from '~/utils/date.util'

interface Props {
    modelValue: boolean
    customerId: number | null
    organisationId: number | null
}

const props = defineProps<Props>()
const access = useAccessStore()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    edit: [customerId: number, organisationId: number]
}>()

const { currentCustomer, loading, fetchCustomerById } = useCustomer()
const { cards: creditCards, fetchCards } = useCustomerCreditCards(() => props.customerId)
const tab = ref('basic')

const handleEdit = () => {
    if (props.customerId && props.organisationId) {
        emit('edit', props.customerId, props.organisationId)
    }
}

watch(
    [() => props.modelValue, () => props.customerId],
    async ([isOpen, customerId]) => {
        if (isOpen && customerId) {
            await Promise.all([fetchCustomerById(customerId), fetchCards()])
        } else if (!isOpen) {
            tab.value = 'basic'
        }
    },
    { immediate: true }
)
</script>

<style scoped>
.gap-2 {
    gap: 8px;
}
</style>
