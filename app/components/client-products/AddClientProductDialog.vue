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
                    <div class="text-h5">Add client white-label product</div>
                    <div class="text-caption text-medium-emphasis">
                        Create a client product with one or more sellable variants from the same
                        platform product.
                    </div>
                </div>
                <v-btn icon="mdi-close" variant="text" @click="close" />
            </v-card-title>

            <v-divider />

            <v-card-text class="pa-5">
                <v-form @submit.prevent="submit">
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
                                    <ThumbnailUpload v-model="thumbnail" />
                                </v-col>
                                <v-col cols="12" md="8">
                                    <GalleryUpload v-model="gallery" :existing-gallery="[]" />
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>

                    <div class="d-flex align-center justify-space-between mb-3">
                        <div>
                            <div class="text-h6">Client variants</div>
                            <div class="text-caption text-medium-emphasis">
                                Each variant maps to one platform SKU. A client can label each
                                source SKU only once.
                            </div>
                        </div>
                        <v-btn prepend-icon="mdi-plus" variant="tonal" @click="addVariant">
                            Add variant
                        </v-btn>
                    </div>

                    <ClientProductVariantEditor
                        v-for="(variant, index) in values.variants"
                        :key="`new-${index}`"
                        :model-value="variant"
                        :index="index"
                        :can-remove="values.variants.length > 1"
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
                <v-btn color="primary" :loading="saving || isSubmitting" @click="submit">
                    Create client product
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <ClientInventoryManagementDialog
        v-if="selectedInventoryVariant"
        v-model="inventoryDialogOpen"
        :client-id="clientId"
        :title="selectedInventoryVariant.sku || 'New client variant'"
        draft
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
import { CLIENT_PRODUCT_MESSAGES } from '~/constants/messages.constants'
import {
    clientProductFormSchema,
    type ClientProductFormData,
    type ClientProductVariantFormData,
} from '~/schemas/client-product.schema'
import type { ClientProductApiService } from '~/services/api/wrappers/client-product.api'
import type { CreateClientProductDTO } from '~/types/client-product.types'
import type { InventoryDraftBalance } from '~/types/inventory.types'

interface Props {
    modelValue: boolean
    clientId: number
}

interface SourceVariantOption {
    title: string
    value: number
    productId: number
    productName: string
    productSlug: string
    productDescription: string | null
    sku: string
    price: number
    cog: number
    stockManaged: boolean
    lowStockThreshold: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    submit: []
}>()

const nuxtApp = useNuxtApp()
const clientProductApi = nuxtApp.$clientProductApi as ClientProductApiService
const { products, fetchProducts } = useProduct()
const { successFromResponse, errorFromError } = useToast()
const saving = ref(false)
const thumbnail = ref<File | null>(null)
const gallery = ref<File[]>([])
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

const sourceVariantOptions = computed<SourceVariantOption[]>(() =>
    products.value.flatMap((product) =>
        product.variants
            .filter((variant) => variant.isActive && !variant.isDeleted)
            .map((variant) => ({
                title: `${product.name} — ${variant.sku}`,
                value: variant.id,
                productId: product.id,
                productName: product.name,
                productSlug: product.slug,
                productDescription: product.description,
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
    const relatedSourceId = values.variants.find(
        (variant, variantIndex) => variantIndex !== index && variant.sourceProductVariantId > 0
    )?.sourceProductVariantId
    const requiredProductId = sourceVariantOptions.value.find(
        (option) => option.value === relatedSourceId
    )?.productId
    const selectedSourceIds = new Set(
        values.variants
            .filter((_, variantIndex) => variantIndex !== index)
            .map((variant) => variant.sourceProductVariantId)
    )
    return sourceVariantOptions.value.filter(
        (option) =>
            (!requiredProductId || option.productId === requiredProductId) &&
            (!selectedSourceIds.has(option.value) || option.value === currentSourceId)
    )
}

const selectSource = (index: number, sourceVariantId: number): void => {
    const source = sourceVariantOptions.value.find((option) => option.value === sourceVariantId)
    const current = values.variants[index]
    if (!source || !current) return

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
    if (!values.name.trim()) name.value = source.productName
    if (!values.slug.trim()) slug.value = source.productSlug
    if (!values.description) description.value = source.productDescription
}

const addVariant = (): void => {
    appendVariant(emptyVariant())
}

const removeVariant = (index: number): void => {
    if (values.variants.length === 1) return
    removeVariantAt(index)
}

const openInventory = (index: number): void => {
    inventoryVariantIndex.value = index
    inventoryDialogOpen.value = true
}

const updateSelectedInventory = (inventory: InventoryDraftBalance[]): void => {
    if (inventoryVariantIndex.value === null) return
    const current = values.variants[inventoryVariantIndex.value]
    if (!current) return
    updateVariantAt(inventoryVariantIndex.value, {
        ...current,
        inventory,
        lowStockThreshold: inventory[0]?.lowStockThreshold ?? current.lowStockThreshold,
    })
}

const uploadImages = async (clientProductId: number): Promise<void> => {
    if (!thumbnail.value && gallery.value.length === 0) return
    const data = new FormData()
    if (thumbnail.value) data.append('uploadThumbnail', thumbnail.value)
    gallery.value.forEach((file) => data.append('uploadGallery', file))
    await clientProductApi.uploadClientProductImages(props.clientId, clientProductId, data)
}

const submitForm = handleSubmit(async (data) => {
    saving.value = true
    try {
        const response = await clientProductApi.createClientProduct(
            props.clientId,
            data as CreateClientProductDTO
        )
        if (!response.data) {
            throw new Error(response.message || CLIENT_PRODUCT_MESSAGES.CREATE_ERROR)
        }
        await uploadImages(response.data.id)
        successFromResponse(response, CLIENT_PRODUCT_MESSAGES.CREATE_SUCCESS)
        emit('submit')
        close()
    } catch (error) {
        errorFromError(error, CLIENT_PRODUCT_MESSAGES.CREATE_ERROR)
    } finally {
        saving.value = false
    }
})

const submit = (): void => {
    void submitForm()
}

const reset = (): void => {
    resetForm({ values: emptyForm(), errors: {}, touched: {} })
    thumbnail.value = null
    gallery.value = []
    inventoryDialogOpen.value = false
    inventoryVariantIndex.value = null
}

const close = (): void => {
    emit('update:modelValue', false)
}

watch(
    () => props.modelValue,
    (isOpen) => {
        if (!isOpen) return
        reset()
        void fetchProducts()
    },
    { immediate: true }
)
</script>
