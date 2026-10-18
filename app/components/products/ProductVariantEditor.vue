<template>
    <v-card variant="outlined" class="mb-4">
        <v-card-title class="d-flex align-center justify-space-between">
            <div class="d-flex align-center ga-2">
                <span>Variant {{ index + 1 }}</span>
                <v-chip v-if="variant.isDefault" color="primary" size="small">Default</v-chip>
                <v-chip v-if="variant.bundleComponents.length" color="success" size="small">
                    Bundle
                </v-chip>
            </div>
            <v-btn
                v-if="canRemove"
                icon="mdi-delete"
                color="error"
                variant="text"
                size="small"
                @click="emit('remove')"
            />
        </v-card-title>

        <v-card-text>
            <v-row>
                <v-col cols="12" md="4">
                    <ThumbnailUpload
                        :model-value="images.thumbnail"
                        :file-url="existingThumbnailUrl"
                        @update:model-value="handleThumbnailUpdate"
                    />
                </v-col>
                <v-col cols="12" md="8">
                    <GalleryUpload
                        :can-remove-existing="access.can(PRODUCT_PERMISSIONS.DELETE)"
                        :model-value="images.gallery"
                        :existing-gallery="existingGallery"
                        @update:model-value="updateImages({ gallery: $event })"
                        @remove-existing-image="removeExistingGalleryImage"
                    />
                </v-col>

                <v-col cols="12" md="6">
                    <v-text-field
                        :model-value="variant.sku"
                        label="SKU"
                        variant="outlined"
                        density="compact"
                        :error-messages="errorFor('sku')"
                        @update:model-value="updateVariant({ sku: toStringValue($event) })"
                    />
                </v-col>
                <v-col cols="12" md="3">
                    <v-text-field
                        :model-value="variant.price"
                        label="Price"
                        type="number"
                        prefix="$"
                        variant="outlined"
                        density="compact"
                        :error-messages="errorFor('price')"
                        @update:model-value="updateVariant({ price: toNumber($event) })"
                    />
                </v-col>
                <v-col cols="12" md="3">
                    <v-text-field
                        :model-value="variant.cog"
                        label="COG"
                        type="number"
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
                <v-col
                    v-if="variant.stockManaged && canManageInventory"
                    cols="12"
                    md="8"
                    class="d-flex align-center"
                >
                    <v-btn
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
                <v-col cols="12" md="4" />

                <v-col cols="12" md="4">
                    <v-switch
                        :model-value="variant.isDefault"
                        label="Default variant"
                        color="primary"
                        hide-details
                        @update:model-value="$event && emit('make-default')"
                    />
                </v-col>
                <v-col cols="12" md="4">
                    <v-switch
                        :model-value="variant.isActive"
                        label="Active"
                        color="primary"
                        hide-details
                        @update:model-value="updateVariant({ isActive: Boolean($event) })"
                    />
                </v-col>

                <v-col cols="12">
                    <div class="d-flex align-center justify-space-between mb-2">
                        <span class="text-subtitle-1">Attributes</span>
                        <v-btn
                            size="small"
                            variant="tonal"
                            prepend-icon="mdi-plus"
                            @click="addAttribute"
                        >
                            Attribute
                        </v-btn>
                    </div>
                    <v-row v-for="(attribute, attributeIndex) in attributes" :key="attributeIndex">
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
                                Adding components makes this variant a bundle.
                            </div>
                        </div>
                        <v-btn
                            size="small"
                            variant="tonal"
                            prepend-icon="mdi-plus"
                            @click="addComponent"
                        >
                            Component
                        </v-btn>
                    </div>
                    <v-row
                        v-for="(component, componentIndex) in variant.bundleComponents"
                        :key="componentIndex"
                    >
                        <v-col cols="7">
                            <v-autocomplete
                                :model-value="component.componentVariantId"
                                :items="availableComponentVariants"
                                label="Component variant"
                                variant="outlined"
                                density="compact"
                                @update:model-value="
                                    updateComponent(componentIndex, {
                                        componentVariantId: toInteger($event),
                                    })
                                "
                            />
                        </v-col>
                        <v-col cols="3">
                            <v-text-field
                                :model-value="component.quantity"
                                label="Quantity"
                                type="number"
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
import { PRODUCT_PERMISSIONS } from '~/components/products/products.permissions'

import { useAccessStore } from '~/stores/access.store'
const access = useAccessStore()
import { computed } from 'vue'
import GalleryUpload from '~/components/products/GalleryUpload.vue'
import ThumbnailUpload from '~/components/products/ThumbnailUpload.vue'
import type { ProductVariantFormData } from '~/schemas/product.schema'
import type { ImageFiles } from '~/services/product/ProductFormService'

interface ComponentVariantOption {
    title: string
    value: number
}

interface AttributeRow {
    key: string
    value: string
}

type VariantErrorField = 'sku' | 'price' | 'cog'
type BundleComponentPatch = Partial<ProductVariantFormData['bundleComponents'][number]>

interface Props {
    images: ImageFiles
    index: number
    canRemove: boolean
    componentVariants: ComponentVariantOption[]
    canManageInventory?: boolean
    inventoryIsDraft?: boolean
    inventoryCount?: number
    existingGallery?: string[]
    existingThumbnail?: string | null
    errors?: Record<string, string | undefined>
}

const props = withDefaults(defineProps<Props>(), {
    canManageInventory: false,
    inventoryIsDraft: false,
    inventoryCount: 0,
    existingGallery: () => [],
    existingThumbnail: null,
    errors: () => ({}),
})

const variant = defineModel<ProductVariantFormData>({ required: true })
const emit = defineEmits<{
    'update:images': [value: ImageFiles]
    'make-default': []
    'manage-inventory': []
    remove: []
}>()

const config = useRuntimeConfig()
const availableComponentVariants = computed(() =>
    props.componentVariants.filter((option) => option.value !== variant.value.id)
)

const attributes = computed(() =>
    Object.entries(variant.value.attributes).map(([key, value]) => ({ key, value }))
)
const existingThumbnailUrl = computed(() =>
    props.existingThumbnail
        ? `${config.public.apiBaseUrl}/uploads/products/${props.existingThumbnail}`
        : null
)

const updateVariant = (patch: Partial<ProductVariantFormData>): void => {
    variant.value = { ...variant.value, ...patch }
}

const setStockManaged = (stockManaged: boolean): void => {
    updateVariant({
        stockManaged,
        ...(!stockManaged ? { inventory: [] } : {}),
    })
}

const updateImages = (patch: Partial<ImageFiles>): void => {
    emit('update:images', { ...props.images, ...patch })
}

const handleThumbnailUpdate = (thumbnail: File | null): void => {
    updateImages({
        thumbnail,
        removeExistingThumbnail: thumbnail === null && Boolean(props.existingThumbnail),
    })
}

const removeExistingGalleryImage = (filename: string): void => {
    updateImages({
        removedExistingGallery: [...props.images.removedExistingGallery, filename],
    })
}

const errorFor = (field: VariantErrorField): string | undefined => {
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
    return Math.max(0, Math.trunc(toNumber(value)))
}

const setAttributes = (rows: AttributeRow[]): void => {
    updateVariant({
        attributes: Object.fromEntries(
            rows.filter((row) => row.key.trim()).map((row) => [row.key.trim(), row.value])
        ),
    })
}

const addAttribute = (): void => {
    setAttributes([
        ...attributes.value,
        { key: `attribute_${attributes.value.length + 1}`, value: '' },
    ])
}

const updateAttribute = (index: number, field: keyof AttributeRow, value: string): void => {
    const rows = attributes.value.map((row) => ({ ...row }))
    if (!rows[index]) return
    rows[index][field] = value
    setAttributes(rows)
}

const removeAttribute = (index: number): void => {
    setAttributes(attributes.value.filter((_, rowIndex) => rowIndex !== index))
}

const addComponent = (): void => {
    updateVariant({
        bundleComponents: [
            ...variant.value.bundleComponents,
            {
                componentVariantId: 0,
                quantity: 1,
                sortOrder: variant.value.bundleComponents.length,
            },
        ],
    })
}

const updateComponent = (index: number, patch: BundleComponentPatch): void => {
    updateVariant({
        bundleComponents: variant.value.bundleComponents.map((component, componentIndex) =>
            componentIndex === index ? { ...component, ...patch } : component
        ),
    })
}

const removeComponent = (index: number): void => {
    updateVariant({
        bundleComponents: variant.value.bundleComponents
            .filter((_, componentIndex) => componentIndex !== index)
            .map((component, sortOrder) => ({ ...component, sortOrder })),
    })
}
</script>
