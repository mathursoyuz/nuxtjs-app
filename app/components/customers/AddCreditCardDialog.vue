<template>
    <v-dialog
        :model-value="modelValue"
        max-width="900"
        scrollable
        persistent
        transition="dialog-bottom-transition"
        @update:model-value="emit('update:modelValue', $event)"
    >
        <v-card>
            <DialogsDialogHeader
                title="Manage credit cards"
                entity-label="Customer"
                :entity-name="customer ? `${customer.firstName} ${customer.lastName}` : undefined"
                @close="closeDialog"
            />

            <v-divider />

            <v-card-text class="pa-6">
                <section class="mb-6">
                    <div class="d-flex align-center justify-space-between mb-2">
                        <h3 class="text-h6">Existing Credit Cards</h3>
                        <span class="text-body-2 text-medium-emphasis">
                            {{ cards.length }} / {{ MAX_CREDIT_CARDS }} cards
                        </span>
                    </div>
                    <p class="text-body-2 text-medium-emphasis mb-3">
                        One card must always remain active. Activating another card automatically
                        makes it the default and deactivates the previous card.
                    </p>

                    <v-data-table
                        v-if="cards.length"
                        :headers="cardHeaders"
                        :items="cards"
                        :items-per-page="5"
                        hide-default-footer
                        density="comfortable"
                    >
                        <template #item.card="{ item }">
                            <span class="font-weight-medium">
                                •••• •••• •••• {{ item.lastFour }}
                            </span>
                        </template>
                        <template #item.expiry="{ item }">
                            {{ item.expMonth }}/{{ item.expYear }}
                        </template>
                        <template #item.isActive="{ item }">
                            <v-switch
                                :model-value="item.isActive"
                                :disabled="item.isActive || activatingCardId !== null"
                                :loading="activatingCardId === item.id"
                                color="primary"
                                density="compact"
                                hide-details
                                aria-label="Set as active card"
                                @update:model-value="activate(item.id, !!$event)"
                            />
                        </template>
                    </v-data-table>
                    <v-alert v-else type="info" variant="tonal">
                        No credit cards have been added for this customer.
                    </v-alert>
                </section>

                <v-divider class="mb-6" />

                <div class="d-flex align-center justify-space-between mb-3">
                    <h3 class="text-h6">Add New Credit Card</h3>
                    <v-chip v-if="hasReachedLimit" color="warning" size="small">
                        Maximum reached
                    </v-chip>
                </div>
                <v-alert v-if="hasReachedLimit" type="warning" variant="tonal" class="mb-4">
                    A customer can have at most {{ MAX_CREDIT_CARDS }} credit cards.
                </v-alert>

                <v-form ref="formRef">
                    <LazyGlobalsFormFieldErrors :errors="errors" />

                    <v-card variant="outlined" class="mb-4">
                        <v-card-title class="text-subtitle-1">Billing Address</v-card-title>
                        <v-card-text>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <Field v-slot="{ field, errorMessage }" name="company">
                                        <v-text-field
                                            :model-value="field.value"
                                            label="Company"
                                            variant="outlined"
                                            density="compact"
                                            :disabled="hasReachedLimit"
                                            :error-messages="errorMessage"
                                            @update:model-value="field.onChange"
                                            @blur="field.onBlur"
                                        />
                                    </Field>
                                </v-col>
                                <v-col cols="12">
                                    <Field v-slot="{ field, errorMessage }" name="address">
                                        <v-text-field
                                            :model-value="field.value"
                                            label="Address *"
                                            variant="outlined"
                                            density="compact"
                                            :disabled="hasReachedLimit"
                                            :error-messages="errorMessage"
                                            @update:model-value="field.onChange"
                                            @blur="field.onBlur"
                                        />
                                    </Field>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <Field v-slot="{ field, errorMessage }" name="city">
                                        <v-text-field
                                            :model-value="field.value"
                                            label="City *"
                                            variant="outlined"
                                            density="compact"
                                            :disabled="hasReachedLimit"
                                            :error-messages="errorMessage"
                                            @update:model-value="field.onChange"
                                            @blur="field.onBlur"
                                        />
                                    </Field>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <Field v-slot="{ field, errorMessage }" name="countryCode">
                                        <v-select
                                            :model-value="field.value"
                                            :items="countryOptions"
                                            item-title="title"
                                            item-value="value"
                                            label="Country *"
                                            variant="outlined"
                                            density="compact"
                                            :disabled="hasReachedLimit"
                                            :error-messages="errorMessage"
                                            @update:model-value="
                                                changeCountry(field.onChange, $event)
                                            "
                                            @blur="field.onBlur"
                                        />
                                    </Field>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <Field v-slot="{ field, errorMessage }" name="stateCode">
                                        <v-select
                                            :model-value="field.value"
                                            :items="stateOptions"
                                            item-title="title"
                                            item-value="value"
                                            label="State *"
                                            variant="outlined"
                                            density="compact"
                                            :disabled="hasReachedLimit"
                                            :error-messages="errorMessage"
                                            @update:model-value="field.onChange"
                                            @blur="field.onBlur"
                                        />
                                    </Field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <Field v-slot="{ field, errorMessage }" name="postalCode">
                                        <v-text-field
                                            :model-value="field.value"
                                            label="Postal Code *"
                                            variant="outlined"
                                            density="compact"
                                            :disabled="hasReachedLimit"
                                            :error-messages="errorMessage"
                                            @update:model-value="field.onChange"
                                            @blur="field.onBlur"
                                        />
                                    </Field>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>

                    <v-card variant="outlined">
                        <v-card-title class="text-subtitle-1">Credit Card</v-card-title>
                        <v-card-text>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <Field v-slot="{ field, errorMessage }" name="cardNumber">
                                        <v-text-field
                                            :model-value="field.value"
                                            label="Card Number *"
                                            inputmode="numeric"
                                            autocomplete="cc-number"
                                            variant="outlined"
                                            density="compact"
                                            :disabled="hasReachedLimit"
                                            :error-messages="errorMessage"
                                            @update:model-value="field.onChange"
                                            @blur="field.onBlur"
                                        />
                                    </Field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <Field v-slot="{ field, errorMessage }" name="expMonth">
                                        <v-select
                                            :model-value="field.value"
                                            :items="monthOptions"
                                            label="Month *"
                                            variant="outlined"
                                            density="compact"
                                            :disabled="hasReachedLimit"
                                            :error-messages="errorMessage"
                                            @update:model-value="field.onChange"
                                            @blur="field.onBlur"
                                        />
                                    </Field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <Field v-slot="{ field, errorMessage }" name="expYear">
                                        <v-select
                                            :model-value="field.value"
                                            :items="yearOptions"
                                            label="Year *"
                                            variant="outlined"
                                            density="compact"
                                            :disabled="hasReachedLimit"
                                            :error-messages="errorMessage"
                                            @update:model-value="field.onChange"
                                            @blur="field.onBlur"
                                        />
                                    </Field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <Field v-slot="{ field, errorMessage }" name="cvc">
                                        <v-text-field
                                            :model-value="field.value"
                                            label="CVC *"
                                            inputmode="numeric"
                                            autocomplete="cc-csc"
                                            variant="outlined"
                                            density="compact"
                                            :disabled="hasReachedLimit"
                                            :error-messages="errorMessage"
                                            @update:model-value="field.onChange"
                                            @blur="field.onBlur"
                                        />
                                    </Field>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>
                </v-form>
            </v-card-text>

            <v-divider />
            <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn variant="text" @click="closeDialog">Close</v-btn>
                <v-btn
                    color="primary"
                    :disabled="hasReachedLimit"
                    :loading="isSubmitting"
                    @click="submitForm"
                >
                    Add Credit Card
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Field, useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useCountry } from '~/composables/useCountry'
import { useCustomer } from '~/composables/useCustomer'
import { useCustomerCreditCards } from '~/composables/useCustomerCreditCards'
import { useToast } from '~/composables/useToast'
import { CUSTOMER_MESSAGES } from '~/constants/messages.constants'
import { CUSTOMER_LIMITS } from '~/constants/customer.constants'
import type { Customer } from '~/services/api/wrappers/customer.api'

const MAX_CREDIT_CARDS = CUSTOMER_LIMITS.CREDIT_CARDS

const optionalCompanySchema = z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().min(2).max(100).optional()
)

const creditCardFormSchema = z.object({
    company: optionalCompanySchema,
    address: z.string().trim().min(5).max(150),
    city: z.string().trim().min(2).max(50),
    stateCode: z.string().trim().min(1).max(10),
    postalCode: z.string().trim().min(3).max(10),
    countryCode: z.string().trim().min(2).max(5),
    cardNumber: z.string().regex(/^\d{13,18}$/, 'Enter a valid card number'),
    expMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Select an expiry month'),
    expYear: z.string().regex(/^\d{4}$/, 'Select an expiry year'),
    cvc: z.string().regex(/^\d{3,4}$/, 'Enter a valid CVC'),
})

type CreditCardForm = z.infer<typeof creditCardFormSchema>

interface Props {
    modelValue: boolean
    customer: Customer | null
    organisationId: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    submit: []
}>()

const { countryOptions, fetchCountries, fetchStates } = useCountry()
const { fetchCustomerById } = useCustomer()
const { success, errorFromError } = useToast()
const { cards, fetchCards, addCard, activateCard } = useCustomerCreditCards(
    () => props.customer?.id ?? null
)

const formRef = ref()
const isSubmitting = ref(false)
const activatingCardId = ref<number | null>(null)
const stateOptions = ref<Array<{ title: string; value: string }>>([])
const customerDetails = ref<Customer | null>(null)

const cardHeaders = [
    { title: 'Card', key: 'card', sortable: false },
    { title: 'Expiry', key: 'expiry', sortable: false },
    { title: 'Default / Active', key: 'isActive', sortable: false, align: 'end' as const },
]

const monthOptions = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0'))
const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 16 }, (_, index) => String(currentYear + index))
const hasReachedLimit = computed(() => cards.value.length >= MAX_CREDIT_CARDS)

const initialValues: CreditCardForm = {
    company: undefined,
    address: '',
    city: '',
    stateCode: '',
    postalCode: '',
    countryCode: '',
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvc: '',
}

const { handleSubmit, errors, resetForm, setFieldValue } = useForm<CreditCardForm>({
    validationSchema: toTypedSchema(creditCardFormSchema),
    initialValues,
})

async function loadStates(countryCode: string): Promise<void> {
    if (!countryCode) {
        stateOptions.value = []
        return
    }
    const states = await fetchStates(countryCode)
    stateOptions.value = states.map((state) => ({ title: state.name, value: state.id }))
}

async function changeCountry(
    onChange: (value: string) => void,
    countryCode: string
): Promise<void> {
    onChange(countryCode)
    setFieldValue('stateCode', '')
    await loadStates(countryCode)
}

async function loadDialogData(): Promise<void> {
    if (!props.customer) return
    const [, , fullCustomer] = await Promise.all([
        fetchCountries(),
        fetchCards(),
        fetchCustomerById(props.customer.id),
    ])
    customerDetails.value = fullCustomer

    const billing = fullCustomer.billing
    await loadStates(billing?.countryCode ?? '')
    resetForm({
        values: {
            ...initialValues,
            company: billing?.company ?? undefined,
            address: billing?.address ?? '',
            city: billing?.city ?? '',
            stateCode: billing?.stateCode ?? '',
            postalCode: billing?.postalCode ?? '',
            countryCode: billing?.countryCode ?? '',
        },
    })
}

async function activate(cardId: number, shouldActivate: boolean): Promise<void> {
    if (!shouldActivate) return
    activatingCardId.value = cardId
    try {
        await activateCard(cardId)
        success(CUSTOMER_MESSAGES.CREDIT_CARD_ACTIVATE_SUCCESS)
    } catch (error) {
        errorFromError(error, CUSTOMER_MESSAGES.CREDIT_CARD_UPDATE_ERROR)
        await fetchCards()
    } finally {
        activatingCardId.value = null
    }
}

const submitForm = handleSubmit(async (values) => {
    if (!props.customer || hasReachedLimit.value) return
    isSubmitting.value = true
    try {
        const customer = customerDetails.value ?? props.customer
        const addedCard = await addCard({
            firstName: customer.firstName,
            lastName: customer.lastName,
            company: values.company,
            address: values.address,
            city: values.city,
            stateCode: values.stateCode,
            postalCode: values.postalCode,
            countryCode: values.countryCode,
            phoneNumber: customer.phoneNumber || undefined,
            cardNumber: values.cardNumber,
            expMonth: values.expMonth,
            expYear: values.expYear,
            cvc: values.cvc,
        })
        success(
            `New Credit Card ${addedCard.lastFour} for ${customer.firstName} added successfully!`
        )
        emit('submit')
        await loadDialogData()
    } catch (error) {
        errorFromError(error, CUSTOMER_MESSAGES.CREDIT_CARD_ADD_ERROR)
    } finally {
        isSubmitting.value = false
    }
})

function closeDialog(): void {
    emit('update:modelValue', false)
}

watch(
    [() => props.modelValue, () => props.customer?.id],
    async ([isOpen, customerId]) => {
        if (isOpen && customerId) {
            await loadDialogData()
        } else if (!isOpen) {
            resetForm({ values: initialValues })
            stateOptions.value = []
            customerDetails.value = null
        }
    },
    { immediate: true }
)
</script>
