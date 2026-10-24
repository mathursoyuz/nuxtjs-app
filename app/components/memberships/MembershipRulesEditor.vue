<template>
    <v-card variant="outlined" class="mb-4">
        <v-card-title>Category rules</v-card-title>
        <v-card-text>
            <div
                v-for="(rule, index) in categoryRules"
                :key="`category-${index}`"
                class="d-flex ga-2 align-center mb-2"
            >
                <v-select
                    :model-value="rule.categoryId"
                    :items="categories"
                    label="Category"
                    @update:model-value="updateCategory(index, { categoryId: Number($event) })"
                />
                <v-select
                    :model-value="rule.discountType"
                    :items="MEMBERSHIP_DISCOUNT_TYPES"
                    label="Discount"
                    @update:model-value="
                        updateCategory(index, { discountType: $event as MembershipDiscountType })
                    "
                />
                <v-text-field
                    :model-value="rule.discountValue"
                    type="number"
                    min="0"
                    :label="discountLabel(rule.discountType)"
                    @update:model-value="updateCategory(index, { discountValue: Number($event) })"
                />
                <v-btn
                    icon="mdi-delete"
                    color="error"
                    variant="text"
                    @click="removeCategory(index)"
                />
            </div>
            <v-btn variant="tonal" prepend-icon="mdi-plus" @click="addCategory">
                Add category rule
            </v-btn>
        </v-card-text>
    </v-card>
    <v-card variant="outlined">
        <v-card-title>Product exceptions and overrides</v-card-title>
        <v-card-text>
            <div
                v-for="(rule, index) in productRules"
                :key="`product-${index}`"
                class="d-flex ga-2 align-center mb-2"
            >
                <v-select
                    :model-value="rule.organisationProductId"
                    :items="products"
                    label="Product"
                    @update:model-value="
                        updateProduct(index, { organisationProductId: Number($event) })
                    "
                />
                <v-select
                    :model-value="rule.ruleType"
                    :items="MEMBERSHIP_PRODUCT_RULE_TYPES"
                    label="Rule"
                    @update:model-value="
                        updateProduct(index, { ruleType: $event as MembershipProductRuleType })
                    "
                />
                <v-select
                    :model-value="rule.discountType"
                    :items="MEMBERSHIP_DISCOUNT_TYPES"
                    label="Discount"
                    :disabled="rule.ruleType === 'EXCLUDE'"
                    @update:model-value="
                        updateProduct(index, { discountType: $event as MembershipDiscountType })
                    "
                />
                <v-text-field
                    :model-value="rule.discountValue"
                    type="number"
                    min="0"
                    :label="discountLabel(rule.discountType)"
                    :disabled="rule.ruleType === 'EXCLUDE'"
                    @update:model-value="updateProduct(index, { discountValue: Number($event) })"
                />
                <v-btn
                    icon="mdi-delete"
                    color="error"
                    variant="text"
                    @click="removeProduct(index)"
                />
            </div>
            <v-btn variant="tonal" prepend-icon="mdi-plus" @click="addProduct">
                Add product rule
            </v-btn>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import {
    MEMBERSHIP_DISCOUNT_TYPES,
    MEMBERSHIP_PRODUCT_RULE_TYPES,
} from '~/constants/membership.constants'
import type {
    MembershipCategoryRule,
    MembershipDiscountType,
    MembershipProductRule,
    MembershipProductRuleType,
} from '~/types/membership.types'

defineProps<{
    categories: Array<{ title: string; value: number }>
    products: Array<{ title: string; value: number }>
}>()
const categoryRules = defineModel<MembershipCategoryRule[]>('categoryRules', { required: true })
const productRules = defineModel<MembershipProductRule[]>('productRules', { required: true })
const addCategory = (): void => {
    categoryRules.value = [
        ...categoryRules.value,
        { categoryId: 0, discountType: 'NONE', discountValue: 0 },
    ]
}
const updateCategory = (index: number, patch: Partial<MembershipCategoryRule>): void => {
    categoryRules.value = categoryRules.value.map((rule, current) =>
        current === index ? { ...rule, ...patch } : rule
    )
}
const removeCategory = (index: number): void => {
    categoryRules.value = categoryRules.value.filter((_, current) => current !== index)
}
const addProduct = (): void => {
    productRules.value = [
        ...productRules.value,
        { organisationProductId: 0, ruleType: 'INCLUDE', discountType: 'NONE', discountValue: 0 },
    ]
}
const updateProduct = (index: number, patch: Partial<MembershipProductRule>): void => {
    productRules.value = productRules.value.map((rule, current) =>
        current === index ? { ...rule, ...patch } : rule
    )
    if (patch.ruleType === 'EXCLUDE')
        productRules.value = productRules.value.map((rule, current) =>
            current === index ? { ...rule, discountType: 'NONE', discountValue: 0 } : rule
        )
}
const removeProduct = (index: number): void => {
    productRules.value = productRules.value.filter((_, current) => current !== index)
}
const discountLabel = (type: MembershipDiscountType): string =>
    type === 'PERCENTAGE' ? 'Percentage' : 'Amount (USD)'
</script>
