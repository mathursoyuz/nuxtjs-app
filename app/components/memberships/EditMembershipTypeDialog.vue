<template>
    <v-dialog
        :model-value="modelValue"
        max-width="640"
        persistent
        @update:model-value="emit('update:modelValue', $event)"
    >
        <v-card>
            <DialogsDialogHeader
                title="Edit membership group"
                :organisation-name="organisationName"
                :scope="scope === 'PLATFORM' ? 'Platform' : undefined"
                entity-label="Membership group"
                :entity-name="membershipType?.name"
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
                        :exclude-id="membershipType?.id"
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
                    :disabled="!membershipType || isMembershipSlugConfirmedDuplicate(slugAvailable)"
                    @click="submit"
                >
                    Save
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { ref, watch } from 'vue'
import MembershipSlugField from './MembershipSlugField.vue'
import { membershipTypeFormSchema, type MembershipTypeFormData } from '~/schemas/membership.schema'
import { useMemberships } from '~/composables/useMemberships'
import { useToast } from '~/composables/useToast'
import { isMembershipSlugConfirmedDuplicate } from '~/utils/membership-slug.util'
import type { MembershipType } from '~/types/membership.types'

const props = defineProps<{
    modelValue: boolean
    membershipType: MembershipType | null
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
    })
const [name] = defineField('name')
const [slug] = defineField('slug')
const [description] = defineField('description')
const [isActive] = defineField('isActive')
const slugAvailable = ref<boolean | null>(null)

const submitForm = handleSubmit(async (data) => {
    if (!props.membershipType || isMembershipSlugConfirmedDuplicate(slugAvailable.value)) return
    try {
        const response =
            props.scope === 'PLATFORM'
                ? await memberships.updatePlatformType(props.membershipType.id, data)
                : await memberships.updateOrganisationType(
                      props.organisationId!,
                      props.membershipType.id,
                      data
                  )
        successFromResponse(response, 'Membership group updated.')
        emit('saved')
        close()
    } catch (error) {
        errorFromError(error, 'Unable to update membership group.')
    }
})
const submit = (): void => void submitForm()
const close = (): void => emit('update:modelValue', false)
watch(
    () => [props.modelValue, props.membershipType] as const,
    ([open, type]) => {
        if (!open || !type) return
        resetForm({
            values: {
                name: type.name,
                slug: type.slug,
                description: type.description,
                isActive: type.isActive,
            },
        })
    },
    { immediate: true }
)
</script>
