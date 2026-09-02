<template>
    <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="900" scrollable persistent>
        <v-card>
            <v-card-title class="d-flex align-center justify-space-between">
                <span class="text-h5">Add Credit Card</span>
                <v-btn icon variant="text" @click="$emit('update:modelValue', false)">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-divider />

            <v-card-text class="pa-0">
                <v-form ref="formRef" v-model="valid" class="pa-4">
                    <!-- Existing Credit Cards -->
                    <div v-if="existingCreditCards.length > 0" class="mb-6">
                        <h3 class="text-h6 mb-4">Existing Credit Cards</h3>
                        <v-card v-for="card in existingCreditCards" :key="card.id" class="mb-3" variant="outlined">
                            <v-card-text class="d-flex align-center justify-space-between">
                                <div>
                                    <div class="text-body-1 font-weight-medium">
                                        **** **** **** {{ card.lastFour }}
                                    </div>
                                    <div class="text-caption text-medium-emphasis">
                                        Expires: {{ card.expMonth }}/{{ card.expYear }}
                                    </div>
                                </div>
                                <v-switch
                                    :model-value="card.isActive"
                                    label="Active"
                                    color="primary"
                                    hide-details
                                    :loading="togglingCardId === card.id"
                                    @update:model-value="toggleCreditCardActive(card.id, $event ?? false)"
                                />
                            </v-card-text>
                        </v-card>
                    </div>

                    <!-- Billing Information -->
                    <h3 class="text-h6 mb-4">Billing Information</h3>
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model="formData.billingFirstName"
                                label="First Name"
                                variant="outlined"
                                density="compact"
                                :rules="[rules.required]"
                                required
                            />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model="formData.billingLastName"
                                label="Last Name"
                                variant="outlined"
                                density="compact"
                                :rules="[rules.required]"
                                required
                            />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model="formData.billingCompany"
                                label="Company"
                                variant="outlined"
                                density="compact"
                                :rules="[rules.billingCompany]"
                            />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model="formData.billingPhone"
                                label="Phone"
                                variant="outlined"
                                density="compact"
                                :rules="[rules.required]"
                                required
                            />
                        </v-col>

                        <v-col cols="12">
                            <v-text-field
                                v-model="formData.billingAddress"
                                label="Address"
                                variant="outlined"
                                density="compact"
                                :rules="[rules.required]"
                                required
                            />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model="formData.billingCity"
                                label="City"
                                variant="outlined"
                                density="compact"
                                :rules="[rules.required]"
                                required
                            />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-select
                                v-model="billingCountryCode"
                                label="Country"
                                :items="countryOptions"
                                variant="outlined"
                                density="compact"
                                item-title="title"
                                item-value="value"
                                :rules="[rules.required]"
                                required
                                @update:model-value="handleBillingCountryChange"
                            />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-select
                                v-model="formData.billingStateCode"
                                label="State"
                                :items="billingStateOptions"
                                variant="outlined"
                                density="compact"
                                item-title="title"
                                item-value="value"
                                :disabled="!billingCountryCode"
                                :rules="[rules.required]"
                                required
                            />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model="formData.billingPostalCode"
                                label="Postal Code"
                                variant="outlined"
                                density="compact"
                                :rules="[rules.required]"
                                required
                            />
                        </v-col>
                    </v-row>

                    <v-divider class="my-6" />

                    <!-- Credit Card Information -->
                    <h3 class="text-h6 mb-4">Credit Card Information</h3>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field
                                v-model="creditCardData.cardNumber"
                                label="Card Number"
                                variant="outlined"
                                density="compact"
                                placeholder="1234 5678 9012 3456"
                                :rules="[rules.required]"
                                required
                            />
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-select
                                v-model="creditCardData.expMonth"
                                label="Expiry Month"
                                :items="monthOptions"
                                variant="outlined"
                                density="compact"
                                item-title="title"
                                item-value="value"
                                :rules="[rules.required]"
                                required
                            />
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-select
                                v-model="creditCardData.expYear"
                                label="Expiry Year"
                                :items="yearOptions"
                                variant="outlined"
                                density="compact"
                                item-title="title"
                                item-value="value"
                                :rules="[rules.required]"
                                required
                            />
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-text-field
                                v-model="creditCardData.cvc"
                                label="CVC"
                                variant="outlined"
                                density="compact"
                                placeholder="123"
                                maxlength="4"
                                :rules="[rules.required]"
                                required
                            />
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>

            <v-divider />

            <v-card-actions class="pa-4">
                <v-btn variant="outlined" @click="$emit('update:modelValue', false)">Cancel</v-btn>
                <v-spacer />
                <v-btn
                    color="primary"
                    :loading="loading"
                    prepend-icon="mdi-check"
                    @click="handleSubmit"
                >
                    Add Credit Card
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useNuxtApp } from '#app';
import { useCountry } from '~/composables/useCountry';
import { useToast } from '~/composables/useToast';
import { useClient } from '~/composables/useClient';
import { CLIENT_MESSAGES } from '~/constants/messages.constants';
import type { ClientCreditCard } from '~/services/api/wrappers/client-credit-card.api';

interface Props {
    modelValue: boolean;
    clientId: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    'submit': [];
}>();

const nuxtApp = useNuxtApp();
const creditCardApi = nuxtApp.$clientCreditCardApi as import('~/services/api/wrappers/client-credit-card.api').ClientCreditCardApiService;
const { countryOptions, fetchCountries, fetchStates } = useCountry();
const { successFromResponse, errorFromError, success } = useToast();
const { fetchClientById } = useClient();

const formRef = ref();
const valid = ref(false);
const loading = ref(false);
const togglingCardId = ref<number | null>(null);
const existingCreditCards = ref<ClientCreditCard[]>([]);
const billingCountryCode = ref<string | null>(null);
const billingStateOptions = ref<Array<{ title: string; value: string }>>([]);

// Month options (1-12)
const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return {
        title: month.toString().padStart(2, '0'),
        value: month.toString().padStart(2, '0'),
    };
});

// Year options (current year to next 15 years)
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 16 }, (_, i) => {
    const year = currentYear + i;
    return {
        title: year.toString(),
        value: year.toString(),
    };
});

const formData = ref({
    billingFirstName: '',
    billingLastName: '',
    billingCompany: '',
    billingAddress: '',
    billingCity: '',
    billingStateCode: '',
    billingPostalCode: '',
    billingCountryCode: '',
    billingPhone: '',
});

const creditCardData = ref({
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvc: '',
    isActive: true,
});

const rules = {
    required: (v: unknown) => !!v || 'This field is required',
    billingCompany: (v: string) => {
        if (!v || !v.trim()) return true; // Optional
        return v.trim().length >= 5 || 'Company name must be at least 5 characters if provided';
    },
};

const handleBillingCountryChange = async (countryId: string) => {
    billingCountryCode.value = countryId;
        formData.value.billingCountryCode = countryId;
    if (countryId) {
        const states = await fetchStates(countryId);
        billingStateOptions.value = states.map((s) => ({
            title: s.name,
            value: s.id,
        }));
    } else {
        billingStateOptions.value = [];
    }
    formData.value.billingStateCode = '';
};

const loadCreditCards = async () => {
    try {
        const response = await creditCardApi.getAllClientCreditCards(props.clientId);
        if (response.success && response.data) {
            existingCreditCards.value = response.data;
        }
    } catch (error) {
        console.error('Error loading credit cards:', error);
    }
};

const toggleCreditCardActive = async (cardId: number, isActive: boolean) => {
    togglingCardId.value = cardId;
    try {
        // If activating, deactivate all other cards first
        if (isActive) {
            for (const card of existingCreditCards.value) {
                if (card.id !== cardId && card.isActive) {
                    await creditCardApi.toggleActive(props.clientId, card.id, false);
                }
            }
        }
        
        const response = await creditCardApi.toggleActive(props.clientId, cardId, isActive);
        if (response.success) {
            successFromResponse(response, isActive ? CLIENT_MESSAGES.CREDIT_CARD_ACTIVATE_SUCCESS : CLIENT_MESSAGES.CREDIT_CARD_DEACTIVATE_SUCCESS);
            await loadCreditCards();
        }
    } catch (error) {
        console.error('Error toggling credit card:', error);
        errorFromError(error, CLIENT_MESSAGES.CREDIT_CARD_UPDATE_ERROR);
    } finally {
        togglingCardId.value = null;
    }
};

const loadClientBillingInfo = async () => {
    if (!props.clientId) return;
    
    try {
        const client = await fetchClientById(props.clientId);
        if (client) {
            // Auto-fill billing information from client
            formData.value = {
                billingFirstName: client.billingFirstName || '',
                billingLastName: client.billingLastName || '',
                billingCompany: client.billingCompany || '',
                billingAddress: client.billingAddress || '',
                billingCity: client.billingCity || '',
                billingStateCode: client.billingStateCode || '',
                billingPostalCode: client.billingPostalCode || '',
                billingCountryCode: client.billingCountryCode || '',
                billingPhone: client.billingPhone || '',
            };
            
            // Set billing country and load states
            if (client.billingCountryCode) {
                billingCountryCode.value = client.billingCountryCode;
                await handleBillingCountryChange(client.billingCountryCode);
                // Set state after states are loaded
                if (client.billingStateCode) {
                    formData.value.billingStateCode = client.billingStateCode;
                }
            }
        }
    } catch (error) {
        console.error('Error loading client billing info:', error);
        // Don't show error, just proceed with empty form
    }
};

const resetForm = () => {
    formData.value = {
        billingFirstName: '',
        billingLastName: '',
        billingCompany: '',
        billingAddress: '',
        billingCity: '',
        billingStateCode: '',
        billingPostalCode: '',
        billingCountryCode: '',
        billingPhone: '',
    };
    creditCardData.value = {
        cardNumber: '',
        expMonth: '',
        expYear: '',
        cvc: '',
        isActive: true,
    };
    billingCountryCode.value = null;
    billingStateOptions.value = [];
    if (formRef.value) {
        formRef.value.resetValidation();
    }
};

const handleSubmit = async () => {
    if (!formRef.value?.validate()) return;

    loading.value = true;
    try {
        const response = await creditCardApi.createClientCreditCard(props.clientId, {
            cardNumber: creditCardData.value.cardNumber,
            expMonth: creditCardData.value.expMonth,
            expYear: creditCardData.value.expYear,
            cvc: creditCardData.value.cvc,
            isActive: creditCardData.value.isActive,
            billingFirstName: formData.value.billingFirstName,
            billingLastName: formData.value.billingLastName,
            billingCompany: formData.value.billingCompany,
            billingAddress: formData.value.billingAddress,
            billingCity: formData.value.billingCity,
            billingStateCode: formData.value.billingStateCode,
            billingPostalCode: formData.value.billingPostalCode,
            billingCountryCode: formData.value.billingCountryCode,
            billingPhone: formData.value.billingPhone,
        });
        
        if (response.success) {
            successFromResponse(response, CLIENT_MESSAGES.CREDIT_CARD_ADDED_SUCCESS);
            resetForm();
            emit('submit');
            emit('update:modelValue', false);
        }
    } catch (error) {
        console.error('Error adding credit card:', error);
        errorFromError(error, CLIENT_MESSAGES.CREDIT_CARD_ADDED_ERROR);
    } finally {
        loading.value = false;
    }
};

watch(() => props.modelValue, async (isOpen) => {
    if (isOpen) {
        resetForm();
        await loadClientBillingInfo();
        loadCreditCards();
    }
});

// Use useLazyAsyncData for initial data fetching
const { pending: addClientCreditCardDataPending } = await useLazyAsyncData(
    'add-client-credit-card-form-data',
    async () => {
        await fetchCountries();
    }
);
</script>
