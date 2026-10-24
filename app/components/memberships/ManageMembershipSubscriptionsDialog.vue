<template>
    <v-dialog
        :model-value="modelValue"
        max-width="1180"
        persistent
        scrollable
        @update:model-value="emit('update:modelValue', $event)"
    >
        <v-card>
            <DialogsDialogHeader
                :title="audience === 'CUSTOMER' ? 'Manage memberships' : 'Manage Platform Services'"
                :entity-label="audience === 'CUSTOMER' ? 'Customer' : 'Organisation'"
                :entity-name="subjectName"
                :close-disabled="submitting"
                @close="close"
            />
            <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                    A subscriber may have one membership per group and memberships from several
                    groups. Upgrades and downgrades stay within their current group. Moving between
                    groups is handled by cancelling one group and joining another.
                </v-alert>
                <v-alert
                    v-if="needsCard && !hasActiveCards"
                    type="error"
                    variant="tonal"
                    class="mb-4"
                >
                    Add an active credit card before joining, rejoining, upgrading, or downgrading.
                </v-alert>

                <section v-for="group in groups" :key="group.id" class="mb-6">
                    <div class="d-flex align-center justify-space-between ga-3 mb-2">
                        <div>
                            <div class="text-h6">{{ group.name }}</div>
                            <div class="text-caption text-medium-emphasis">
                                {{ currentLabel(group) }}
                            </div>
                        </div>
                        <v-chip
                            :color="operationColor(operationFor(group))"
                            size="small"
                            variant="tonal"
                        >
                            {{ operationLabel(operationFor(group)) }}
                        </v-chip>
                    </div>

                    <v-alert
                        v-if="isLocked(group)"
                        type="warning"
                        variant="tonal"
                        density="compact"
                        class="mb-3"
                    >
                        This subscription is {{ group.subscription?.status.toLowerCase() }} and
                        cannot be changed until that state is resolved.
                    </v-alert>

                    <v-radio-group
                        :model-value="selections[group.id]"
                        hide-details
                        @update:model-value="setSelection(group, $event)"
                    >
                        <v-row dense>
                            <v-col cols="12" sm="6" md="4">
                                <v-card
                                    :color="selections[group.id] === 0 ? 'primary' : undefined"
                                    :variant="selections[group.id] === 0 ? 'tonal' : 'outlined'"
                                    height="100%"
                                    class="cursor-pointer"
                                    @click="setSelection(group, 0)"
                                >
                                    <v-card-text class="d-flex align-start ga-2">
                                        <v-radio :value="0" hide-details @click.stop />
                                        <div>
                                            <div class="font-weight-medium">
                                                {{
                                                    group.subscription
                                                        ? 'No new change'
                                                        : 'No membership'
                                                }}
                                            </div>
                                            <div class="text-caption text-medium-emphasis">
                                                {{ noChangeLabel(group) }}
                                            </div>
                                        </div>
                                    </v-card-text>
                                </v-card>
                            </v-col>

                            <v-col
                                v-for="membership in group.memberships"
                                :key="membership.id"
                                cols="12"
                                sm="6"
                                md="4"
                            >
                                <v-card
                                    :color="
                                        selections[group.id] === membership.id
                                            ? 'primary'
                                            : undefined
                                    "
                                    :variant="
                                        selections[group.id] === membership.id
                                            ? 'tonal'
                                            : 'outlined'
                                    "
                                    height="100%"
                                    :class="{
                                        'cursor-pointer': !isLocked(group),
                                        'opacity-60': isLocked(group),
                                    }"
                                    @click="selectMembership(group, membership.id)"
                                >
                                    <v-card-text class="d-flex align-start ga-2">
                                        <v-radio
                                            :value="membership.id"
                                            :disabled="isLocked(group)"
                                            hide-details
                                            @click.stop
                                        />
                                        <div class="flex-grow-1">
                                            <div
                                                class="d-flex justify-space-between align-center ga-2"
                                            >
                                                <span class="font-weight-medium">
                                                    {{ membership.name }}
                                                </span>
                                                <v-chip
                                                    v-if="
                                                        group.subscription?.membershipId ===
                                                        membership.id
                                                    "
                                                    size="x-small"
                                                    color="info"
                                                    variant="tonal"
                                                >
                                                    Current
                                                </v-chip>
                                            </div>
                                            <div class="text-body-2">
                                                {{
                                                    membership.isChargeable
                                                        ? formatMembershipMoney(
                                                              membership.priceAmount
                                                          )
                                                        : 'Free'
                                                }}
                                                · Tier {{ membership.tierRank }}
                                            </div>
                                            <div class="text-caption text-medium-emphasis mt-1">
                                                {{ membership.tooltip || membership.description }}
                                            </div>
                                        </div>
                                    </v-card-text>
                                </v-card>
                            </v-col>

                            <v-col
                                v-if="group.subscription?.status === MEMBERSHIP_STATUS.ACTIVE"
                                cols="12"
                                sm="6"
                                md="4"
                            >
                                <v-card
                                    :color="selections[group.id] === 'CANCEL' ? 'error' : undefined"
                                    :variant="
                                        selections[group.id] === 'CANCEL' ? 'tonal' : 'outlined'
                                    "
                                    height="100%"
                                    class="cursor-pointer"
                                    @click="setSelection(group, 'CANCEL')"
                                >
                                    <v-card-text class="d-flex align-start ga-2">
                                        <v-radio
                                            value="CANCEL"
                                            color="error"
                                            hide-details
                                            @click.stop
                                        />
                                        <div>
                                            <div class="font-weight-medium">Cancel membership</div>
                                            <div class="text-caption text-medium-emphasis">
                                                Cancellation takes effect at the current period end.
                                            </div>
                                        </div>
                                    </v-card-text>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-radio-group>

                    <div v-if="operationFor(group) === 'DOWNGRADE'" class="mt-3">
                        <v-checkbox
                            v-model="immediateDowngrades[group.id]"
                            label="Apply this downgrade immediately"
                            color="primary"
                            hide-details
                        />
                        <v-checkbox
                            v-if="requiresForfeiture(group)"
                            v-model="forfeitConfirmations[group.id]"
                            color="warning"
                            :label="`The subscriber agrees to forfeit ${formatMembershipMoney(breakdownFor(group).forfeitedCreditAmount)} remaining credit in ${group.name}.`"
                        />
                    </div>
                </section>

                <v-alert v-if="!groups.length" type="info" variant="tonal">
                    No membership groups are currently available.
                </v-alert>

                <template v-if="breakdowns.length">
                    <v-divider class="my-5" />
                    <h3 class="text-h6 mb-3">Change summary</h3>
                    <v-table density="compact" class="mb-4">
                        <thead>
                            <tr>
                                <th>Group</th>
                                <th>Change</th>
                                <th class="text-right">Current price</th>
                                <th class="text-right">New price</th>
                                <th class="text-right">Unused</th>
                                <th class="text-right">Credit applied</th>
                                <th class="text-right">Forfeited</th>
                                <th class="text-right">Charge now</th>
                                <th>Effective</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in breakdowns" :key="item.group.id">
                                <td>{{ item.group.name }}</td>
                                <td>{{ operationLabel(item.breakdown.operation) }}</td>
                                <td class="text-right">
                                    {{ formatMembershipMoney(item.breakdown.existingPriceAmount) }}
                                </td>
                                <td class="text-right">
                                    {{ formatMembershipMoney(item.breakdown.newPriceAmount) }}
                                </td>
                                <td class="text-right">
                                    {{ formatMembershipMoney(item.breakdown.unusedCreditAmount) }}
                                </td>
                                <td class="text-right">
                                    {{
                                        formatMembershipMoney(item.breakdown.creditDiscountApplied)
                                    }}
                                </td>
                                <td class="text-right">
                                    {{
                                        formatMembershipMoney(item.breakdown.forfeitedCreditAmount)
                                    }}
                                </td>
                                <td class="text-right">
                                    {{ formatMembershipMoney(item.breakdown.finalAmountCharged) }}
                                </td>
                                <td>{{ item.breakdown.effectiveAt }}</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr class="font-weight-bold">
                                <td colspan="4">Combined totals</td>
                                <td class="text-right">
                                    {{ formatMembershipMoney(totals.unusedCreditAmount) }}
                                </td>
                                <td class="text-right">
                                    {{ formatMembershipMoney(totals.creditDiscountApplied) }}
                                </td>
                                <td class="text-right">
                                    {{ formatMembershipMoney(totals.forfeitedCreditAmount) }}
                                </td>
                                <td class="text-right">
                                    {{ formatMembershipMoney(totals.finalAmountCharged) }}
                                </td>
                                <td />
                            </tr>
                        </tfoot>
                    </v-table>

                    <PaymentCardSelectionTiles
                        v-if="needsCard"
                        v-model="creditCardId"
                        :cards="cards"
                    />
                    <v-textarea v-model="reason" label="Reason for these changes (optional)" />
                    <div class="text-caption text-medium-emphasis">
                        Each membership keeps its own billing cycle, order, payment, and history
                        record.
                    </div>
                </template>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" :disabled="submitting" @click="close">Close</v-btn>
                <v-btn
                    color="primary"
                    :loading="submitting"
                    :disabled="submitDisabled"
                    @click="submit"
                >
                    Apply {{ breakdowns.length }} change{{ breakdowns.length === 1 ? '' : 's' }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import PaymentCardSelectionTiles from './PaymentCardSelectionTiles.vue'
import { MEMBERSHIP_STATUS } from '~/constants/membership.constants'
import { useMemberships } from '~/composables/useMemberships'
import { useToast } from '~/composables/useToast'
import {
    groupMembershipOptions,
    membershipBatchBreakdown,
    membershipBatchOperation,
    type MembershipBatchGroup,
    type MembershipBatchOperation,
} from '~/utils/membership-batch.util'
import { formatMembershipMoney } from '~/utils/membership.util'
import type { Membership, MembershipSubscription } from '~/types/membership.types'

interface SelectablePaymentCard {
    id: number
    lastFour: string
    expMonth: string
    expYear: string
    isActive: boolean
}

const props = defineProps<{
    modelValue: boolean
    audience: 'CUSTOMER' | 'ORGANISATION'
    organisationId: number
    customerId?: number
    subjectName?: string
    memberships: Membership[]
    subscriptions: MembershipSubscription[]
    cards: SelectablePaymentCard[]
}>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; saved: [] }>()
const manager = useMemberships()
const { success, errorFromError } = useToast()
const selections = ref<Record<number, number | 'CANCEL'>>({})
const immediateDowngrades = ref<Record<number, boolean>>({})
const forfeitConfirmations = ref<Record<number, boolean>>({})
const creditCardId = ref<number>()
const reason = ref('')
const submitting = ref(false)

const groups = computed(() => groupMembershipOptions(props.memberships, props.subscriptions))
const operationFor = (group: MembershipBatchGroup): MembershipBatchOperation =>
    membershipBatchOperation(group, selections.value[group.id])
const breakdownFor = (group: MembershipBatchGroup) =>
    membershipBatchBreakdown(
        group,
        selections.value[group.id],
        immediateDowngrades.value[group.id] ?? false
    )
const breakdowns = computed(() =>
    groups.value
        .map((group) => ({ group, breakdown: breakdownFor(group) }))
        .filter((item) => item.breakdown.operation !== 'KEEP')
)
const totals = computed(() =>
    breakdowns.value.reduce(
        (total, item) => ({
            unusedCreditAmount: total.unusedCreditAmount + item.breakdown.unusedCreditAmount,
            creditDiscountApplied:
                total.creditDiscountApplied + item.breakdown.creditDiscountApplied,
            forfeitedCreditAmount:
                total.forfeitedCreditAmount + item.breakdown.forfeitedCreditAmount,
            finalAmountCharged: total.finalAmountCharged + item.breakdown.finalAmountCharged,
        }),
        {
            unusedCreditAmount: 0,
            creditDiscountApplied: 0,
            forfeitedCreditAmount: 0,
            finalAmountCharged: 0,
        }
    )
)
const needsCard = computed(() =>
    breakdowns.value.some((item) => item.breakdown.operation !== 'CANCEL')
)
const hasActiveCards = computed(() => props.cards.some((card) => card.isActive))
const hasMissingForfeiture = computed(() =>
    breakdowns.value.some(
        ({ group, breakdown }) =>
            breakdown.operation === 'DOWNGRADE' &&
            (immediateDowngrades.value[group.id] ?? false) &&
            breakdown.forfeitedCreditAmount > 0 &&
            !forfeitConfirmations.value[group.id]
    )
)
const submitDisabled = computed(
    () =>
        submitting.value ||
        breakdowns.value.length === 0 ||
        (needsCard.value && (!hasActiveCards.value || !creditCardId.value)) ||
        hasMissingForfeiture.value
)

const isLocked = (group: MembershipBatchGroup): boolean =>
    Boolean(
        group.subscription &&
        group.subscription.status !== MEMBERSHIP_STATUS.ACTIVE &&
        group.subscription.status !== MEMBERSHIP_STATUS.CANCELLED
    )
const currentLabel = (group: MembershipBatchGroup): string => {
    if (!group.subscription) return 'No current membership in this group'
    const cancellation = group.subscription.cancelAtPeriodEnd ? ' · cancellation scheduled' : ''
    return `Current: ${group.subscription.membershipName} · ${group.subscription.status}${cancellation}`
}
const noChangeLabel = (group: MembershipBatchGroup): string => {
    if (!group.subscription) return 'Remain unsubscribed from this group.'
    if (group.subscription.status === MEMBERSHIP_STATUS.CANCELLED) return 'Remain cancelled.'
    return 'Keep the current subscription and any already scheduled change.'
}
const operationLabel = (operation: MembershipBatchOperation): string =>
    ({
        KEEP: 'No change',
        JOIN: 'Join',
        REJOIN: 'Rejoin',
        UPGRADE: 'Upgrade',
        DOWNGRADE: 'Downgrade',
        CANCEL: 'Cancel',
    })[operation]
const operationColor = (operation: MembershipBatchOperation): string =>
    operation === 'CANCEL'
        ? 'error'
        : operation === 'DOWNGRADE'
          ? 'warning'
          : operation === 'KEEP'
            ? 'default'
            : 'success'
const setSelection = (group: MembershipBatchGroup, value: unknown): void => {
    if (isLocked(group) && value !== 0) return
    const selection = value === 'CANCEL' ? 'CANCEL' : Number(value)
    selections.value = { ...selections.value, [group.id]: selection }
    if (membershipBatchOperation(group, selection) !== 'DOWNGRADE') {
        immediateDowngrades.value = { ...immediateDowngrades.value, [group.id]: false }
        forfeitConfirmations.value = { ...forfeitConfirmations.value, [group.id]: false }
    }
}
const selectMembership = (group: MembershipBatchGroup, membershipId: number): void => {
    if (!isLocked(group)) setSelection(group, membershipId)
}
const requiresForfeiture = (group: MembershipBatchGroup): boolean =>
    Boolean(immediateDowngrades.value[group.id] && breakdownFor(group).forfeitedCreditAmount > 0)

const reset = (): void => {
    selections.value = Object.fromEntries(
        groups.value.map((group) => [
            group.id,
            group.subscription?.status === MEMBERSHIP_STATUS.ACTIVE
                ? group.subscription.membershipId
                : 0,
        ])
    )
    immediateDowngrades.value = {}
    forfeitConfirmations.value = {}
    creditCardId.value = props.cards.find((card) => card.isActive)?.id
    reason.value = ''
}

const execute = async (group: MembershipBatchGroup): Promise<void> => {
    const operation = operationFor(group)
    const selected = selections.value[group.id]
    const membershipId = typeof selected === 'number' ? selected : 0
    const subscriptionId = group.subscription?.id
    if (props.audience === 'CUSTOMER') {
        if (!props.customerId) throw new Error('Customer is required to manage memberships.')
        if (operation === 'JOIN')
            await manager.joinCustomerMembership(
                props.organisationId,
                props.customerId,
                membershipId,
                creditCardId.value
            )
        else if (operation === 'REJOIN')
            await manager.rejoinCustomerMembership(
                props.organisationId,
                props.customerId,
                membershipId,
                creditCardId.value
            )
        else if (operation === 'UPGRADE' && subscriptionId)
            await manager.upgradeCustomerMembership(
                props.organisationId,
                props.customerId,
                subscriptionId,
                membershipId,
                creditCardId.value,
                reason.value || undefined
            )
        else if (operation === 'DOWNGRADE' && subscriptionId)
            await manager.downgradeCustomerMembership(
                props.organisationId,
                props.customerId,
                subscriptionId,
                membershipId,
                creditCardId.value,
                reason.value || undefined,
                immediateDowngrades.value[group.id] ?? false,
                forfeitConfirmations.value[group.id] ?? false
            )
        else if (operation === 'CANCEL' && subscriptionId)
            await manager.cancelCustomerMembership(
                props.organisationId,
                subscriptionId,
                reason.value || undefined
            )
        return
    }
    if (operation === 'JOIN')
        await manager.joinOrganisationMembership(
            props.organisationId,
            membershipId,
            creditCardId.value
        )
    else if (operation === 'REJOIN')
        await manager.rejoinOrganisationMembership(
            props.organisationId,
            membershipId,
            creditCardId.value
        )
    else if (operation === 'UPGRADE' && subscriptionId)
        await manager.upgradeOrganisationMembership(
            props.organisationId,
            subscriptionId,
            membershipId,
            creditCardId.value,
            reason.value || undefined
        )
    else if (operation === 'DOWNGRADE' && subscriptionId)
        await manager.downgradeOrganisationMembership(
            props.organisationId,
            subscriptionId,
            membershipId,
            creditCardId.value,
            reason.value || undefined,
            immediateDowngrades.value[group.id] ?? false,
            forfeitConfirmations.value[group.id] ?? false
        )
    else if (operation === 'CANCEL' && subscriptionId)
        await manager.cancelOrganisationMembership(
            props.organisationId,
            subscriptionId,
            reason.value || undefined
        )
}

const submit = async (): Promise<void> => {
    if (submitDisabled.value) return
    submitting.value = true
    const failures: unknown[] = []
    let succeeded = 0
    for (const { group } of breakdowns.value) {
        try {
            await execute(group)
            succeeded += 1
        } catch (error) {
            failures.push(error)
        }
    }
    submitting.value = false
    if (succeeded > 0) {
        success(
            `${succeeded} membership change${succeeded === 1 ? '' : 's'} completed successfully.`
        )
        emit('saved')
    }
    if (failures.length > 0) {
        errorFromError(
            failures[0],
            `${failures.length} membership change${failures.length === 1 ? '' : 's'} could not be completed.`
        )
    }
    if (failures.length === 0 || succeeded > 0) close()
}
const close = (): void => {
    emit('update:modelValue', false)
}

watch(
    () => [props.modelValue, props.memberships, props.subscriptions, props.cards] as const,
    ([open]) => {
        if (open) reset()
    },
    { immediate: true }
)
</script>
