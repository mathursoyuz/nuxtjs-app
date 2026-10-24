<template>
    <v-card v-if="subscription" variant="outlined" class="mb-4">
        <v-card-text class="d-flex align-center justify-space-between ga-3">
            <div>
                <div class="font-weight-medium">{{ subscription.membershipName }}</div>
                <div class="text-body-2 text-medium-emphasis">
                    {{
                        subscription.isChargeable
                            ? formatMembershipMoney(subscription.priceAmount)
                            : 'Free'
                    }}
                    · {{ subscription.billingInterval.replaceAll('_', ' ') }} · Tier
                    {{ subscription.tierRank }}
                </div>
            </div>
            <v-chip size="small" variant="tonal">{{ subscription.status }}</v-chip>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { formatMembershipMoney } from '~/utils/membership.util'
import type { MembershipSubscription } from '~/types/membership.types'

defineProps<{ subscription: MembershipSubscription | null }>()
</script>
