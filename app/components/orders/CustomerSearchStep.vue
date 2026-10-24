<template>
    <v-card variant="outlined">
        <v-card-title>Select customer</v-card-title>
        <v-card-subtitle>
            Type at least 3 characters of the customer name, display name, or email.
        </v-card-subtitle>
        <v-card-text class="pt-5">
            <v-autocomplete
                v-model="selectedOption"
                v-model:search="searchText"
                :items="options"
                :loading="loading"
                label="Search customer"
                variant="outlined"
                prepend-inner-icon="mdi-magnify"
                no-filter
                return-object
                clearable
                hide-selected
                :no-data-text="noDataText"
                @update:model-value="selectCustomer"
            >
                <template #item="{ props: itemProps, item }">
                    <v-list-item v-bind="itemProps">
                        <template #subtitle>
                            {{ item.raw.email }}
                        </template>
                    </v-list-item>
                </template>
            </v-autocomplete>

            <v-alert v-if="modelValue" type="success" variant="tonal">
                <div class="font-weight-medium">
                    {{ modelValue.firstName }} {{ modelValue.lastName }}
                </div>
                <div>{{ modelValue.email }} · {{ modelValue.phoneNumber }}</div>
            </v-alert>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useNuxtApp } from '#app'
import { useToast } from '~/composables/useToast'
import type { Customer } from '~/services/api/wrappers/customer.api'

interface CustomerOption {
    title: string
    value: number
    email: string
    customer: Customer
}

const props = defineProps<{ modelValue: Customer | null; organisationId?: number | null }>()
const emit = defineEmits<{
    'update:modelValue': [customer: Customer | null]
}>()

const nuxtApp = useNuxtApp()
const customerApi =
    nuxtApp.$customerApi as import('~/services/api/wrappers/customer.api').CustomerApiService
const { errorFromError } = useToast()

const searchText = ref('')
const selectedOption = ref<CustomerOption | null>(null)
const options = ref<CustomerOption[]>([])
const loading = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null
let requestRevision = 0

const noDataText = computed(() => {
    const query = searchText.value.trim()
    if (query.length < 3) return 'Enter at least 3 characters to search'
    return loading.value ? 'Searching customers…' : 'No matching customers'
})

function toOption(customer: Customer): CustomerOption {
    return {
        title: `${customer.firstName} ${customer.lastName}`.trim(),
        value: customer.id,
        email: customer.email,
        customer,
    }
}

async function searchCustomers(query: string): Promise<void> {
    const currentRevision = ++requestRevision
    loading.value = true
    try {
        const response = await customerApi.getAllCustomers(
            props.organisationId ?? null,
            1,
            20,
            query
        )
        if (currentRevision !== requestRevision) return
        options.value = (response.data?.customers ?? [])
            .filter((customer) => customer.isActive)
            .map(toOption)
    } catch (error) {
        if (currentRevision !== requestRevision) return
        options.value = []
        errorFromError(error, 'Failed to search customers')
    } finally {
        if (currentRevision === requestRevision) loading.value = false
    }
}

async function selectCustomer(option: CustomerOption | null): Promise<void> {
    if (!option) {
        emit('update:modelValue', null)
        return
    }
    loading.value = true
    try {
        const response = await customerApi.getCustomerById(option.value)
        emit('update:modelValue', response.data ?? option.customer)
    } catch (error) {
        selectedOption.value = null
        errorFromError(error, 'Failed to load customer details')
    } finally {
        loading.value = false
    }
}

watch(searchText, (value) => {
    if (timer) clearTimeout(timer)
    const query = value.trim()
    if (selectedOption.value && query === selectedOption.value.title) return
    if (query.length < 3) {
        requestRevision += 1
        options.value = []
        loading.value = false
        return
    }
    timer = setTimeout(() => void searchCustomers(query), 350)
})

watch(
    () => props.modelValue,
    (customer) => {
        if (!customer) {
            selectedOption.value = null
            return
        }
        const option = toOption(customer)
        selectedOption.value = option
        options.value = [option]
    },
    { immediate: true }
)

onBeforeUnmount(() => {
    if (timer) clearTimeout(timer)
    requestRevision += 1
})
</script>
