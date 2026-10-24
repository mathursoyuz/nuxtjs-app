<template>
    <v-dialog
        :model-value="modelValue"
        max-width="640"
        persistent
        @update:model-value="emit('update:modelValue', $event)"
    >
        <v-card>
            <DialogsDialogHeader
                title="Add membership group"
                :organisation-name="organisationName"
                :scope="scope === 'PLATFORM' ? 'Platform' : undefined"
                entity-label="Membership group"
                entity-name="New group"
                @close="close"
            />
            <v-card-text>
                <v-form @submit.prevent="submit">
                    <v-text-field
                        v-if="scope === 'ORGANISATION'"
                        :model-value="organisationName"
                        label="Organisation"
                        readonly
                    />
                    <v-text-field v-model="name" label="Name" :error-messages="errors.name" />
                    <MembershipSlugField
                        v-model="slug"
                        v-model:available="slugAvailable"
                        :name="name"
                        :active="modelValue"
                        :scope="scope"
                        entity="GROUP"
                        :organisation-id="organisationId"
                        :error-messages="errors.slug"
                    />
                    <v-textarea
                        v-model="description"
                        label="Description"
                        :error-messages="errors.description"
                    />
                    <v-switch v-model="isActive" label="Active" color="primary" />
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="close">Cancel</v-btn>
                <v-btn
                    color="primary"
                    :loading="isSubmitting"
                    :disabled="isMembershipSlugConfirmedDuplicate(slugAvailable)"
                    @click="submit"
                >
                    Create
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import MembershipSlugField from './MembershipSlugField.vue'
import { membershipTypeFormSchema, type MembershipTypeFormData } from '~/schemas/membership.schema'
import { useMemberships } from '~/composables/useMemberships'
import { useToast } from '~/composables/useToast'
import { isMembershipSlugConfirmedDuplicate } from '~/utils/membership-slug.util'

const props = defineProps<{
    modelValue: boolean
    scope: 'PLATFORM' | 'ORGANISATION'
    organisationId?: number
    organisationName?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; saved: [] }>()
const memberships = useMemberships()
const { successFromResponse, errorFromError } = useToast()
const { errors, defineField, handleSubmit, isSubmitting, resetForm } =
    useForm<MembershipTypeFormData>({
        validationSchema: toTypedSchema(membershipTypeFormSchema),
        initialValues: { name: '', slug: '', description: null, isActive: true },
    })
const [name] = defineField('name')
const [slug] = defineField('slug')
const [description] = defineField('description')
const [isActive] = defineField('isActive')
const slugAvailable = ref<boolean | null>(null)

const submitForm = handleSubmit(async (data) => {
    if (isMembershipSlugConfirmedDuplicate(slugAvailable.value)) return
    try {
        const response =
            props.scope === 'PLATFORM'
                ? await memberships.createPlatformType(data)
                : await memberships.createOrganisationType(props.organisationId!, data)
        successFromResponse(response, 'Membership group created.')
        emit('saved')
        close()
    } catch (error) {
        errorFromError(error, 'Unable to create membership group.')
    }
})
const submit = (): void => void submitForm()
const close = (): void => {
    resetForm()
    emit('update:modelValue', false)
}
</script>
