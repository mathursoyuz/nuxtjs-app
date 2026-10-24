<template>
    <v-dialog
        :model-value="modelValue"
        max-width="1200"
        scrollable
        persistent
        @update:model-value="emit('update:modelValue', $event)"
    >
        <v-card>
            <DialogsDialogHeader
                title="Edit organisation white-label product"
                :organisation-name="organisationName"
                entity-label="Product"
                :entity-name="organisationProduct?.name"
                @close="close"
            />

            <v-divider />

            <v-card-text class="pa-5">
                <v-alert v-if="!organisationProduct" type="warning" variant="tonal">
                    Select a organisation product before editing.
                </v-alert>

                <v-form v-else @submit.prevent="submit">
                    <FormFieldErrors :errors="errors" />

                    <v-card variant="outlined" class="mb-5">
                        <v-card-title>Organisation product information</v-card-title>
                        <v-card-text>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-text-field
                                        v-model="name"
                                        label="White-label product name"
                                        variant="outlined"
                                        :error-messages="errors.name"
                                    />
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-text-field
                                        v-model="slug"
                                        label="Organisation slug"
                                        variant="outlined"
                                        :error-messages="errors.slug"
                                    />
                                </v-col>
                                <v-col cols="12">
                                    <FormsRichTextEditor
                                        :model-value="description ?? ''"
                                        @update:model-value="description = $event || null"
                                    />
                                </v-col>
                                <v-col cols="12">
                                    <v-autocomplete
                                        :model-value="values.categoryIds"
                                        :items="categoryOptions"
                                        item-title="title"
                                        item-value="value"
                                        label="Product categories"
                                        variant="outlined"
                                        multiple
                                        chips
                                        closable-chips
                                        :loading="loadingCategories"
                                        :error-messages="errors.categoryIds"
                                        @update:model-value="
                                            setFieldValue('categoryIds', toNumberArray($event))
                                        "
                                    />
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-switch
                                        v-model="isActive"
                                        label="Active product"
                                        color="primary"
                                    />
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>

                    <v-card variant="outlined" class="mb-5">
                        <v-card-title>Organisation product media</v-card-title>
                        <v-card-text>
                            <v-row>
                                <v-col cols="12" md="4">
                                    <ThumbnailUpload v-model="thumbnail" :file-url="thumbnailUrl" />
                                </v-col>
                                <v-col cols="12" md="8">
                                    <GalleryUpload
                                        :can-remove-existing="
                                            access.can(
                                                ORGANISATION_PRODUCT_PERMISSIONS.DELETE,
                                                organisationId
                                            )
                                        "
                                        v-model="gallery"
                                        :existing-gallery="visibleGallery"
                                        @remove-existing-image="removeExistingGallery"
                                    />
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>

                    <div class="d-flex align-center justify-space-between mb-3">
                        <div>
                            <div class="text-h6">Organisation variants</div>
                            <div class="text-caption text-medium-emphasis">
                                Platform source mappings remain unchanged while organisation labels
                                and selling details can be edited.
                            </div>
                        </div>
                        <v-btn
                            v-if="!organisationProduct.isPlatformProduct"
                            prepend-icon="mdi-plus"
                            variant="tonal"
                            @click="addVariant"
                        >
                            Add variant
                        </v-btn>
                    </div>

                    <OrganisationProductVariantEditor
                        v-for="(variant, index) in values.variants"
                        :key="variant.id ?? `new-${index}`"
                        :model-value="variant"
                        :index="index"
                        :can-remove="canRemoveVariant(index)"
                        :is-platform-product="organisationProduct.isPlatformProduct"
                        :component-variants="componentVariantOptions"
                        :inventory-count="variant.inventory.length"
                        :inventory-is-draft="isOpeningInventory(index)"
                        :can-manage-inventory="canManageInventory"
                        :errors="errors"
                        @update:model-value="updateVariantAt(index, $event)"
                        @manage-inventory="openInventory(index)"
                        @remove="removeVariant(index)"
                    />
                </v-form>
            </v-card-text>

            <v-divider />
            <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn variant="outlined" :disabled="saving" @click="close">Cancel</v-btn>
                <v-btn
                    color="primary"
                    :disabled="!organisationProduct"
                    :loading="saving || isSubmitting"
                    @click="submit"
                >
                    Update organisation product
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <OrganisationInventoryManagementDialog
        v-if="selectedInventoryVariant"
        v-model="inventoryDialogOpen"
        :organisation-id="organisationId"
        :entity-id="selectedInventoryVariant.id ?? 0"
        :title="selectedInventoryVariant.sku || 'New organisation variant'"
        :draft="selectedInventoryIsDraft"
        :draft-balances="selectedInventoryVariant.inventory"
        :default-low-stock-threshold="0"
        @update:draft-balances="updateSelectedInventory"
        @saved="handleInventorySaved"
    />
</template>

<script setup lang="ts">
import { ORGANISATION_PRODUCT_PERMISSIONS } from '~/components/organisation-products/organisation-products.permissions'
import { INVENTORY_PERMISSIONS } from '~/components/inventory/inventory.permissions'

import { useAccessStore } from '~/stores/access.store'
const access = useAccessStore()
import { computed, ref, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useFieldArray, useForm } from 'vee-validate'
import OrganisationProductVariantEditor from '~/components/organisation-products/OrganisationProductVariantEditor.vue'
import FormFieldErrors from '~/components/globals/FormFieldErrors.vue'
import OrganisationInventoryManagementDialog from '~/components/inventory/OrganisationInventoryManagementDialog.vue'
import GalleryUpload from '~/components/products/GalleryUpload.vue'
import ThumbnailUpload from '~/components/products/ThumbnailUpload.vue'
import { useToast } from '~/composables/useToast'
import { ORGANISATION_PRODUCT_MESSAGES } from '~/constants/messages.constants'
import {
    organisationProductFormSchema,
    type OrganisationProductFormData,
    type OrganisationProductVariantFormData,
} from '~/schemas/organisation-product.schema'
import type { OrganisationProductApiService } from '~/services/api/wrappers/organisation-product.api'
import type {
    OrganisationProduct,
    UpdateOrganisationProductDTO,
} from '~/types/organisation-product.types'
import type { InventoryDraftBalance } from '~/types/inventory.types'
import { getFullImageUrl } from '~/utils/image.util'
import type { CategoryApiService } from '~/services/api/wrappers/category.api'

interface Props {
    modelValue: boolean
    organisationId: number
    organisationProduct: OrganisationProduct | null
    organisationName: string
    availableProducts?: OrganisationProduct[]
}

const props = withDefaults(defineProps<Props>(), {
    organisationProduct: null,
    availableProducts: () => [],
})
const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    submit: []
}>()
const canManageInventory = computed(() =>
    access.can(INVENTORY_PERMISSIONS.WRITE, props.organisationId)
)

const nuxtApp = useNuxtApp()
const organisationProductApi = nuxtApp.$organisationProductApi as OrganisationProductApiService
const categoryApi = nuxtApp.$categoryApi as CategoryApiService
const { successFromResponse, errorFromError } = useToast()
const saving = ref(false)
const thumbnail = ref<File | null>(null)
const gallery = ref<File[]>([])
const visibleGallery = ref<string[]>([])
const removedGallery = ref<string[]>([])
const inventoryDialogOpen = ref(false)
const inventoryVariantIndex = ref<number | null>(null)
const categoryOptions = ref<Array<{ title: string; value: number }>>([])
const loadingCategories = ref(false)
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

const emptyVariant = (): OrganisationProductVariantFormData => ({
    platformProductVariantId: undefined,
    sku: '',
    price: 0,
    cog: 0,
    stockManaged: true,
    color: '',
    size: '',
    attributes: {},
    inventory: [],
    bundleComponents: [],
    isActive: true,
})

const emptyForm = (): OrganisationProductFormData => ({
    slug: '',
    name: '',
    description: null,
    categoryIds: [],
    variants: [emptyVariant()],
    isActive: true,
})

const productToForm = (product: OrganisationProduct): OrganisationProductFormData => ({
    slug: product.slug,
    name: product.name,
    description: product.description,
    categoryIds: [...product.categoryIds],
    variants: product.variants.map((variant) => ({
        id: variant.id,
        platformProductVariantId: variant.platformProductVariantId ?? undefined,
        sku: variant.sku,
        price: variant.price,
        cog: variant.cog,
        stockManaged: variant.stockManaged,
        color: variant.color,
        size: variant.size,
        attributes: variant.attributes,
        inventory: [],
        bundleComponents: variant.bundleComponents.map((component) => ({
            componentOrganisationProductVariantId: component.componentOrganisationProductVariantId,
            quantity: component.quantity,
            sortOrder: component.sortOrder,
        })),
        isActive: variant.isActive,
    })),
    isActive: product.isActive,
})

const { errors, handleSubmit, isSubmitting, resetForm, defineField, setFieldValue, values } =
    useForm<OrganisationProductFormData>({
        validationSchema: toTypedSchema(organisationProductFormSchema),
        initialValues: emptyForm(),
        validateOnMount: false,
    })
const [name] = defineField('name')
const [slug] = defineField('slug')
const [description] = defineField('description')
const [isActive] = defineField('isActive')
const toNumberArray = (value: unknown): number[] =>
    Array.isArray(value)
        ? value.map(Number).filter((item) => Number.isInteger(item) && item > 0)
        : []

const loadCategories = async (): Promise<void> => {
    loadingCategories.value = true
    try {
        const response = await categoryApi.getAllCategories()
        categoryOptions.value = (response.data ?? [])
            .filter(
                (category) =>
                    category.isActive ||
                    props.organisationProduct?.categoryIds.includes(category.id)
            )
            .map((category) => ({ title: category.name, value: category.id }))
    } catch {
        categoryOptions.value = []
    } finally {
        loadingCategories.value = false
    }
}
const {
    push: appendVariant,
    remove: removeVariantAt,
    update: updateVariantAt,
} = useFieldArray<OrganisationProductVariantFormData>('variants')

const thumbnailUrl = computed(() =>
    props.organisationProduct?.thumbnail
        ? getFullImageUrl(props.organisationProduct.thumbnail, 'organisation-products')
        : null
)
const selectedInventoryVariant = computed(() =>
    inventoryVariantIndex.value === null
        ? null
        : (values.variants[inventoryVariantIndex.value] ?? null)
)
const selectedInventoryIsDraft = computed(() => {
    if (inventoryVariantIndex.value === null || !selectedInventoryVariant.value) return false
    return isOpeningInventory(inventoryVariantIndex.value)
})

const originalVariant = (index: number) => {
    const variantId = values.variants[index]?.id
    return props.organisationProduct?.variants.find((variant) => variant.id === variantId)
}

const isOpeningInventory = (index: number): boolean => {
    const current = values.variants[index]
    return !current?.id || originalVariant(index)?.stockManaged === false
}

const canRemoveVariant = (index: number): boolean => {
    if (props.organisationProduct?.isPlatformProduct) return false
    if (values.variants.length === 1) return false
    const original = originalVariant(index)
    if (original && !access.can(ORGANISATION_PRODUCT_PERMISSIONS.DELETE, props.organisationId))
        return false
    return !original || (original.qty === 0 && original.reservedQty === 0)
}

const addVariant = (): void => {
    appendVariant(emptyVariant())
}

const removeVariant = (index: number): void => {
    if (!canRemoveVariant(index)) return
    removeVariantAt(index)
}

const openInventory = (index: number): void => {
    const current = values.variants[index]
    if (!current) return
    inventoryVariantIndex.value = index
    inventoryDialogOpen.value = true
}

const updateSelectedInventory = (inventory: InventoryDraftBalance[]): void => {
    if (inventoryVariantIndex.value === null) return
    const current = values.variants[inventoryVariantIndex.value]
    if (!current || !selectedInventoryIsDraft.value) return
    updateVariantAt(inventoryVariantIndex.value, {
        ...current,
        inventory,
    })
}

const handleInventorySaved = (): void => {
    inventoryDialogOpen.value = false
    inventoryVariantIndex.value = null
}

const removeExistingGallery = (filename: string): void => {
    visibleGallery.value = visibleGallery.value.filter((image) => image !== filename)
    removedGallery.value = [...new Set([...removedGallery.value, filename])]
}

const saveMedia = async (organisationProductId: number): Promise<void> => {
    await Promise.all(
        removedGallery.value.map((filename) =>
            organisationProductApi.deleteOrganisationProductGalleryImage(
                props.organisationId,
                organisationProductId,
                filename
            )
        )
    )
    if (!thumbnail.value && gallery.value.length === 0) return
    const data = new FormData()
    if (thumbnail.value) data.append('uploadThumbnail', thumbnail.value)
    gallery.value.forEach((file) => data.append('uploadGallery', file))
    await organisationProductApi.uploadOrganisationProductImages(
        props.organisationId,
        organisationProductId,
        data
    )
}

const submitForm = handleSubmit(async (data) => {
    if (!props.organisationProduct || props.organisationId < 1 || !props.organisationName.trim()) {
        errorFromError(new Error('No organisation selected.'), 'No organisation selected.')
        return
    }
    saving.value = true
    try {
        const response = await organisationProductApi.updateOrganisationProduct(
            props.organisationId,
            props.organisationProduct.id,
            data as UpdateOrganisationProductDTO
        )
        if (!response.data) {
            throw new Error(response.message || ORGANISATION_PRODUCT_MESSAGES.UPDATE_ERROR)
        }
        await saveMedia(response.data.id)
        successFromResponse(response, ORGANISATION_PRODUCT_MESSAGES.UPDATE_SUCCESS)
        emit('submit')
        close()
    } catch (error) {
        errorFromError(error, ORGANISATION_PRODUCT_MESSAGES.UPDATE_ERROR)
    } finally {
        saving.value = false
    }
})

const submit = (): void => {
    void submitForm()
}

const reset = (): void => {
    const product = props.organisationProduct
    resetForm({ values: product ? productToForm(product) : emptyForm(), errors: {}, touched: {} })
    thumbnail.value = null
    gallery.value = []
    visibleGallery.value = [...(product?.gallery ?? [])]
    removedGallery.value = []
    inventoryDialogOpen.value = false
    inventoryVariantIndex.value = null
}

const close = (): void => {
    inventoryDialogOpen.value = false
    inventoryVariantIndex.value = null
    emit('update:modelValue', false)
}

watch(
    () => [props.modelValue, props.organisationProduct?.id] as const,
    ([isOpen]) => {
        if (!isOpen) return
        reset()
        void loadCategories()
    },
    { immediate: true }
)
watch(inventoryDialogOpen, (isOpen) => {
    if (!isOpen) inventoryVariantIndex.value = null
})
</script>
