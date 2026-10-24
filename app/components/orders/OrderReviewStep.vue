<template>
    <v-row>
        <v-col cols="12">
            <v-card variant="outlined">
                <v-card-title>Order items</v-card-title>
                <v-data-table :headers="headers" :items="lines" hide-default-footer>
                    <template #item.unitPrice="{ item }">{{ money(item.unitPrice) }}</template>
                    <template #item.total="{ item }">
                        {{ money(item.unitPrice * item.quantity) }}
                    </template>
                </v-data-table>
                <v-divider />
                <v-card-text class="d-flex justify-end">
                    <div class="text-right">
                        <div class="text-caption text-medium-emphasis">Order subtotal</div>
                        <div class="text-h5 text-primary">{{ money(subtotal) }}</div>
                    </div>
                </v-card-text>
            </v-card>
        </v-col>

        <v-col cols="12" md="6">
            <v-card variant="outlined" height="100%">
                <v-card-title class="d-flex align-center">
                    Billing address
                    <v-spacer />
                    <v-btn
                        size="small"
                        variant="text"
                        prepend-icon="mdi-pencil"
                        @click="emit('add-card')"
                    >
                        Change
                    </v-btn>
                </v-card-title>
                <v-card-text>
                    <div class="font-weight-medium">
                        {{ billing.firstName }} {{ billing.lastName }}
                    </div>
                    <div v-if="billing.company">{{ billing.company }}</div>
                    <div>{{ billing.address }}</div>
                    <div>{{ billing.city }}, {{ billing.stateCode }} {{ billing.postalCode }}</div>
                    <div>{{ billing.countryCode }}</div>
                </v-card-text>
            </v-card>
        </v-col>

        <v-col cols="12" md="6">
            <v-card variant="outlined" height="100%">
                <v-card-title class="d-flex align-center">
                    Shipping address
                    <v-spacer />
                    <v-btn
                        size="small"
                        variant="text"
                        prepend-icon="mdi-map-marker"
                        @click="emit('change-shipping')"
                    >
                        Change
                    </v-btn>
                </v-card-title>
                <v-card-text>
                    <div class="font-weight-medium">
                        {{ shipping.firstName }} {{ shipping.lastName }}
                    </div>
                    <div v-if="shipping.company">{{ shipping.company }}</div>
                    <div>{{ shipping.address }}</div>
                    <div>
                        {{ shipping.city }}, {{ shipping.stateCode }} {{ shipping.postalCode }}
                    </div>
                    <div>{{ shipping.countryCode }}</div>
                </v-card-text>
            </v-card>
        </v-col>

        <v-col cols="12">
            <v-card variant="outlined">
                <v-card-title class="d-flex align-center">
                    Payment card
                    <v-spacer />
                    <v-btn
                        color="primary"
                        variant="tonal"
                        prepend-icon="mdi-credit-card-plus"
                        @click="emit('add-card')"
                    >
                        Add new card
                    </v-btn>
                </v-card-title>
                <v-card-text>
                    <v-progress-linear v-if="loadingCards" indeterminate class="mb-4" />
                    <v-radio-group
                        :model-value="selectedCardId"
                        @update:model-value="emit('update:selectedCardId', Number($event))"
                    >
                        <v-card
                            v-for="card in cards"
                            :key="card.id"
                            :color="selectedCardId === card.id ? 'primary' : undefined"
                            :variant="selectedCardId === card.id ? 'tonal' : 'outlined'"
                            class="mb-2 cursor-pointer"
                            @click="emit('update:selectedCardId', card.id)"
                        >
                            <v-card-text class="d-flex align-center ga-3">
                                <v-radio :value="card.id" @click.stop />
                                <v-icon icon="mdi-credit-card" />
                                <div>
                                    <div class="font-weight-medium">
                                        Card ending {{ card.lastFour }}
                                    </div>
                                    <div class="text-caption text-medium-emphasis">
                                        Expires {{ card.expMonth }}/{{ card.expYear }}
                                        <span v-if="card.isActive">· Default card</span>
                                    </div>
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-radio-group>
                    <v-alert
                        v-if="!loadingCards && cards.length === 0"
                        type="warning"
                        variant="tonal"
                    >
                        Add a payment card before charging this order.
                    </v-alert>
                </v-card-text>
            </v-card>
        </v-col>

        <v-col cols="12">
            <v-textarea v-model="notes" label="Order notes" rows="2" variant="outlined" />
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CustomerCreditCard } from '~/services/api/wrappers/customer-credit-card.api'
import type { CustomerOrderAddress, CustomerOrderDraftLine } from '~/types/order.types'

const props = defineProps<{
    lines: CustomerOrderDraftLine[]
    billing: CustomerOrderAddress
    shipping: CustomerOrderAddress
    cards: CustomerCreditCard[]
    selectedCardId: number | null
    loadingCards: boolean
}>()
const emit = defineEmits<{
    'update:selectedCardId': [value: number]
    'add-card': []
    'change-shipping': []
}>()

const headers = [
    { title: 'Product', key: 'productName' },
    { title: 'SKU', key: 'sku' },
    { title: 'Quantity', key: 'quantity' },
    { title: 'Unit price', key: 'unitPrice' },
    { title: 'Total', key: 'total', sortable: false },
]
const subtotal = computed(() =>
    props.lines.reduce((total, line) => total + line.unitPrice * line.quantity, 0)
)
const money = (value: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}
const notes = defineModel<string>('notes', { required: true })
</script>
