<template>
    <v-card variant="outlined" class="mb-4">
        <v-card-title class="d-flex align-center justify-space-between">
            <div class="d-flex align-center ga-2">
                <span>Organisation variant {{ index + 1 }}</span>
                <v-chip size="small" :color="variant.id ? 'info' : 'success'" variant="tonal">
                    {{ variant.id ? 'Existing' : 'New' }}
                </v-chip>
            </div>
            <v-btn
                v-if="canRemove"
                icon="mdi-delete"
                color="error"
                variant="text"
                size="small"
                title="Remove variant"
                @click="emit('remove')"
            />
        </v-card-title>

        <v-card-text>
            <v-row>
                <v-col cols="12" md="6">
                    <v-text-field
                        :model-value="variant.sku"
                        label="Organisation SKU"
                        variant="outlined"
                        density="compact"
                        :error-messages="errorFor('sku')"
                        @update:model-value="updateVariant({ sku: toStringValue($event) })"
                    />
                </v-col>
                <v-col cols="12" md="4">
                    <v-text-field
                        :model-value="variant.size"
                        label="Size"
                        variant="outlined"
                        density="compact"
                        @update:model-value="updateVariant({ size: toStringValue($event) })"
                    />
                </v-col>
                <v-col cols="12" md="4">
                    <v-text-field
                        :model-value="variant.color"
                        label="Color"
                        variant="outlined"
                        density="compact"
                        @update:model-value="updateVariant({ color: toStringValue($event) })"
                    />
                </v-col>
                <v-col cols="12" md="4">
                    <v-text-field
                        :model-value="variant.price"
                        label="Organisation selling price"
                        type="number"
                        min="0"
                        prefix="$"
                        variant="outlined"
                        density="compact"
                        :error-messages="errorFor('price')"
                        @update:model-value="updateVariant({ price: toNumber($event) })"
                    />
                </v-col>
                <v-col cols="12" md="4">
                    <v-text-field
                        :model-value="variant.cog"
                        label="COG"
                        type="number"
                        min="0"
                        prefix="$"
                        variant="outlined"
                        density="compact"
                        :error-messages="errorFor('cog')"
                        @update:model-value="updateVariant({ cog: toNumber($event) })"
                    />
                </v-col>
                <v-col cols="12" md="4">
                    <v-switch
                        :model-value="variant.stockManaged"
                        label="Track stock"
                        color="primary"
                        hide-details
                        @update:model-value="setStockManaged(Boolean($event))"
                    />
                </v-col>
                <v-col cols="12" md="4">
                    <v-switch
                        :model-value="variant.isActive"
                        label="Active variant"
                        color="primary"
                        hide-details
                        @update:model-value="updateVariant({ isActive: Boolean($event) })"
                    />
                </v-col>
                <v-col cols="12" md="4" class="d-flex align-center">
                    <v-btn
                        v-if="variant.stockManaged && canManageInventory"
                        block
                        color="primary"
                        variant="tonal"
                        prepend-icon="mdi-warehouse"
                        @click="emit('manage-inventory')"
                    >
                        {{
                            inventoryIsDraft || !variant.id
                                ? `Opening inventory (${inventoryCount})`
                                : 'Manage inventory'
                        }}
                    </v-btn>
                </v-col>
                <v-col v-if="errorFor('inventory')" cols="12">
                    <v-alert type="error" variant="tonal" density="compact">
                        {{ errorFor('inventory') }}
                    </v-alert>
                </v-col>

                <v-col cols="12">
                    <div class="d-flex align-center justify-space-between mb-2">
                        <span class="text-subtitle-1">Attributes</span>
                        <v-btn
                            v-if="!isPlatformProduct"
                            size="small"
                            variant="tonal"
                            prepend-icon="mdi-plus"
                            @click="addAttribute"
                        >
                            Add attribute
                        </v-btn>
                    </div>
                    <v-table v-if="isPlatformProduct" density="compact">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="attribute in attributes" :key="attribute.key">
                                <td>{{ attribute.key }}</td>
                                <td>{{ attribute.value }}</td>
                            </tr>
                            <tr v-if="attributes.length === 0">
                                <td colspan="2" class="text-center text-medium-emphasis">
                                    No attributes
                                </td>
                            </tr>
                        </tbody>
                    </v-table>
                    <v-row
                        v-else
                        v-for="(attribute, attributeIndex) in attributes"
                        :key="attributeIndex"
                    >
                        <v-col cols="5">
                            <v-text-field
                                :model-value="attribute.key"
                                label="Name"
                                density="compact"
                                variant="outlined"
                                @update:model-value="
                                    updateAttribute(attributeIndex, 'key', toStringValue($event))
                                "
                            />
                        </v-col>
                        <v-col cols="5">
                            <v-text-field
                                :model-value="attribute.value"
                                label="Value"
                                density="compact"
                                variant="outlined"
                                @update:model-value="
                                    updateAttribute(attributeIndex, 'value', toStringValue($event))
                                "
                            />
                        </v-col>
                        <v-col cols="2">
                            <v-btn
                                icon="mdi-delete"
                                color="error"
                                variant="text"
                                @click="removeAttribute(attributeIndex)"
                            />
                        </v-col>
                    </v-row>
                </v-col>

                <v-col cols="12">
                    <div class="d-flex align-center justify-space-between mb-2">
                        <div>
                            <div class="text-subtitle-1">Bundle components</div>
                            <div class="text-caption text-medium-emphasis">
                                {{
                                    isPlatformProduct
                                        ? 'Procured bundle composition is read-only.'
                                        : 'Components use variants owned by this organisation.'
                                }}
                            </div>
                        </div>
                        <v-btn
                            v-if="!isPlatformProduct"
                            size="small"
                            variant="tonal"
                            prepend-icon="mdi-plus"
                            @click="addComponent"
                        >
                            Add bundle component
                        </v-btn>
                    </div>
                    <v-table v-if="isPlatformProduct" density="compact">
                        <thead>
                            <tr>
                                <th>Component variant</th>
                                <th>Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="component in variant.bundleComponents"
                                :key="component.componentOrganisationProductVariantId"
                            >
                                <td>
                                    {{ componentTitle(component.componentOrganisationProductVariantId) }}
                                </td>
                                <td>{{ component.quantity }}</td>
                            </tr>
                            <tr v-if="variant.bundleComponents.length === 0">
                                <td colspan="2" class="text-center text-medium-emphasis">
                                    No bundle components
                                </td>
                            </tr>
                        </tbody>
                    </v-table>
                    <v-row
                        v-else
                        v-for="(component, componentIndex) in variant.bundleComponents"
                        :key="componentIndex"
                    >
                        <v-col cols="7">
                            <v-autocomplete
                                :model-value="component.componentOrganisationProductVariantId"
                                :items="availableComponentVariants"
                                label="Organisation component variant"
                                variant="outlined"
                                density="compact"
                                @update:model-value="
                                    updateComponent(componentIndex, {
                                        componentOrganisationProductVariantId: toInteger($event),
                                    })
                                "
                            />
                        </v-col>
                        <v-col cols="3">
                            <v-text-field
                                :model-value="component.quantity"
                                label="Quantity"
                                type="number"
                                min="1"
                                variant="outlined"
                                density="compact"
                                @update:model-value="
                                    updateComponent(componentIndex, { quantity: toInteger($event) })
                                "
                            />
                        </v-col>
                        <v-col cols="2">
                            <v-btn
                                icon="mdi-delete"
                                color="error"
                                variant="text"
                                @click="removeComponent(componentIndex)"
                            />
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import type { OrganisationProductVariantFormData } from '~/schemas/organisation-product.schema'

type OrganisationVariantErrorField = 'sku' | 'price' | 'cog' | 'inventory'

interface Props {
    index: number
    canRemove: boolean
    isPlatformProduct: boolean
    componentVariants: Array<{ title: string; value: number }>
    canManageInventory: boolean
    inventoryIsDraft?: boolean
    inventoryCount?: number
    errors?: Record<string, string | undefined>
}

const props = withDefaults(defineProps<Props>(), {
    inventoryCount: 0,
    inventoryIsDraft: false,
    errors: () => ({}),
})
const variant = defineModel<OrganisationProductVariantFormData>({ required: true })
const isPlatformProduct = computed(() => props.isPlatformProduct)
const attributes = computed(() =>
    Object.entries(variant.value.attributes).map(([key, value]) => ({ key, value }))
)
const availableComponentVariants = computed(() =>
    props.componentVariants.filter((option) => option.value !== variant.value.id)
)
const emit = defineEmits<{
    'manage-inventory': []
    remove: []
}>()

const updateVariant = (patch: Partial<OrganisationProductVariantFormData>): void => {
    variant.value = { ...variant.value, ...patch }
}

const setStockManaged = (stockManaged: boolean): void => {
    updateVariant({
        stockManaged,
        ...(!stockManaged ? { inventory: [] } : {}),
    })
}

const errorFor = (field: OrganisationVariantErrorField): string | undefined => {
    return (
        props.errors[`variants[${props.index}].${field}`] ??
        props.errors[`variants.${props.index}.${field}`]
    )
}

const toStringValue = (value: unknown): string => String(value ?? '')

const toNumber = (value: unknown): number => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
}

const toInteger = (value: unknown): number => {
    const parsed = Number(value)
    return Number.isInteger(parsed) ? parsed : 0
}

const addAttribute = (): void => {
    updateVariant({
        attributes: {
            ...variant.value.attributes,
            [`attribute_${attributes.value.length + 1}`]: '',
        },
    })
}

const updateAttribute = (index: number, field: 'key' | 'value', value: string): void => {
    const rows = [...attributes.value]
    const current = rows[index]
    if (!current) return
    rows[index] = { ...current, [field]: value }
    updateVariant({
        attributes: Object.fromEntries(
            rows
                .filter((attribute) => attribute.key.trim())
                .map((attribute) => [attribute.key.trim(), attribute.value])
        ),
    })
}

const removeAttribute = (index: number): void => {
    updateVariant({
        attributes: Object.fromEntries(
            attributes.value
                .filter((_, currentIndex) => currentIndex !== index)
                .map((attribute) => [attribute.key, attribute.value])
        ),
    })
}

const componentTitle = (variantId: number): string =>
    props.componentVariants.find((option) => option.value === variantId)?.title ??
    `Variant #${variantId}`

const addComponent = (): void => {
    updateVariant({
        bundleComponents: [
            ...variant.value.bundleComponents,
            {
                componentOrganisationProductVariantId: 0,
                quantity: 1,
                sortOrder: variant.value.bundleComponents.length,
            },
        ],
    })
}

const updateComponent = (
    index: number,
    patch: Partial<OrganisationProductVariantFormData['bundleComponents'][number]>
): void => {
    updateVariant({
        bundleComponents: variant.value.bundleComponents.map((component, currentIndex) =>
            currentIndex === index ? { ...component, ...patch } : component
        ),
    })
}

const removeComponent = (index: number): void => {
    updateVariant({
        bundleComponents: variant.value.bundleComponents
            .filter((_, currentIndex) => currentIndex !== index)
            .map((component, sortOrder) => ({ ...component, sortOrder })),
    })
}
</script>
