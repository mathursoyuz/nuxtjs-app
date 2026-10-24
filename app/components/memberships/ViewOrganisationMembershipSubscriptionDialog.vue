<template>
    <v-dialog
        :model-value="modelValue"
        max-width="1000"
        scrollable
        @update:model-value="emit('update:modelValue', $event)"
    >
        <v-card>
            <DialogsDialogHeader
                :title="
                    details?.membershipName
                        ? `Platform Service history — ${details.membershipName}`
                        : 'Platform Service history'
                "
                :organisation-name="organisationName"
                entity-label="Organisation"
                :entity-name="organisationName"
                @close="emit('update:modelValue', false)"
            />
            <v-card-subtitle v-if="details?.membershipGroupName">
                {{ details.membershipGroupName }}
            </v-card-subtitle>
            <v-card-text>
                <v-progress-linear v-if="loading" indeterminate />
                <template v-else-if="details">
                    <v-row class="mb-4">
                        <v-col cols="6" md="3">
                            <div class="text-caption">Current service</div>
                            {{ details.membershipName }}
                        </v-col>
                        <v-col cols="6" md="3">
                            <div class="text-caption">Service group</div>
                            {{ details.membershipGroupName || '—' }}
                        </v-col>
                        <v-col cols="6" md="3">
                            <div class="text-caption">Status</div>
                            {{ details.status }}
                        </v-col>
                        <v-col cols="6" md="3">
                            <div class="text-caption">Price</div>
                            {{ formatMembershipMoney(details.priceAmount) }}
                        </v-col>
                        <v-col cols="6" md="3">
                            <div class="text-caption">Joined</div>
                            {{ details.joinedAtDisplay || details.joinedAt }}
                        </v-col>
                        <v-col cols="6" md="3">
                            <div class="text-caption">Period started</div>
                            {{ details.currentPeriodStartDisplay || details.currentPeriodStart }}
                        </v-col>
                        <v-col cols="6" md="3">
                            <div class="text-caption">Period end</div>
                            {{ details.currentPeriodEndDisplay || '—' }}
                        </v-col>
                        <v-col cols="6" md="3">
                            <div class="text-caption">Next renewal</div>
                            {{ details.nextChargeAtDisplay || '—' }}
                        </v-col>
                    </v-row>
                    <v-tabs v-model="tab">
                        <v-tab value="events">Events</v-tab>
                        <v-tab value="billing">Billing</v-tab>
                        <v-tab value="payments">Payments</v-tab>
                    </v-tabs>
                    <v-window v-model="tab">
                        <v-window-item value="events">
                            <v-table>
                                <thead>
                                    <tr>
                                        <th>Event</th>
                                        <th>Group</th>
                                        <th>From</th>
                                        <th>To / Service</th>
                                        <th>Current</th>
                                        <th>Actor</th>
                                        <th>Reason</th>
                                        <th>Date and time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="event in details.events" :key="event.id">
                                        <td>{{ event.eventType }}</td>
                                        <td>
                                            {{
                                                event.toMembershipGroupName ||
                                                event.membershipGroupName ||
                                                event.fromMembershipGroupName ||
                                                '—'
                                            }}
                                        </td>
                                        <td>{{ event.fromMembershipName || '—' }}</td>
                                        <td>
                                            {{
                                                event.toMembershipName ||
                                                event.membershipName ||
                                                '—'
                                            }}
                                        </td>
                                        <td>
                                            <v-chip
                                                v-if="event.isCurrentMembership"
                                                size="x-small"
                                                color="success"
                                            >
                                                Current
                                            </v-chip>
                                            <span v-else>—</span>
                                        </td>
                                        <td>{{ event.actorType }} {{ event.actorId }}</td>
                                        <td>{{ event.reason || '—' }}</td>
                                        <td>{{ event.createdAtDisplay || event.createdAt }}</td>
                                    </tr>
                                </tbody>
                            </v-table>
                        </v-window-item>
                        <v-window-item value="billing">
                            <v-table>
                                <thead>
                                    <tr>
                                        <th>Cycle</th>
                                        <th>Service</th>
                                        <th>Group</th>
                                        <th>Status</th>
                                        <th>Price</th>
                                        <th>Unused credit</th>
                                        <th>Credit used</th>
                                        <th>Charged</th>
                                        <th>Remaining credit</th>
                                        <th>Period</th>
                                        <th>Date and time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="cycle in details.billingCycles" :key="cycle.id">
                                        <td>{{ cycle.cycleType }}</td>
                                        <td>{{ cycle.membershipName || '—' }}</td>
                                        <td>{{ cycle.membershipGroupName || '—' }}</td>
                                        <td>{{ cycle.status }}</td>
                                        <td>
                                            {{ formatMembershipMoney(cycle.membershipPriceAmount) }}
                                        </td>
                                        <td>
                                            {{ formatMembershipMoney(cycle.unusedCreditAmount) }}
                                        </td>
                                        <td>
                                            {{ formatMembershipMoney(cycle.creditDiscountApplied) }}
                                        </td>
                                        <td>
                                            {{ formatMembershipMoney(cycle.finalAmountCharged) }}
                                        </td>
                                        <td>
                                            {{ formatMembershipMoney(cycle.remainingCreditAmount) }}
                                        </td>
                                        <td>
                                            {{ cycle.periodStartDisplay || cycle.periodStart }} —
                                            {{ cycle.periodEndDisplay || '—' }}
                                        </td>
                                        <td>{{ cycle.createdAtDisplay || cycle.createdAt }}</td>
                                    </tr>
                                </tbody>
                            </v-table>
                        </v-window-item>
                        <v-window-item value="payments">
                            <v-table>
                                <thead>
                                    <tr>
                                        <th>Status</th>
                                        <th>Amount</th>
                                        <th>Card</th>
                                        <th>Transaction / Error</th>
                                        <th>Date and time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        v-for="attempt in details.paymentAttempts"
                                        :key="attempt.id"
                                    >
                                        <td>{{ attempt.status }}</td>
                                        <td>{{ formatMembershipMoney(attempt.amount) }}</td>
                                        <td>
                                            {{
                                                attempt.lastFour ? `•••• ${attempt.lastFour}` : '—'
                                            }}
                                        </td>
                                        <td>
                                            {{
                                                attempt.providerTransactionId ||
                                                attempt.errorMessage ||
                                                '—'
                                            }}
                                        </td>
                                        <td>{{ attempt.createdAtDisplay || attempt.createdAt }}</td>
                                    </tr>
                                </tbody>
                            </v-table>
                        </v-window-item>
                    </v-window>
                </template>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn @click="emit('update:modelValue', false)">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMemberships } from '~/composables/useMemberships'
import { useToast } from '~/composables/useToast'
import { formatMembershipMoney } from '~/utils/membership.util'
import type { MembershipSubscription } from '~/types/membership.types'
const props = defineProps<{
    modelValue: boolean
    organisationId: number
    subscriptionId: number | null
    organisationName?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const manager = useMemberships()
const { errorFromError } = useToast()
const loading = ref(false)
const details = ref<MembershipSubscription | null>(null)
const tab = ref('events')
watch(
    () => [props.modelValue, props.subscriptionId] as const,
    async ([open, id]) => {
        if (!open || !id) return
        loading.value = true
        try {
            details.value =
                (await manager.getOrganisationSubscription(props.organisationId, id)).data ?? null
        } catch (error) {
            errorFromError(error, 'Unable to load membership history.')
        } finally {
            loading.value = false
        }
    },
    { immediate: true }
)
</script>
