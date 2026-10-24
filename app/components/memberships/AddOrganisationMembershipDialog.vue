<template>
    <v-dialog
        :model-value="modelValue"
        max-width="1100"
        persistent
        scrollable
        @update:model-value="emit('update:modelValue', $event)"
    >
        <v-card>
            <DialogsDialogHeader
                title="Add membership"
                :organisation-name="organisationName"
                entity-label="Membership"
                entity-name="New membership"
                @close="close"
            />
            <v-card-text>
                <v-form @submit.prevent="submit">
                    <v-row>
                        <v-col cols="12">
                            <v-text-field
                                :model-value="organisationName"
                                label="Organisation"
                                readonly
                            />
                        </v-col>
                        <v-col cols="12">
                            <v-select
                                v-model="membershipTypeId"
                                :items="typeOptions"
                                label="Group"
                                :error-messages="errors.membershipTypeId"
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model="name"
                                label="Name"
                                :error-messages="errors.name"
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <MembershipSlugField
                                v-model="slug"
                                v-model:available="slugAvailable"
                                :name="name"
                                :active="modelValue"
                                scope="ORGANISATION"
                                entity="MEMBERSHIP"
                                :organisation-id="organisationId"
                                :error-messages="errors.slug"
                            />
                        </v-col>
                        <v-col cols="12">
                            <v-textarea v-model="description" label="Description" />
                        </v-col>
                        <v-col cols="12">
                            <v-text-field v-model="tooltip" label="Short tooltip" />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="bannerImage" label="Banner image URL" />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="thumbnailImage" label="Thumbnail image URL" />
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-text-field
                                v-model.number="tierRank"
                                type="number"
                                min="1"
                                label="Tier order"
                            />
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-switch v-model="isChargeable" label="Chargeable" color="primary" />
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-text-field
                                v-model.number="priceAmount"
                                type="number"
                                step="0.01"
                                min="0"
                                label="Price (USD)"
                                :disabled="!isChargeable"
                            />
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-select
                                v-model="billingInterval"
                                :items="MEMBERSHIP_BILLING_INTERVALS"
                                label="Billing interval"
                            />
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-select
                                v-model="defaultDiscountType"
                                :items="MEMBERSHIP_DISCOUNT_TYPES"
                                label="Default discount"
                            />
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-text-field
                                v-model.number="defaultDiscountValue"
                                type="number"
                                min="0"
                                :label="discountLabel"
                                :disabled="defaultDiscountType === 'NONE'"
                            />
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-switch v-model="isActive" label="Active" color="primary" />
                        </v-col>
                        <v-col cols="12">
                            <MembershipRulesEditor
                                v-model:category-rules="categoryRules"
                                v-model:product-rules="productRules"
                                :categories="categories"
                                :products="products"
                            />
                        </v-col>
                    </v-row>
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
import { computed, ref, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import MembershipRulesEditor from './MembershipRulesEditor.vue'
import MembershipSlugField from './MembershipSlugField.vue'
import {
    organisationMembershipFormSchema,
    type OrganisationMembershipFormData,
} from '~/schemas/membership.schema'
import {
    MEMBERSHIP_BILLING_INTERVALS,
    MEMBERSHIP_DISCOUNT_TYPES,
} from '~/constants/membership.constants'
import { membershipDiscountToStorage, membershipMoneyToMinorUnits } from '~/utils/membership.util'
import { useMemberships } from '~/composables/useMemberships'
import { useToast } from '~/composables/useToast'
import type { MembershipType, OrganisationMembershipInput } from '~/types/membership.types'
import { isMembershipSlugConfirmedDuplicate } from '~/utils/membership-slug.util'

const props = defineProps<{
    modelValue: boolean
    organisationId: number
    organisationName?: string
    types: MembershipType[]
    categories: Array<{ title: string; value: number }>
    products: Array<{ title: string; value: number }>
}>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; saved: [] }>()
const typeOptions = computed(() =>
    props.types
        .filter((type) => type.isActive)
        .map((type) => ({ title: type.name, value: type.id }))
)
const memberships = useMemberships()
const { successFromResponse, errorFromError } = useToast()
const initial: OrganisationMembershipFormData = {
    membershipTypeId: 0,
    name: '',
    slug: '',
    description: null,
    tooltip: null,
    bannerImage: null,
    thumbnailImage: null,
    tierRank: 1,
    isChargeable: false,
    priceAmount: 0,
    billingInterval: 'MONTHLY',
    isActive: true,
    defaultDiscountType: 'NONE',
    defaultDiscountValue: 0,
    categoryRules: [],
    productRules: [],
}
const { errors, defineField, handleSubmit, isSubmitting, resetForm, setFieldValue } =
    useForm<OrganisationMembershipFormData>({
        validationSchema: toTypedSchema(organisationMembershipFormSchema),
        initialValues: initial,
    })
const [membershipTypeId] = defineField('membershipTypeId')
const [name] = defineField('name')
const [slug] = defineField('slug')
const [description] = defineField('description')
const [tooltip] = defineField('tooltip')
const [bannerImage] = defineField('bannerImage')
const [thumbnailImage] = defineField('thumbnailImage')
const [tierRank] = defineField('tierRank')
const [isChargeable] = defineField('isChargeable')
const [priceAmount] = defineField('priceAmount')
const [billingInterval] = defineField('billingInterval')
const [isActive] = defineField('isActive')
const [defaultDiscountType] = defineField('defaultDiscountType')
const [defaultDiscountValue] = defineField('defaultDiscountValue')
const [categoryRules] = defineField('categoryRules')
const [productRules] = defineField('productRules')
const slugAvailable = ref<boolean | null>(null)
watch(isChargeable, (value) => {
    if (!value) setFieldValue('priceAmount', 0)
})
watch(defaultDiscountType, (value) => {
    if (value === 'NONE') setFieldValue('defaultDiscountValue', 0)
})
const discountLabel = computed(() =>
    defaultDiscountType.value === 'PERCENTAGE' ? 'Default percentage' : 'Default amount (USD)'
)
const toCommand = (data: OrganisationMembershipFormData): OrganisationMembershipInput => ({
    ...data,
    priceAmount: membershipMoneyToMinorUnits(data.priceAmount),
    defaultDiscountValue: membershipDiscountToStorage(
        data.defaultDiscountType,
        data.defaultDiscountValue
    ),
    categoryRules: data.categoryRules.map((rule) => ({
        ...rule,
        discountValue: membershipDiscountToStorage(rule.discountType, rule.discountValue),
    })),
    productRules: data.productRules.map((rule) => ({
        ...rule,
        discountValue: membershipDiscountToStorage(rule.discountType, rule.discountValue),
    })),
})
const submitForm = handleSubmit(async (data) => {
    try {
        const response = await memberships.createOrganisationMembership(
            props.organisationId,
            toCommand(data)
        )
        successFromResponse(response, 'Membership created.')
        emit('saved')
        close()
    } catch (error) {
        errorFromError(error, 'Unable to create membership.')
    }
})
const submit = (): void => {
    if (isMembershipSlugConfirmedDuplicate(slugAvailable.value)) return
    void submitForm()
}
const close = (): void => {
    resetForm({ values: initial })
    emit('update:modelValue', false)
}
</script>
