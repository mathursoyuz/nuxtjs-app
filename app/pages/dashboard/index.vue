<template>
    <v-container fluid>
        <h1 class="text-h4 mb-4">Dashboard</h1>
        <p class="text-body-1 mb-6">Welcome, {{ user?.firstName }}!</p>

        <v-row>
            <v-col v-if="canReadProducts" cols="12" md="3">
                <v-card>
                    <v-card-text>
                        <div class="d-flex align-center">
                            <v-icon size="48" color="primary" class="mr-4">
                                mdi-package-variant
                            </v-icon>
                            <div>
                                <div class="text-h6">{{ productCount }}</div>
                                <div class="text-caption">Products</div>
                            </div>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col v-if="canReadCategories" cols="12" md="3">
                <v-card>
                    <v-card-text>
                        <div class="d-flex align-center">
                            <v-icon size="48" color="secondary" class="mr-4">mdi-folder</v-icon>
                            <div>
                                <div class="text-h6">{{ categoryCount }}</div>
                                <div class="text-caption">Categories</div>
                            </div>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col v-if="canReadCustomers" cols="12" md="3">
                <v-card>
                    <v-card-text>
                        <div class="d-flex align-center">
                            <v-icon size="48" color="success" class="mr-4">
                                mdi-account-group
                            </v-icon>
                            <div>
                                <div class="text-h6">{{ customerCount }}</div>
                                <div class="text-caption">Customers</div>
                            </div>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col v-if="canReadOrganisations" cols="12" md="3">
                <v-card>
                    <v-card-text>
                        <div class="d-flex align-center">
                            <v-icon size="48" color="warning" class="mr-4">
                                mdi-office-building
                            </v-icon>
                            <div>
                                <div class="text-h6">{{ organisationCount }}</div>
                                <div class="text-caption">Organisations</div>
                            </div>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row class="mt-4">
            <v-col cols="12" md="6">
                <v-card>
                    <v-card-title>Quick Actions</v-card-title>
                    <v-card-text>
                        <v-list>
                            <v-list-item
                                v-if="access.can(PRODUCT_PERMISSIONS.CREATE)"
                                prepend-icon="mdi-plus"
                                title="Create Product"
                                to="/products"
                            />
                            <v-list-item
                                v-if="access.can(CATEGORY_PERMISSIONS.CREATE)"
                                prepend-icon="mdi-plus"
                                title="Create Category"
                                to="/categories"
                            />
                            <v-list-item
                                v-if="access.can(ORGANISATION_PERMISSIONS.CREATE)"
                                prepend-icon="mdi-plus"
                                title="Create Organisation"
                                to="/organisations"
                            />
                        </v-list>
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col cols="12" md="6">
                <v-card>
                    <v-card-title>Recent Activity</v-card-title>
                    <v-card-text>
                        <v-list v-if="recentActivity.length" lines="two" density="comfortable">
                            <v-list-item
                                v-for="activity in recentActivity"
                                :key="activity.key"
                                :prepend-icon="activity.icon"
                                :title="activity.title"
                                :subtitle="activity.subtitle"
                                :to="activity.to"
                            >
                                <template #append>
                                    <span class="text-caption text-medium-emphasis">
                                        {{ formatActivityTime(activity.createdAt) }}
                                    </span>
                                </template>
                            </v-list-item>
                        </v-list>
                        <v-alert v-else type="info" variant="tonal">
                            No recent records are available for your permissions.
                        </v-alert>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useProduct } from '~/composables/useProduct'
import { useCategory } from '~/composables/useCategory'
import { useOrganisation } from '~/composables/useOrganisation'
import { useCustomer } from '~/composables/useCustomer'
import { useAccessStore } from '~/stores/access.store'
import { PRODUCT_PERMISSIONS } from '~/components/products/products.permissions'
import { CATEGORY_PERMISSIONS } from '~/components/categories/category.permissions'
import { ORGANISATION_PERMISSIONS } from '~/components/organisations/organisation.permissions'
import { CUSTOMER_PERMISSIONS } from '~/components/customers/customer.permissions'

interface DashboardActivity {
    key: string
    title: string
    subtitle: string
    icon: string
    to: string
    createdAt: string
}

definePageMeta({
    middleware: ['auth'],
})

const { user } = useAuth()
const access = useAccessStore()
const { products, fetchProducts } = useProduct()
const { categories, fetchCategories } = useCategory()
const { organisations, fetchOrganisations } = useOrganisation()
const { customers, pagination, fetchCustomers } = useCustomer()

const productCount = computed(() => products.value.length)
const categoryCount = computed(() => categories.value.length)
const customerCount = computed(() => pagination.value?.total ?? 0)
const organisationCount = computed(() => organisations.value.length)
const canReadProducts = computed(() => access.can(PRODUCT_PERMISSIONS.READ))
const canReadCategories = computed(() => access.can(CATEGORY_PERMISSIONS.READ))
const canReadOrganisations = computed(() => access.can(ORGANISATION_PERMISSIONS.READ))
const canReadCustomers = computed(
    () =>
        access.can(CUSTOMER_PERMISSIONS.READ) ||
        access.canAcrossOrganisations(CUSTOMER_PERMISSIONS.READ)
)

const recentActivity = computed<DashboardActivity[]>(() => {
    const activity: DashboardActivity[] = []
    if (canReadProducts.value) {
        activity.push(
            ...products.value.map((item) => ({
                key: `product-${item.id}`,
                title: item.name,
                subtitle: 'Product created',
                icon: 'mdi-package-variant',
                to: '/products',
                createdAt: item.createdAt,
            }))
        )
    }
    if (canReadCategories.value) {
        activity.push(
            ...categories.value.map((item) => ({
                key: `category-${item.id}`,
                title: item.name,
                subtitle: 'Category created',
                icon: 'mdi-folder',
                to: '/categories',
                createdAt: item.createdAt,
            }))
        )
    }
    if (canReadOrganisations.value) {
        activity.push(
            ...organisations.value.map((item) => ({
                key: `organisation-${item.id}`,
                title: item.name,
                subtitle: 'Organisation created',
                icon: 'mdi-office-building',
                to: '/organisations',
                createdAt: item.createdAt,
            }))
        )
    }
    if (canReadCustomers.value) {
        activity.push(
            ...customers.value.map((item) => ({
                key: `customer-${item.id}`,
                title: `${item.firstName} ${item.lastName}`,
                subtitle: 'Customer created',
                icon: 'mdi-account',
                to: '/customers',
                createdAt: item.createdAt,
            }))
        )
    }
    return activity
        .filter((item) => !Number.isNaN(new Date(item.createdAt).getTime()))
        .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
        .slice(0, 8)
})

const formatActivityTime = (createdAt: string): string =>
    new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(createdAt))

onMounted(async () => {
    await Promise.all([
        canReadProducts.value ? fetchProducts() : Promise.resolve(),
        canReadCategories.value ? fetchCategories() : Promise.resolve(),
        canReadOrganisations.value ? fetchOrganisations() : Promise.resolve(),
        canReadCustomers.value ? fetchCustomers(null, 1, 8) : Promise.resolve(),
    ])
})
</script>
