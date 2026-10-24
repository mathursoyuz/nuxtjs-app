<template>
    <v-radio-group
        :model-value="modelValue"
        :error-messages="errorMessages"
        label="Payment card"
        @update:model-value="emit('update:modelValue', Number($event))"
    >
        <v-row dense>
            <v-col v-for="card in activeCards" :key="card.id" cols="12" sm="6">
                <v-card
                    class="cursor-pointer"
                    :color="modelValue === card.id ? 'primary' : undefined"
                    :variant="modelValue === card.id ? 'tonal' : 'outlined'"
                    @click="emit('update:modelValue', card.id)"
                >
                    <v-card-text class="d-flex align-center ga-3">
                        <v-radio :value="card.id" hide-details @click.stop />
                        <div>
                            <div class="font-weight-medium">Card ending {{ card.lastFour }}</div>
                            <div class="text-caption text-medium-emphasis">
                                Expires {{ card.expMonth }}/{{ card.expYear }}
                            </div>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-radio-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface SelectablePaymentCard {
    id: number
    lastFour: string
    expMonth: string
    expYear: string
    isActive: boolean
}

const props = defineProps<{
    modelValue?: number
    cards: SelectablePaymentCard[]
    errorMessages?: string | string[]
}>()
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()
const activeCards = computed(() => props.cards.filter((card) => card.isActive))
</script>
