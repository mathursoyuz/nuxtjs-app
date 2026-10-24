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
                title="Product details"
                entity-label="Product"
                :entity-name="product?.name"
                @close="emit('update:modelValue', false)"
            >
                <template #actions>
                    <template v-if="access.can(PRODUCT_PERMISSIONS.WRITE)">
                        <v-btn
                            color="white"
                            variant="outlined"
                            prepend-icon="mdi-pencil"
                            :disabled="!product"
                            @click="edit"
                        >
                            Edit
                        </v-btn>
                    </template>
                    <template v-if="access.can(PRODUCT_PERMISSIONS.DELETE)">
                        <v-btn
                            color="white"
                            variant="outlined"
                            prepend-icon="mdi-delete"
                            :disabled="!product"
                            @click="remove"
                        >
                            Delete
                        </v-btn>
                    </template>
                </template>
            </DialogsDialogHeader>

            <v-divider />

            <v-card-text v-if="loading" class="pa-6">
                <v-skeleton-loader type="card, table" />
            </v-card-text>

            <v-card-text v-else-if="product" class="pa-0">
                <v-tabs v-model="tab" class="px-4 pt-3">
                    <v-tab value="overview">Overview</v-tab>
                    <v-tab value="variants">Variants ({{ product.variants.length }})</v-tab>
                    <v-tab value="media">Media</v-tab>
                </v-tabs>

                <v-window v-model="tab" class="pa-5">
                    <v-window-item value="overview">
                        <v-row>
                            <v-col cols="12" md="4">
                                <v-img
                                    :src="getFullImageUrl(product.thumbnail, 'products')"
                                    height="300"
                                    cover
                                    class="rounded border"
                                    :alt="product.name"
                                />
                            </v-col>
                            <v-col cols="12" md="8">
                                <v-table density="comfortable">
                                    <tbody>
                                        <tr>
                                            <th>Product ID</th>
                                            <td>{{ product.id }}</td>
                                        </tr>
                                        <tr>
                                            <th>Name</th>
                                            <td>{{ product.name }}</td>
                                        </tr>
                                        <tr>
                                            <th>Slug</th>
                                            <td>{{ product.slug }}</td>
                                        </tr>
                                        <tr>
                                            <th>Derived type</th>
                                            <td>
                                                <v-chip
                                                    :color="typeColor(product.type)"
                                                    size="small"
                                                >
                                                    {{ product.type }}
                                                </v-chip>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>Categories</th>
                                            <td>{{ categoryLabels }}</td>
                                        </tr>
                                        <tr>
                                            <th>Status</th>
                                            <td>
                                                <v-chip
                                                    :color="product.isActive ? 'success' : 'error'"
                                                    size="small"
                                                >
                                                    {{ product.isActive ? 'Active' : 'Inactive' }}
                                                </v-chip>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>Featured</th>
                                            <td>{{ product.isFeatured ? 'Yes' : 'No' }}</td>
                                        </tr>
                                        <tr>
                                            <th>Created</th>
                                            <td>{{ formatDate(product.createdAt) }}</td>
                                        </tr>
                                        <tr>
                                            <th>Updated</th>
                                            <td>{{ formatDate(product.updatedAt) }}</td>
                                        </tr>
                                    </tbody>
                                </v-table>
                            </v-col>
                            <v-col cols="12">
                                <div class="text-subtitle-2 mb-2">Description</div>
                                <div class="description-text">
                                    {{ product.description || 'No description provided.' }}
                                </div>
                            </v-col>
                        </v-row>
                    </v-window-item>

                    <v-window-item value="variants">
                        <v-expansion-panels multiple>
                            <v-expansion-panel
                                v-for="variant in product.variants"
                                :key="variant.id"
                            >
                                <v-expansion-panel-title>
                                    <div class="d-flex align-center ga-2 flex-wrap">
                                        <strong>{{ variant.sku }}</strong>
                                        <v-chip
                                            v-if="variant.isDefault"
                                            color="primary"
                                            size="x-small"
                                        >
                                            Default
                                        </v-chip>
                                        <v-chip
                                            v-if="variant.bundleComponents.length"
                                            color="success"
                                            size="x-small"
                                        >
                                            Bundle
                                        </v-chip>
                                    </div>
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <v-row>
                                        <v-col cols="12" md="3">
                                            <v-img
                                                :src="
                                                    getFullImageUrl(variant.thumbnail, 'products')
                                                "
                                                height="180"
                                                cover
                                                class="rounded border"
                                                :alt="variant.sku"
                                            />
                                        </v-col>
                                        <v-col cols="12" md="9">
                                            <v-table density="compact">
                                                <tbody>
                                                    <tr>
                                                        <th>Variant ID</th>
                                                        <td>{{ variant.id }}</td>
                                                        <th>Sort order</th>
                                                        <td>{{ variant.sortOrder }}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>Price</th>
                                                        <td>{{ money(variant.price) }}</td>
                                                        <th>COG</th>
                                                        <td>{{ money(variant.cog) }}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>Size</th>
                                                        <td>{{ variant.size || '—' }}</td>
                                                        <th>Color</th>
                                                        <td>{{ variant.color || '—' }}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>Stock managed</th>
                                                        <td>
                                                            {{
                                                                variant.stockManaged ? 'Yes' : 'No'
                                                            }}
                                                        </td>
                                                        <th>Inventory threshold</th>
                                                        <td>Managed per location</td>
                                                    </tr>
                                                    <tr>
                                                        <th>Active</th>
                                                        <td>
                                                            {{ variant.isActive ? 'Yes' : 'No' }}
                                                        </td>
                                                        <th>Updated</th>
                                                        <td>{{ formatDate(variant.updatedAt) }}</td>
                                                    </tr>
                                                </tbody>
                                            </v-table>
                                        </v-col>

                                        <v-col cols="12" md="6">
                                            <div class="text-subtitle-2 mb-2">Attributes</div>
                                            <div
                                                v-if="Object.keys(variant.attributes).length"
                                                class="d-flex ga-2 flex-wrap"
                                            >
                                                <v-chip
                                                    v-for="(value, key) in variant.attributes"
                                                    :key="key"
                                                    size="small"
                                                >
                                                    {{ key }}: {{ value }}
                                                </v-chip>
                                            </div>
                                            <span v-else class="text-medium-emphasis">
                                                No attributes
                                            </span>
                                        </v-col>

                                        <v-col cols="12" md="6">
                                            <div class="text-subtitle-2 mb-2">
                                                Bundle components
                                            </div>
                                            <v-list
                                                v-if="variant.bundleComponents.length"
                                                density="compact"
                                            >
                                                <v-list-item
                                                    v-for="component in variant.bundleComponents"
                                                    :key="
                                                        component.id ?? component.componentVariantId
                                                    "
                                                    :title="
                                                        componentVariantLabel(
                                                            component.componentVariantId
                                                        )
                                                    "
                                                    :subtitle="`Quantity: ${component.quantity} · Sort: ${component.sortOrder}`"
                                                />
                                            </v-list>
                                            <span v-else class="text-medium-emphasis">
                                                This variant is not a bundle.
                                            </span>
                                        </v-col>

                                        <v-col cols="12" md="6">
                                            <div class="text-subtitle-2 mb-2">Integrations</div>
                                            <v-list
                                                v-if="variant.integrations.length"
                                                density="compact"
                                            >
                                                <v-list-item
                                                    v-for="integration in variant.integrations"
                                                    :key="integration.provider"
                                                    :title="integration.provider"
                                                    :subtitle="
                                                        integration.externalId || 'No external ID'
                                                    "
                                                >
                                                    <template #append>
                                                        <v-chip
                                                            :color="
                                                                integration.isSynced
                                                                    ? 'success'
                                                                    : 'warning'
                                                            "
                                                            size="x-small"
                                                        >
                                                            {{
                                                                integration.isSynced
                                                                    ? 'Synced'
                                                                    : 'Not synced'
                                                            }}
                                                        </v-chip>
                                                    </template>
                                                </v-list-item>
                                            </v-list>
                                            <span v-else class="text-medium-emphasis">
                                                No integrations
                                            </span>
                                        </v-col>

                                        <v-col cols="12" md="6">
                                            <div class="text-subtitle-2 mb-2">Variant gallery</div>
                                            <div
                                                v-if="variant.gallery.length"
                                                class="d-flex ga-2 flex-wrap"
                                            >
                                                <v-img
                                                    v-for="image in variant.gallery"
                                                    :key="image"
                                                    :src="getFullImageUrl(image, 'products')"
                                                    width="90"
                                                    height="90"
                                                    cover
                                                    class="rounded border"
                                                />
                                            </div>
                                            <span v-else class="text-medium-emphasis">
                                                No images
                                            </span>
                                        </v-col>
                                    </v-row>
                                </v-expansion-panel-text>
                            </v-expansion-panel>
                        </v-expansion-panels>
                    </v-window-item>

                    <v-window-item value="media">
                        <div class="text-subtitle-1 mb-3">Product gallery</div>
                        <v-row v-if="product.gallery.length">
                            <v-col
                                v-for="image in product.gallery"
                                :key="image"
                                cols="12"
                                sm="6"
                                md="4"
                            >
                                <v-img
                                    :src="getFullImageUrl(image, 'products')"
                                    height="220"
                                    cover
                                    class="rounded border"
                                />
                            </v-col>
                        </v-row>
                        <v-alert v-else type="info" variant="tonal">
                            No product gallery images.
                        </v-alert>
                    </v-window-item>
                </v-window>
            </v-card-text>

            <v-card-text v-else class="pa-6">
                <v-alert type="error" variant="tonal">Product not found.</v-alert>
            </v-card-text>

            <v-divider />
            <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn variant="outlined" @click="emit('update:modelValue', false)">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { PRODUCT_PERMISSIONS } from '~/components/products/products.permissions'

import { computed, ref, watch } from 'vue'
import { useAccessStore } from '~/stores/access.store'
const access = useAccessStore()
import { useCategory } from '~/composables/useCategory'
import { useLocation } from '~/composables/useLocation'
import { useProduct } from '~/composables/useProduct'
import { getFullImageUrl } from '~/utils/image.util'

interface Props {
    modelValue: boolean
    productId: number | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    edit: [productId: number]
    deleted: []
}>()

const { products, currentProduct, loading, fetchProductById, deleteProduct } = useProduct()
const { categories } = useCategory()
const tab = ref('overview')
const product = computed(() =>
    currentProduct.value?.id === props.productId ? currentProduct.value : null
)

const categoryLabels = computed(() => {
    if (!product.value) return '—'
    const labels = product.value.categories.map(
        (categoryId) =>
            categories.value.find((category) => category.id === categoryId)?.name ??
            `Category #${categoryId}`
    )
    return labels.join(', ') || '—'
})

function typeColor(type: string): string {
    if (type === 'bundle') return 'success'
    if (type === 'variable') return 'secondary'
    return 'primary'
}

function money(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value)
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value))
}

function componentVariantLabel(variantId: number): string {
    for (const candidateProduct of products.value) {
        const variant = candidateProduct.variants.find((candidate) => candidate.id === variantId)
        if (variant) return `${candidateProduct.name} — ${variant.sku}`
    }
    return `Variant #${variantId}`
}

function edit(): void {
    if (props.productId) emit('edit', props.productId)
}

async function remove(): Promise<void> {
    if (!props.productId || !product.value) return
    if (!window.confirm(`Are you sure you want to delete ${product.value.name}?`)) return
    await deleteProduct(props.productId)
    emit('deleted')
    emit('update:modelValue', false)
}

watch(
    () => [props.modelValue, props.productId] as const,
    ([isOpen, productId]) => {
        if (!isOpen || !productId) return
        tab.value = 'overview'
        void fetchProductById(productId)
    },
    { immediate: true }
)
</script>

<style scoped>
.description-text {
    white-space: pre-wrap;
}
</style>
