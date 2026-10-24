<template>
    <v-dialog :model-value="modelValue" max-width="800" persistent @update:model-value="close">
        <v-card>
            <DialogsDialogHeader
                title="Add payment card"
                entity-label="Customer"
                :entity-name="`${customer.firstName} ${customer.lastName}`"
                @close="close(false)"
            />
            <v-divider />
            <v-card-text class="pa-5">
                <div class="text-subtitle-1 mb-3">Card billing address</div>
                <v-row>
                    <v-col cols="12">
                        <v-text-field v-model="form.company" label="Company" variant="outlined" />
                    </v-col>
                    <v-col cols="12">
                        <v-text-field v-model="form.address" label="Address *" variant="outlined" />
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-text-field v-model="form.city" label="City *" variant="outlined" />
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-text-field
                            v-model="form.postalCode"
                            label="Postal code *"
                            variant="outlined"
                        />
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-select
                            v-model="form.countryCode"
                            :items="countryOptions"
                            label="Country *"
                            variant="outlined"
                            @update:model-value="changeCountry"
                        />
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-select
                            v-model="form.stateCode"
                            :items="stateOptions"
                            label="State *"
                            variant="outlined"
                        />
                    </v-col>
                </v-row>

                <div class="text-subtitle-1 mb-3">Card details</div>
                <v-row>
                    <v-col cols="12">
                        <v-text-field
                            v-model="form.cardNumber"
                            label="Card number *"
                            inputmode="numeric"
                            maxlength="18"
                            variant="outlined"
                        />
                    </v-col>
                    <v-col cols="12" sm="4">
                        <v-select
                            v-model="form.expMonth"
                            :items="monthOptions"
                            label="Expiry month *"
                            variant="outlined"
                        />
                    </v-col>
                    <v-col cols="12" sm="4">
                        <v-select
                            v-model="form.expYear"
                            :items="yearOptions"
                            label="Expiry year *"
                            variant="outlined"
                        />
                    </v-col>
                    <v-col cols="12" sm="4">
                        <v-text-field
                            v-model="form.cvc"
                            label="CVC *"
                            inputmode="numeric"
                            maxlength="4"
                            type="password"
                            variant="outlined"
                        />
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider />
            <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn variant="text" @click="close(false)">Cancel</v-btn>
                <v-btn color="primary" :loading="saving" :disabled="!isValid" @click="save">
                    Add card
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useCustomerCreditCards } from '~/composables/useCustomerCreditCards'
import { useCountry } from '~/composables/useCountry'
import { useToast } from '~/composables/useToast'
import type { Customer } from '~/services/api/wrappers/customer.api'

const props = defineProps<{ modelValue: boolean; customer: Customer }>()
const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    added: []
}>()
const { addCard } = useCustomerCreditCards(() => props.customer.id)
const { countryOptions, fetchCountries, fetchStates } = useCountry()
const { success, errorFromError } = useToast()
const stateOptions = ref<Array<{ title: string; value: string }>>([])
const saving = ref(false)
const currentYear = new Date().getFullYear()
const monthOptions = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0'))
const yearOptions = Array.from({ length: 16 }, (_, index) => String(currentYear + index))
const form = reactive({
    company: '',
    address: '',
    city: '',
    stateCode: '',
    postalCode: '',
    countryCode: '',
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvc: '',
})
const isValid = computed(
    () =>
        form.address.trim().length >= 5 &&
        form.city.trim().length >= 2 &&
        form.stateCode.length > 0 &&
        form.postalCode.length >= 3 &&
        form.countryCode.length > 0 &&
        /^\d{13,18}$/.test(form.cardNumber) &&
        /^(0[1-9]|1[0-2])$/.test(form.expMonth) &&
        /^\d{4}$/.test(form.expYear) &&
        /^\d{3,4}$/.test(form.cvc)
)

function close(value: boolean): void {
    emit('update:modelValue', value)
}

async function loadStates(countryCode: string): Promise<void> {
    if (!countryCode) {
        stateOptions.value = []
        return
    }
    const states = await fetchStates(countryCode)
    stateOptions.value = states.map((state) => ({ title: state.name, value: state.id }))
}

async function changeCountry(countryCode: string): Promise<void> {
    form.stateCode = ''
    await loadStates(countryCode)
}

async function save(): Promise<void> {
    if (!isValid.value) return
    saving.value = true
    try {
        await addCard({
            firstName: props.customer.firstName,
            lastName: props.customer.lastName,
            company: form.company.trim() || undefined,
            address: form.address.trim(),
            city: form.city.trim(),
            stateCode: form.stateCode,
            postalCode: form.postalCode.trim(),
            countryCode: form.countryCode,
            phoneNumber: props.customer.phoneNumber || undefined,
            cardNumber: form.cardNumber,
            expMonth: form.expMonth,
            expYear: form.expYear,
            cvc: form.cvc,
        })
        success('Payment card added successfully')
        emit('added')
        close(false)
    } catch (error) {
        errorFromError(error, 'Failed to add payment card')
    } finally {
        saving.value = false
    }
}

watch(
    () => props.modelValue,
    async (open) => {
        if (!open) return
        Object.assign(form, {
            company: props.customer.billing.company ?? '',
            address: props.customer.billing.address,
            city: props.customer.billing.city,
            stateCode: props.customer.billing.stateCode,
            postalCode: props.customer.billing.postalCode,
            countryCode: props.customer.billing.countryCode,
            cardNumber: '',
            expMonth: '',
            expYear: '',
            cvc: '',
        })
        await fetchCountries()
        await loadStates(form.countryCode)
    },
    { immediate: true }
)
</script>
