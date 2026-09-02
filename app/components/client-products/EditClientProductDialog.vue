<template>
    <v-dialog
        :model-value="modelValue"
        max-width="1200"
        scrollable
        persistent
        @update:model-value="emit('update:modelValue', $event)"
    >
        <v-card>
            <v-card-title class="d-flex align-center justify-space-between pa-4">
                <div>
                    <div class="text-h5">Edit client white-label product</div>
                    <div class="text-caption text-medium-emphasis">
                        Update the label and manage its client-facing variants independently.
                    </div>
                </div>
                <v-btn icon="mdi-close" variant="text" @click="close" />
            </v-card-title>

            <v-divider />

            <v-card-text class="pa-5">
                <v-alert v-if="!clientProduct" type="warning" variant="tonal">
                    Select a client product before editing.
                </v-alert>

                <v-form v-else @submit.prevent="submit">
                    <FormFieldErrors :errors="errors" />

                    <v-card variant="outlined" class="mb-5">
                        <v-card-title>Client product information</v-card-title>
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
                                        label="Client slug"
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
                        <v-card-title>Client product media</v-card-title>
                        <v-card-text>
                            <v-row>
                                <v-col cols="12" md="4">
                                    <ThumbnailUpload v-model="thumbnail" :file-url="thumbnailUrl" />
                                </v-col>
                                <v-col cols="12" md="8">
                                    <GalleryUpload
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
                            <div class="text-h6">Client variants</div>
                            <div class="text-caption text-medium-emphasis">
                                Existing source mappings are immutable. New variants must come from
                                the same platform product.
                            </div>
                        </div>
                        <v-btn prepend-icon="mdi-plus" variant="tonal" @click="addVariant">
                            Add variant
                        </v-btn>
                    </div>

                    <ClientProductVariantEditor
                        v-for="(variant, index) in values.variants"
                        :key="variant.id ?? `new-${index}`"
                        :model-value="variant"
                        :index="index"
                        :can-remove="canRemoveVariant(index)"
                        :source-variants="sourceOptionsFor(index)"
                        :inventory-count="variant.inventory.length"
                        :errors="errors"
                        @update:model-value="updateVariantAt(index, $event)"
                        @select-source="selectSource(index, $event)"
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
                    :disabled="!clientProduct"
                    :loading="saving || isSubmitting"
                    @click="submit"
                >
                    Update client product
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <ClientInventoryManagementDialog
        v-if="selectedInventoryVariant"
        v-model="inventoryDialogOpen"
        :client-id="clientId"
        :entity-id="selectedInventoryVariant.id ?? 0"
        :title="selectedInventoryVariant.sku || 'New client variant'"
        :draft="!selectedInventoryVariant.id"
        :draft-balances="selectedInventoryVariant.inventory"
        @update:draft-balances="updateSelectedInventory"
    />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useFieldArray, useForm } from 'vee-validate'
import ClientProductVariantEditor from '~/components/client-products/ClientProductVariantEditor.vue'
import FormFieldErrors from '~/components/globals/FormFieldErrors.vue'
import ClientInventoryManagementDialog from '~/components/inventory/ClientInventoryManagementDialog.vue'
import GalleryUpload from '~/components/products/GalleryUpload.vue'
import ThumbnailUpload from '~/components/products/ThumbnailUpload.vue'
import { useProduct } from '~/composables/useProduct'
import { useToast } from '~/composables/useToast'
import { INVENTORY_MESSAGES } from '~/constants/inventory.constants'
import { CLIENT_PRODUCT_MESSAGES } from '~/constants/messages.constants'
import {
    clientProductFormSchema,
    type ClientProductFormData,
    type ClientProductVariantFormData,
} from '~/schemas/client-product.schema'
import type { ClientProductApiService } from '~/services/api/wrappers/client-product.api'
import type { ClientProduct, UpdateClientProductDTO } from '~/types/client-product.types'
import type { InventoryDraftBalance } from '~/types/inventory.types'
import { getFullImageUrl } from '~/utils/image.util'

interface Props {
    modelValue: boolean
    clientId: number
    clientProduct: ClientProduct | null
}

interface SourceVariantOption {
    title: string
    value: number
    productId: number
    sku: string
    price: number
    cog: number
    stockManaged: boolean
    lowStockThreshold: number
}

const props = withDefaults(defineProps<Props>(), {
    clientProduct: null,
})
const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    submit: []
}>()

const nuxtApp = useNuxtApp()
const clientProductApi = nuxtApp.$clientProductApi as ClientProductApiService
const { products, fetchProducts } = useProduct()
const { successFromResponse, errorFromError, warning } = useToast()
const saving = ref(false)
const thumbnail = ref<File | null>(null)
const gallery = ref<File[]>([])
const visibleGallery = ref<string[]>([])
const removedGallery = ref<string[]>([])
const inventoryDialogOpen = ref(false)
const inventoryVariantIndex = ref<number | null>(null)

const emptyVariant = (): ClientProductVariantFormData => ({
    sourceProductVariantId: 0,
    sku: '',
    price: 0,
    cog: 0,
    stockManaged: true,
    lowStockThreshold: 0,
    inventory: [],
    isActive: true,
})

const emptyForm = (): ClientProductFormData => ({
    slug: '',
    name: '',
    description: null,
    variants: [emptyVariant()],
    isActive: true,
})

const productToForm = (product: ClientProduct): ClientProductFormData => ({
    slug: product.slug,
    name: product.name,
    description: product.description,
    variants: product.variants.map((variant) => ({
        id: variant.id,
        sourceProductVariantId: variant.sourceProductVariantId,
        sku: variant.sku,
        price: variant.price,
        cog: variant.cog,
        stockManaged: variant.stockManaged,
        lowStockThreshold: variant.lowStockThreshold,
        inventory: [],
        isActive: variant.isActive,
    })),
    isActive: product.isActive,
})

const { errors, handleSubmit, isSubmitting, resetForm, defineField, values } =
    useForm<ClientProductFormData>({
        validationSchema: toTypedSchema(clientProductFormSchema),
        initialValues: emptyForm(),
        validateOnMount: false,
    })
const [name] = defineField('name')
const [slug] = defineField('slug')
const [description] = defineField('description')
const [isActive] = defineField('isActive')
const {
    push: appendVariant,
    remove: removeVariantAt,
    update: updateVariantAt,
} = useFieldArray<ClientProductVariantFormData>('variants')

const thumbnailUrl = computed(() =>
    props.clientProduct?.thumbnail
        ? getFullImageUrl(props.clientProduct.thumbnail, 'client-products')
        : null
)
const sourceVariantOptions = computed<SourceVariantOption[]>(() =>
    products.value.flatMap((product) =>
        product.variants
            .filter(
                (variant) =>
                    product.id === props.clientProduct?.sourceProductId && !variant.isDeleted
            )
            .map((variant) => ({
                title: `${product.name} — ${variant.sku}`,
                value: variant.id,
                productId: product.id,
                sku: variant.sku,
                price: variant.price,
                cog: variant.cog,
                stockManaged: variant.stockManaged,
                lowStockThreshold: variant.lowStockThreshold,
            }))
    )
)
const selectedInventoryVariant = computed(() =>
    inventoryVariantIndex.value === null
        ? null
        : (values.variants[inventoryVariantIndex.value] ?? null)
)

const sourceOptionsFor = (index: number): SourceVariantOption[] => {
    const currentSourceId = values.variants[index]?.sourceProductVariantId
    const selectedSourceIds = new Set(
        values.variants
            .filter((_, variantIndex) => variantIndex !== index)
            .map((variant) => variant.sourceProductVariantId)
    )
    return sourceVariantOptions.value.filter(
        (option) => !selectedSourceIds.has(option.value) || option.value === currentSourceId
    )
}

const selectSource = (index: number, sourceVariantId: number): void => {
    const source = sourceVariantOptions.value.find((option) => option.value === sourceVariantId)
    const current = values.variants[index]
    if (!source || !current || current.id) return
    updateVariantAt(index, {
        ...current,
        sourceProductVariantId: source.value,
        sku: source.sku,
        price: source.price,
        cog: source.cog,
        stockManaged: source.stockManaged,
        lowStockThreshold: source.lowStockThreshold,
        ...(!source.stockManaged ? { inventory: [] } : {}),
    })
}

const originalVariant = (index: number) => {
    const variantId = values.variants[index]?.id
    return props.clientProduct?.variants.find((variant) => variant.id === variantId)
}

const canRemoveVariant = (index: number): boolean => {
    if (values.variants.length === 1) return false
    const original = originalVariant(index)
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
    const original = originalVariant(index)
    if (current.id && !original?.stockManaged) {
        warning(INVENTORY_MESSAGES.SAVE_TRACKING_FIRST)
        return
    }
    inventoryVariantIndex.value = index
    inventoryDialogOpen.value = true
}

const updateSelectedInventory = (inventory: InventoryDraftBalance[]): void => {
    if (inventoryVariantIndex.value === null) return
    const current = values.variants[inventoryVariantIndex.value]
    if (!current || current.id) return
    updateVariantAt(inventoryVariantIndex.value, {
        ...current,
        inventory,
        lowStockThreshold: inventory[0]?.lowStockThreshold ?? current.lowStockThreshold,
    })
}

const removeExistingGallery = (filename: string): void => {
    visibleGallery.value = visibleGallery.value.filter((image) => image !== filename)
    removedGallery.value = [...new Set([...removedGallery.value, filename])]
}

const saveMedia = async (clientProductId: number): Promise<void> => {
    await Promise.all(
        removedGallery.value.map((filename) =>
            clientProductApi.deleteClientProductGalleryImage(
                props.clientId,
                clientProductId,
                filename
            )
        )
    )
    if (!thumbnail.value && gallery.value.length === 0) return
    const data = new FormData()
    if (thumbnail.value) data.append('uploadThumbnail', thumbnail.value)
    gallery.value.forEach((file) => data.append('uploadGallery', file))
    await clientProductApi.uploadClientProductImages(props.clientId, clientProductId, data)
}

const submitForm = handleSubmit(async (data) => {
    if (!props.clientProduct) return
    saving.value = true
    try {
        const response = await clientProductApi.updateClientProduct(
            props.clientId,
            props.clientProduct.id,
            data as UpdateClientProductDTO
        )
        if (!response.data) {
            throw new Error(response.message || CLIENT_PRODUCT_MESSAGES.UPDATE_ERROR)
        }
        await saveMedia(response.data.id)
        successFromResponse(response, CLIENT_PRODUCT_MESSAGES.UPDATE_SUCCESS)
        emit('submit')
        close()
    } catch (error) {
        errorFromError(error, CLIENT_PRODUCT_MESSAGES.UPDATE_ERROR)
    } finally {
        saving.value = false
    }
})

const submit = (): void => {
    void submitForm()
}

const reset = (): void => {
    const product = props.clientProduct
    resetForm({ values: product ? productToForm(product) : emptyForm(), errors: {}, touched: {} })
    thumbnail.value = null
    gallery.value = []
    visibleGallery.value = [...(product?.gallery ?? [])]
    removedGallery.value = []
    inventoryDialogOpen.value = false
    inventoryVariantIndex.value = null
}

const close = (): void => {
    emit('update:modelValue', false)
}

watch(
    () => [props.modelValue, props.clientProduct?.id] as const,
    ([isOpen]) => {
        if (!isOpen) return
        reset()
        void fetchProducts()
    },
    { immediate: true }
)
</script>
