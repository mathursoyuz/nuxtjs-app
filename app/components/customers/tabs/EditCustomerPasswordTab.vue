<template>
    <v-form ref="formRef">
        <LazyGlobalsFormFieldErrors :errors="errors" />
        <v-card class="mb-4" elevation="0" variant="outlined">
            <v-card-title class="text-h6">Change Password</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="12" md="6">
                        <Field v-slot="{ field, errorMessage }" name="newPassword" validate-on-blur>
                            <v-text-field
                                :model-value="field.value"
                                label="New Password *"
                                type="password"
                                variant="outlined"
                                density="compact"
                                :error-messages="errorMessage"
                                hide-details="auto"
                                @update:model-value="field.onChange"
                                @blur="field.onBlur"
                            />
                        </Field>
                    </v-col>
                    <v-col cols="12" md="6">
                        <Field
                            v-slot="{ field, errorMessage }"
                            name="confirmPassword"
                            validate-on-blur
                        >
                            <v-text-field
                                :model-value="field.value"
                                label="Confirm Password *"
                                type="password"
                                variant="outlined"
                                density="compact"
                                :error-messages="errorMessage"
                                hide-details="auto"
                                @update:model-value="field.onChange"
                                @blur="field.onBlur"
                            />
                        </Field>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
        <div class="d-flex justify-end mt-4">
            <v-btn @click="$emit('cancel')" class="mr-2">Cancel</v-btn>
            <v-btn color="primary" :loading="isSubmitting" @click="handlePasswordFormSubmit">
                Update Password
            </v-btn>
        </div>
    </v-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useForm, Field } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useCustomer } from '~/composables/useCustomer'
import { useToast } from '~/composables/useToast'
import { useLoadingTask } from '~/composables/useLoadingTask'
import { CUSTOMER_MESSAGES } from '~/constants/messages.constants'
import type { Customer } from '~/services/api/wrappers/customer.api'

// Password change schema
const passwordChangeSchema = z
    .object({
        newPassword: z.string().min(8).max(255),
        confirmPassword: z.string().min(8).max(255),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    })

interface Props {
    customer: Customer | null
    fullCustomerData: Customer | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
    submit: []
    cancel: []
}>()

const { updateCustomer } = useCustomer()
const { success, errorFromError } = useToast()

const formRef = ref()
const isSubmitting = ref(false)

const { handleSubmit, values, errors, resetForm } = useForm({
    validationSchema: toTypedSchema(passwordChangeSchema),
    initialValues: { newPassword: '', confirmPassword: '' },
    validateOnMount: false,
})

// Form submission
const submitForm = handleSubmit(async (formValues) => {
    if (!props.customer) return

    isSubmitting.value = true
    try {
        const loadingTask = useLoadingTask('update-password')
        await loadingTask.execute(async () => {
            await updateCustomer(props.customer!.id, { password: formValues.newPassword })

            success(CUSTOMER_MESSAGES.PASSWORD_UPDATE_SUCCESS)
            resetForm({
                values: { newPassword: '', confirmPassword: '' },
                errors: {},
                touched: {},
            })
            emit('submit')
        })
    } catch (err) {
        console.error('Error updating password:', err)
        errorFromError(err, CUSTOMER_MESSAGES.PASSWORD_UPDATE_ERROR)
    } finally {
        isSubmitting.value = false
    }
})

const handlePasswordFormSubmit = () => {
    submitForm()
}
</script>
