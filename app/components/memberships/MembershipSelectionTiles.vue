<template>
    <v-radio-group
        :model-value="modelValue"
        :error-messages="errorMessages"
        @update:model-value="emit('update:modelValue', Number($event))"
    >
        <section v-for="group in groupedItems" :key="group.id" class="mb-4">
            <div class="text-subtitle-2 font-weight-bold mb-2">{{ group.name }}</div>
            <v-row dense>
                <v-col v-for="item in group.items" :key="item.id" cols="12" sm="6">
                    <v-card
                        :color="modelValue === item.id ? 'primary' : undefined"
                        :variant="modelValue === item.id ? 'tonal' : 'outlined'"
                        height="100%"
                        :class="{
                            'cursor-pointer': !isDisabled(item),
                            'opacity-60': isDisabled(item),
                        }"
                        :aria-disabled="isDisabled(item)"
                        @click="select(item)"
                    >
                        <v-card-text class="d-flex align-start ga-2">
                            <v-radio
                                :value="item.id"
                                :disabled="isDisabled(item)"
                                hide-details
                                @click.stop
                            />
                            <div class="flex-grow-1">
                                <div class="d-flex align-center justify-space-between ga-2">
                                    <div class="font-weight-medium">{{ item.name }}</div>
                                    <v-chip
                                        v-if="statusFor?.(item)"
                                        size="x-small"
                                        :color="isDisabled(item) ? 'default' : 'success'"
                                        variant="tonal"
                                    >
                                        {{ statusFor(item) }}
                                    </v-chip>
                                </div>
                                <div class="text-body-2">
                                    {{
                                        item.isChargeable
                                            ? formatMembershipMoney(item.priceAmount)
                                            : 'Free'
                                    }}
                                    · {{ item.billingInterval.replaceAll('_', ' ') }} · Tier
                                    {{ item.tierRank }}
                                </div>
                                <div
                                    v-if="item.tooltip || item.description"
                                    class="text-caption text-medium-emphasis mt-1"
                                >
                                    {{ item.tooltip || item.description }}
                                </div>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </section>
    </v-radio-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatMembershipMoney } from '~/utils/membership.util'
import type { Membership } from '~/types/membership.types'

const props = defineProps<{
    modelValue: number
    items: Membership[]
    errorMessages?: string | string[]
    disabledFor?: (item: Membership) => boolean
    statusFor?: (item: Membership) => string | null
}>()
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()
const isDisabled = (item: Membership): boolean => props.disabledFor?.(item) ?? false
const select = (item: Membership): void => {
    if (!isDisabled(item)) emit('update:modelValue', item.id)
}
const groupedItems = computed(() => {
    const groups = new Map<number, { id: number; name: string; items: Membership[] }>()
    for (const item of props.items) {
        const group = groups.get(item.membershipTypeId) ?? {
            id: item.membershipTypeId,
            name: item.membershipGroupName,
            items: [],
        }
        group.items.push(item)
        groups.set(group.id, group)
    }
    return [...groups.values()]
})
</script>
