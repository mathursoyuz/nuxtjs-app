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
                    <div class="text-h5">Add organisation white-label product</div>
                    <div class="text-caption text-medium-emphasis">
                        Organisation: {{ organisationName || 'No organisation selected' }}
                    </div>
                </div>
                <v-btn icon="mdi-close" variant="text" @click="close" />
            </v-card-title>

            <v-divider />

            <v-card-text class="pa-5">
                <v-form @submit.prevent="submit">
                    <FormFieldErrors :errors="errors" />
                    <v-alert v-if="!hasTarget" type="error" variant="tonal" class="mb-4">
                        No organisation selected.
                    </v-alert>

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
                            <div class="text-h6">Organisation variants</div>
                            <div class="text-caption text-medium-emphasis">
                                Each organisation-owned variant has independent SKU, pricing,
                                attributes, and location inventory.
                            </div>
                        </div>
                        <v-btn prepend-icon="mdi-plus" variant="tonal" @click="addVariant">
                            Add variant
                        </v-btn>
                    </div>

                    <OrganisationProductVariantEditor
                        v-for="(variant, index) in values.variants"
                        :key="`new-${index}`"
                        :model-value="variant"
                        :index="index"
                        :can-remove="values.variants.length > 1"
                        :is-platform-product="false"
                        :component-variants="componentVariantOptions"
                        :inventory-count="variant.inventory.length"
                        inventory-is-draft
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
                    :disabled="!hasTarget"
                    :loading="saving || isSubmitting"
                    @click="submit"
                >
                    Create organisation product
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <OrganisationInventoryManagementDialog
        v-if="selectedInventoryVariant"
        v-model="inventoryDialogOpen"
        :organisation-id="organisationId"
        :title="selectedInventoryVariant.sku || 'New organisation variant'"
        draft
        :draft-balances="selectedInventoryVariant.inventory"
        :default-low-stock-threshold="0"
        @update:draft-balances="updateSelectedInventory"
    />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useFieldArray, useForm } from 'vee-validate'
import OrganisationProductVariantEditor from '~/components/organisation-products/OrganisationProductVariantEditor.vue'
import { ORGANISATION_PRODUCT_PERMISSIONS } from '~/components/organisation-products/organisation-products.permissions'
import FormFieldErrors from '~/components/globals/FormFieldErrors.vue'
import OrganisationInventoryManagementDialog from '~/components/inventory/OrganisationInventoryManagementDialog.vue'
import GalleryUpload from '~/components/products/GalleryUpload.vue'
import ThumbnailUpload from '~/components/products/ThumbnailUpload.vue'
import { useToast } from '~/composables/useToast'
import { useAccessStore } from '~/stores/access.store'
import { INVENTORY_PERMISSIONS } from '~/components/inventory/inventory.permissions'
import { ORGANISATION_PRODUCT_MESSAGES } from '~/constants/messages.constants'
import {
    organisationProductFormSchema,
    type OrganisationProductFormData,
    type OrganisationProductVariantFormData,
} from '~/schemas/organisation-product.schema'
import type { OrganisationProductApiService } from '~/services/api/wrappers/organisation-product.api'
import type { OrganisationProduct, CreateOrganisationProductDTO } from '~/types/organisation-product.types'
import type { InventoryDraftBalance } from '~/types/inventory.types'

interface Props {
    modelValue: boolean
    organisationId: number
    organisationName: string
    availableProducts?: OrganisationProduct[]
}

const props = withDefaults(defineProps<Props>(), {
    availableProducts: () => [],
})
const hasTarget = computed(() => props.organisationId > 0 && props.organisationName.trim().length > 0)
const access = useAccessStore()
const canManageInventory = computed(() => access.can(INVENTORY_PERMISSIONS.WRITE, props.organisationId))
const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    submit: []
}>()

const nuxtApp = useNuxtApp()
const organisationProductApi = nuxtApp.$organisationProductApi as OrganisationProductApiService
const { successFromResponse, errorFromError } = useToast()
const saving = ref(false)
const thumbnail = ref<File | null>(null)
const gallery = ref<File[]>([])
const inventoryDialogOpen = ref(false)
const inventoryVariantIndex = ref<number | null>(null)
const loadedProducts = ref<OrganisationProduct[]>([])
let productRequest = 0
const componentVariantOptions = computed(() =>
    (props.availableProducts.length > 0 ? props.availableProducts : loadedProducts.value).flatMap(
        (product) =>
            product.variants
                .filter((variant) => variant.isActive && !variant.isDeleted)
                .map((variant) => ({
                    title: `${product.name} — ${variant.sku}`,
                    value: variant.id,
                }))
    )
)

const loadComponentProducts = async (): Promise<void> => {
    const current = ++productRequest
    loadedProducts.value = []
    if (
        props.availableProducts.length > 0 ||
        !hasTarget.value ||
        !access.can(ORGANISATION_PRODUCT_PERMISSIONS.READ, props.organisationId)
    )
        return
    try {
        const response = await organisationProductApi.getAllOrganisationProducts(props.organisationId)
        if (current === productRequest) loadedProducts.value = response.data ?? []
    } catch {
        if (current === productRequest) loadedProducts.value = []
    }
}

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
    variants: [emptyVariant()],
    isActive: true,
})

const { errors, handleSubmit, isSubmitting, resetForm, defineField, values } =
    useForm<OrganisationProductFormData>({
        validationSchema: toTypedSchema(organisationProductFormSchema),
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
} = useFieldArray<OrganisationProductVariantFormData>('variants')

const selectedInventoryVariant = computed(() =>
    inventoryVariantIndex.value === null
        ? null
        : (values.variants[inventoryVariantIndex.value] ?? null)
)

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
    })
}

const uploadImages = async (organisationProductId: number): Promise<void> => {
    if (!thumbnail.value && gallery.value.length === 0) return
    const data = new FormData()
    if (thumbnail.value) data.append('uploadThumbnail', thumbnail.value)
    gallery.value.forEach((file) => data.append('uploadGallery', file))
    await organisationProductApi.uploadOrganisationProductImages(props.organisationId, organisationProductId, data)
}

const submitForm = handleSubmit(async (data) => {
    if (!hasTarget.value) {
        errorFromError(new Error('No organisation selected.'), 'No organisation selected.')
        return
    }
    saving.value = true
    try {
        const response = await organisationProductApi.createOrganisationProduct(
            props.organisationId,
            data as CreateOrganisationProductDTO
        )
        if (!response.data) {
            throw new Error(response.message || ORGANISATION_PRODUCT_MESSAGES.CREATE_ERROR)
        }
        await uploadImages(response.data.id)
        successFromResponse(response, ORGANISATION_PRODUCT_MESSAGES.CREATE_SUCCESS)
        emit('submit')
        close()
    } catch (error) {
        errorFromError(error, ORGANISATION_PRODUCT_MESSAGES.CREATE_ERROR)
    } finally {
        saving.value = false
    }
})

const submit = (): void => {
    void submitForm()
}

const reset = (): void => {
    productRequest++
    resetForm({ values: emptyForm(), errors: {}, touched: {} })
    thumbnail.value = null
    gallery.value = []
    inventoryDialogOpen.value = false
    inventoryVariantIndex.value = null
    loadedProducts.value = []
}

const close = (): void => {
    productRequest++
    loadedProducts.value = []
    inventoryDialogOpen.value = false
    inventoryVariantIndex.value = null
    emit('update:modelValue', false)
}

watch(
    () => props.modelValue,
    (isOpen) => {
        if (!isOpen) return
        reset()
        void loadComponentProducts()
    },
    { immediate: true }
)
watch(inventoryDialogOpen, (isOpen) => {
    if (!isOpen) inventoryVariantIndex.value = null
})
</script>
