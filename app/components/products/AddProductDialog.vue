<template>
    <v-dialog
        :model-value="modelValue"
        max-width="1400"
        scrollable
        persistent
        @update:model-value="emit('update:modelValue', $event)"
    >
        <v-card>
            <v-card-title class="d-flex align-center justify-space-between pa-4">
                <div>
                    <div class="text-h5">Add product</div>
                    <div class="text-caption text-medium-emphasis">
                        Create the catalog product and at least one sellable variant.
                    </div>
                </div>
                <v-btn icon="mdi-close" variant="text" @click="close" />
            </v-card-title>

            <v-divider />

            <v-card-text class="pa-6">
                <v-form @submit.prevent="save(values.isActive)">
                    <LazyGlobalsFormFieldErrors :errors="errors" />

                    <v-card variant="outlined" class="mb-5">
                        <v-card-title>Product information</v-card-title>
                        <v-card-text>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-text-field
                                        :model-value="values.name"
                                        label="Product name"
                                        variant="outlined"
                                        :error-messages="errors.name"
                                        @update:model-value="setName(String($event ?? ''))"
                                    />
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-text-field
                                        :model-value="values.slug"
                                        label="Slug"
                                        variant="outlined"
                                        :error-messages="errors.slug"
                                        @update:model-value="setSlug(String($event ?? ''))"
                                    />
                                </v-col>
                                <v-col cols="12">
                                    <FormsRichTextEditor
                                        :model-value="values.description ?? ''"
                                        @update:model-value="
                                            setFieldValue('description', $event || null)
                                        "
                                    />
                                </v-col>
                                <v-col cols="12" md="8">
                                    <v-autocomplete
                                        :model-value="values.categories"
                                        :items="categories"
                                        label="Categories"
                                        multiple
                                        chips
                                        closable-chips
                                        variant="outlined"
                                        :error-messages="errors.categories"
                                        @update:model-value="
                                            setFieldValue('categories', toNumberArray($event))
                                        "
                                    />
                                </v-col>
                                <v-col cols="6" md="2">
                                    <v-switch
                                        :model-value="values.isFeatured"
                                        label="Featured"
                                        color="primary"
                                        @update:model-value="
                                            setFieldValue('isFeatured', Boolean($event))
                                        "
                                    />
                                </v-col>
                                <v-col cols="6" md="2">
                                    <v-switch
                                        :model-value="values.isActive"
                                        label="Active"
                                        color="primary"
                                        @update:model-value="
                                            setFieldValue('isActive', Boolean($event))
                                        "
                                    />
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>

                    <v-card variant="outlined" class="mb-5">
                        <v-card-title>Product media</v-card-title>
                        <v-card-text>
                            <v-row>
                                <v-col cols="12" md="4">
                                    <div class="text-subtitle-2 mb-2">Thumbnail</div>
                                    <ThumbnailUpload
                                        :model-value="productImages.thumbnail"
                                        @update:model-value="updateProductThumbnail"
                                    />
                                </v-col>
                                <v-col cols="12" md="8">
                                    <div class="text-subtitle-2 mb-2">Gallery</div>
                                    <GalleryUpload
                                        :model-value="productImages.gallery"
                                        @update:model-value="
                                            updateProductImages({ gallery: $event })
                                        "
                                    />
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>

                    <div class="d-flex align-center justify-space-between mb-3">
                        <div>
                            <div class="text-h6">Variants</div>
                            <div class="text-caption text-medium-emphasis">
                                SKU, pricing, stock tracking, attributes, and bundle components are
                                managed on variants.
                            </div>
                        </div>
                        <v-btn prepend-icon="mdi-plus" variant="tonal" @click="addVariant">
                            Add variant
                        </v-btn>
                    </div>

                    <ProductVariantEditor
                        v-for="(variant, index) in values.variants"
                        :key="`new-${index}`"
                        :model-value="variant"
                        :images="variantImages[index] ?? emptyImageFiles()"
                        :index="index"
                        :can-remove="values.variants.length > 1"
                        :component-variants="componentVariantOptions"
                        :can-manage-inventory="canManageInventory"
                        :inventory-count="variant.inventory.length"
                        inventory-is-draft
                        :errors="errors"
                        @update:model-value="updateVariant(index, $event)"
                        @update:images="updateVariantImages(index, $event)"
                        @make-default="makeDefault(index)"
                        @manage-inventory="openInventory(index)"
                        @remove="removeVariant(index)"
                    />
                </v-form>
            </v-card-text>

            <v-divider />

            <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn variant="outlined" :disabled="saving" @click="close">Cancel</v-btn>
                <v-btn variant="tonal" :loading="saving || isSubmitting" @click="save(false)">
                    Save draft
                </v-btn>
                <v-btn color="primary" :loading="saving || isSubmitting" @click="save(true)">
                    Publish product
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <PlatformOpeningInventoryDialog
        v-if="selectedInventoryVariant"
        v-model="inventoryDialogOpen"
        :title="selectedInventoryVariant.sku || 'New platform variant'"
        :locations="locations"
        :draft-balances="selectedInventoryVariant.inventory"
        @update:draft-balances="updateSelectedInventory"
    />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useFieldArray, useForm } from 'vee-validate'
import GalleryUpload from '~/components/products/GalleryUpload.vue'
import ProductVariantEditor from '~/components/products/ProductVariantEditor.vue'
import PlatformOpeningInventoryDialog from '~/components/inventory/PlatformOpeningInventoryDialog.vue'
import ThumbnailUpload from '~/components/products/ThumbnailUpload.vue'
import { INVENTORY_PERMISSIONS } from '~/components/inventory/inventory.permissions'
import { useProductForm } from '~/composables/useProductForm'
import { useAccessStore } from '~/stores/access.store'
import { useToast } from '~/composables/useToast'
import { PRODUCT_MESSAGES } from '~/constants/messages.constants'
import {
    createProductSchema,
    type CreateProductFormData,
    type ProductVariantFormData,
} from '~/schemas/product.schema'
import type { ImageFiles } from '~/services/product/ProductFormService'
import type { CreateProductDTO, Product } from '~/types/product.types'
import type { InventoryDraftBalance } from '~/types/inventory.types'

interface SelectOption {
    title: string
    value: number
}

interface Props {
    modelValue: boolean
    categories: SelectOption[]
    locations: SelectOption[]
    availableProducts: Product[]
}

const props = withDefaults(defineProps<Props>(), {
    categories: () => [],
    locations: () => [],
    availableProducts: () => [],
})

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    submit: [product: Product]
}>()

const access = useAccessStore()
const canManageInventory = computed(
    () =>
        access.platformOrganisationId !== null &&
        access.can(INVENTORY_PERMISSIONS.WRITE, access.platformOrganisationId)
)
const { saveProduct, validateAvailability, saving } = useProductForm()
const toast = useToast()
const productImages = ref<ImageFiles>(emptyImageFiles())
const variantImages = ref<ImageFiles[]>([emptyImageFiles()])
const slugWasEdited = ref(false)
const inventoryDialogOpen = ref(false)
const inventoryVariantIndex = ref<number | null>(null)
const componentVariantOptions = computed(() =>
    props.availableProducts.flatMap((product) =>
        product.variants
            .filter((variant) => variant.isActive && !variant.isDeleted)
            .map((variant) => ({
                title: `${product.name} — ${variant.sku}`,
                value: variant.id,
            }))
    )
)

const { errors, handleSubmit, isSubmitting, resetForm, setFieldError, setFieldValue, values } =
    useForm<CreateProductFormData>({
        validationSchema: toTypedSchema(createProductSchema),
        initialValues: emptyProduct(),
        validateOnMount: false,
    })
const {
    push: appendVariant,
    remove: removeVariantAt,
    update: updateVariantAt,
} = useFieldArray<ProductVariantFormData>('variants')

function emptyImageFiles(): ImageFiles {
    return {
        thumbnail: null,
        gallery: [],
        removeExistingThumbnail: false,
        removedExistingGallery: [],
    }
}

function emptyVariant(isDefault = false): ProductVariantFormData {
    return {
        sku: '',
        price: 0,
        cog: 0,
        stockManaged: true,
        color: '',
        size: '',
        attributes: {},
        inventory: [],
        isDefault,
        isActive: true,
        bundleComponents: [],
    }
}

function emptyProduct(): CreateProductFormData {
    return {
        slug: '',
        name: '',
        description: null,
        isFeatured: false,
        isActive: true,
        categories: [],
        variants: [emptyVariant(true)],
    }
}

function resetDialog(): void {
    resetForm({ values: emptyProduct(), errors: {}, touched: {} })
    productImages.value = emptyImageFiles()
    variantImages.value = [emptyImageFiles()]
    slugWasEdited.value = false
    inventoryDialogOpen.value = false
    inventoryVariantIndex.value = null
}

function setName(name: string): void {
    setFieldValue('name', name)
    if (!slugWasEdited.value) setFieldValue('slug', toSlug(name))
}

function setSlug(slug: string): void {
    slugWasEdited.value = true
    setFieldValue('slug', toSlug(slug))
}

function toSlug(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
}

function toNumberArray(value: unknown): number[] {
    return Array.isArray(value) ? value.map(Number).filter(Number.isFinite) : []
}

function updateProductImages(patch: Partial<ImageFiles>): void {
    productImages.value = { ...productImages.value, ...patch }
}

function updateProductThumbnail(thumbnail: File | null): void {
    updateProductImages({ thumbnail })
}

function updateVariant(index: number, variant: ProductVariantFormData): void {
    updateVariantAt(index, variant)
}

const selectedInventoryVariant = computed(() =>
    inventoryVariantIndex.value === null
        ? null
        : (values.variants[inventoryVariantIndex.value] ?? null)
)

function openInventory(index: number): void {
    inventoryVariantIndex.value = index
    inventoryDialogOpen.value = true
}

function updateSelectedInventory(inventory: InventoryDraftBalance[]): void {
    if (inventoryVariantIndex.value === null) return
    const current = values.variants[inventoryVariantIndex.value]
    if (!current) return
    updateVariantAt(inventoryVariantIndex.value, { ...current, inventory })
}

function updateVariantImages(index: number, images: ImageFiles): void {
    variantImages.value = variantImages.value.map((current, currentIndex) =>
        currentIndex === index ? images : current
    )
}

function addVariant(): void {
    appendVariant(emptyVariant(false))
    variantImages.value = [...variantImages.value, emptyImageFiles()]
}

function removeVariant(index: number): void {
    if (values.variants.length === 1) return
    const removedWasDefault = values.variants[index]?.isDefault ?? false
    removeVariantAt(index)
    if (removedWasDefault && values.variants[0]) {
        updateVariantAt(0, { ...values.variants[0], isDefault: true })
    }
    variantImages.value = variantImages.value.filter((_, currentIndex) => currentIndex !== index)
}

function makeDefault(index: number): void {
    values.variants.forEach((variant, currentIndex) => {
        updateVariantAt(currentIndex, {
            ...variant,
            isDefault: currentIndex === index,
        })
    })
}

const submitForm = handleSubmit(async (data) => {
    const availabilityErrors = await validateAvailability(data as CreateProductDTO)
    if (availabilityErrors.slug) setFieldError('slug', availabilityErrors.slug)
    Object.entries(availabilityErrors.variants).forEach(([index, message]) => {
        setFieldError(`variants[${Number(index)}].sku`, message)
    })
    if (availabilityErrors.slug || Object.keys(availabilityErrors.variants).length > 0) return

    try {
        const savedProduct = await saveProduct(
            data as CreateProductDTO,
            productImages.value,
            variantImages.value
        )
        toast.success(PRODUCT_MESSAGES.CREATE_SUCCESS)
        emit('submit', savedProduct)
        close()
    } catch (error) {
        toast.errorFromError(error, PRODUCT_MESSAGES.CREATE_ERROR)
    }
})

function save(isActive: boolean): void {
    setFieldValue('isActive', isActive)
    void submitForm()
}

function close(): void {
    inventoryDialogOpen.value = false
    inventoryVariantIndex.value = null
    emit('update:modelValue', false)
}

watch(
    () => props.modelValue,
    (isOpen) => {
        if (isOpen) resetDialog()
    },
    { immediate: true }
)

watch(inventoryDialogOpen, (isOpen) => {
    if (!isOpen) inventoryVariantIndex.value = null
})
</script>
