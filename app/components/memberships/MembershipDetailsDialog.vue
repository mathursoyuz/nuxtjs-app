<template>
    <v-dialog
        :model-value="modelValue"
        max-width="860"
        scrollable
        @update:model-value="emit('update:modelValue', $event)"
    >
        <v-card>
            <DialogsDialogHeader
                title="Membership details"
                entity-label="Membership"
                :entity-name="membership?.name"
                @close="emit('update:modelValue', false)"
            >
                <template #actions>
                    <v-chip v-if="membership" color="white" variant="outlined">
                        {{
                            membership.isChargeable
                                ? formatMembershipMoney(membership.priceAmount)
                                : 'Free'
                        }}
                    </v-chip>
                </template>
            </DialogsDialogHeader>
            <v-img
                v-if="image"
                :src="image"
                height="240"
                cover
                :alt="membership?.name ?? 'Membership'"
            />
            <v-card-subtitle v-if="membership">
                {{ billingLabel(membership.billingInterval) }}
            </v-card-subtitle>
            <v-card-text>
                <p class="text-body-1 mb-5">
                    {{ membership?.description || 'No description is available.' }}
                </p>

                <h3 class="text-subtitle-1 font-weight-bold mb-2">Benefits and discounts</h3>
                <v-progress-linear v-if="loading" indeterminate class="mb-3" />
                <v-list v-else-if="benefitLines.length" density="compact">
                    <v-list-item
                        v-for="benefit in benefitLines"
                        :key="benefit"
                        prepend-icon="mdi-check-circle-outline"
                        :title="benefit"
                    />
                </v-list>
                <div v-else class="text-body-2 text-medium-emphasis">
                    No product or discount benefits are configured.
                </div>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn @click="emit('update:modelValue', false)">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useMemberships } from '~/composables/useMemberships'
import { useToast } from '~/composables/useToast'
import { formatMembershipMoney, membershipDiscountFromStorage } from '~/utils/membership.util'
import type {
    Membership,
    MembershipBillingInterval,
    MembershipDiscountType,
    MembershipProductBenefit,
} from '~/types/membership.types'

const props = defineProps<{
    modelValue: boolean
    organisationId: number
    membership: Membership | null
}>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const manager = useMemberships()
const { errorFromError } = useToast()
const productBenefits = ref<MembershipProductBenefit[]>([])
const loading = ref(false)

const image = computed(
    () => props.membership?.bannerImage || props.membership?.thumbnailImage || null
)

const discountLabel = (type: MembershipDiscountType, value: number): string => {
    if (type === 'NONE') return 'No discount'
    const normalized = membershipDiscountFromStorage(type, value)
    return type === 'PERCENTAGE' ? `${normalized}% off` : `${formatMembershipMoney(value)} off`
}

const benefitLines = computed(() => {
    if (!props.membership) return []
    const lines: string[] = []
    if (props.membership.defaultDiscountType && props.membership.defaultDiscountType !== 'NONE') {
        lines.push(
            `${discountLabel(
                props.membership.defaultDiscountType,
                props.membership.defaultDiscountValue ?? 0
            )} eligible purchases by default`
        )
    }
    for (const benefit of productBenefits.value) {
        lines.push(`${benefit.name}: ${discountLabel(benefit.discountType, benefit.discountValue)}`)
    }
    if (!productBenefits.value.length) {
        for (const rule of props.membership.categoryRules ?? []) {
            lines.push(`Category benefit: ${discountLabel(rule.discountType, rule.discountValue)}`)
        }
    }
    return [...new Set(lines)]
})

const billingLabel = (interval: MembershipBillingInterval): string => {
    const labels: Record<MembershipBillingInterval, string> = {
        ONE_TIME: 'One-time membership',
        DAILY: 'Billed daily',
        WEEKLY: 'Billed weekly',
        MONTHLY: 'Billed monthly',
        SEMI_ANNUAL: 'Billed every six months',
        YEARLY: 'Billed yearly',
    }
    return labels[interval]
}

const loadBenefits = async (): Promise<void> => {
    if (!props.membership) return
    loading.value = true
    try {
        productBenefits.value =
            (await manager.getMembershipProducts(props.organisationId, props.membership.id)).data ??
            []
    } catch (error) {
        productBenefits.value = []
        errorFromError(error, 'Unable to load membership benefits.')
    } finally {
        loading.value = false
    }
}

watch(
    () => [props.modelValue, props.membership?.id] as const,
    ([open]) => {
        if (open) void loadBenefits()
        else productBenefits.value = []
    },
    { immediate: true }
)
</script>
