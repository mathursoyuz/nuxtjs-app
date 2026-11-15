<template>
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
                <td class="text-right">{{ formatMembershipMoney(item.breakdown.existingPriceAmount) }}</td>
                <td class="text-right">{{ formatMembershipMoney(item.breakdown.newPriceAmount) }}</td>
                <td class="text-right">{{ formatMembershipMoney(item.breakdown.unusedCreditAmount) }}</td>
                <td class="text-right">{{ formatMembershipMoney(item.breakdown.creditDiscountApplied) }}</td>
                <td class="text-right">{{ formatMembershipMoney(item.breakdown.forfeitedCreditAmount) }}</td>
                <td class="text-right">{{ formatMembershipMoney(item.breakdown.finalAmountCharged) }}</td>
                <td>{{ item.breakdown.effectiveAt }}</td>
            </tr>
        </tbody>
        <tfoot>
            <tr class="font-weight-bold">
                <td colspan="4">Combined totals</td>
                <td class="text-right">{{ formatMembershipMoney(totals.unusedCreditAmount) }}</td>
                <td class="text-right">{{ formatMembershipMoney(totals.creditDiscountApplied) }}</td>
                <td class="text-right">{{ formatMembershipMoney(totals.forfeitedCreditAmount) }}</td>
                <td class="text-right">{{ formatMembershipMoney(totals.finalAmountCharged) }}</td>
                <td />
            </tr>
        </tfoot>
    </v-table>
</template>

<script setup lang="ts">
import {
    membershipBatchOperationLabel as operationLabel,
    type MembershipBatchBreakdown,
    type MembershipBatchGroup,
} from '~/utils/membership-batch.util'
import { formatMembershipMoney } from '~/utils/membership.util'

defineProps<{
    breakdowns: Array<{ group: MembershipBatchGroup; breakdown: MembershipBatchBreakdown }>
    totals: Pick<
        MembershipBatchBreakdown,
        'unusedCreditAmount' | 'creditDiscountApplied' | 'forfeitedCreditAmount' | 'finalAmountCharged'
    >
}>()

</script>
