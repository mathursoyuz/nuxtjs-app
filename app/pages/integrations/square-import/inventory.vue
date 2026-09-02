<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <div class="d-flex align-center justify-space-between mb-4">
                    <h1 class="text-h4">Square Import - Inventory</h1>
                    <div class="d-flex align-center ga-3">
                        <v-select
                            v-model="selectedClientId"
                            :items="clientOptions"
                            label="Client"
                            density="compact"
                            variant="outlined"
                            hide-details
                            style="min-width: 240px"
                            @update:model-value="fetchData"
                        />
                        <v-btn
                            color="primary"
                            prepend-icon="mdi-refresh"
                            :loading="loading"
                            @click="fetchData"
                        >
                            Refresh
                        </v-btn>
                    </div>
                </div>

                <v-card>
                    <v-card-text>
                        <v-data-table
                            :headers="headers"
                            :items="groupedInventory"
                            :loading="loading"
                            class="elevation-1"
                            :items-per-page="25"
                        >
                            <template #item.product="{ item }">
                                <div>
                                    <div class="font-weight-medium">{{ item.productName }}</div>
                                    <div class="text-caption text-grey">{{ item.productSku }}</div>
                                </div>
                            </template>

                            <template #item.locations="{ item }">
                                <div class="d-flex flex-column gap-1">
                                    <div
                                        v-for="location in item.locations"
                                        :key="location.locationId || 'null'"
                                        class="text-caption"
                                    >
                                        <span class="font-weight-medium">{{ location.locationName || 'No Location' }}:</span>
                                        <span class="ml-1">
                                            In Stock: {{ location.qtyInStock }},
                                            On Hand: {{ location.qtyOnHand }},
                                            Sold: {{ location.qtySold }}
                                        </span>
                                    </div>
                                </div>
                            </template>

                            <template #item.qtyInStock="{ item }">
                                {{ item.totalQtyInStock }}
                            </template>

                            <template #item.qtyOnHand="{ item }">
                                {{ item.totalQtyOnHand }}
                            </template>

                            <template #item.qtySold="{ item }">
                                {{ item.totalQtySold }}
                            </template>

                            <template #item.actions="{ item }">
                                <v-btn
                                    icon="mdi-eye"
                                    size="small"
                                    variant="text"
                                    @click="viewDetails(item)"
                                />
                            </template>
                        </v-data-table>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Details Dialog -->
        <v-dialog v-model="detailsDialog" max-width="1200">
            <v-card>
                <v-card-title>
                    <span class="text-h5">Inventory Details - {{ selectedItem?.productName }}</span>
                </v-card-title>
                <v-card-text>
                    <v-table v-if="selectedItem">
                        <thead>
                            <tr>
                                <th>Location</th>
                                <th>In Stock</th>
                                <th>On Hand</th>
                                <th>Sold</th>
                                <th>Sold Online</th>
                                <th>Reserved</th>
                                <th>Returned</th>
                                <th>Waiting</th>
                                <th>Ordered</th>
                                <th>Damaged</th>
                                <th>Waste</th>
                                <th>In Transit</th>
                                <th>Custom</th>
                                <th>Last Synced</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="location in selectedItem.locations" :key="location.locationId || 'null'">
                                <td>{{ location.locationName || 'No Location' }}</td>
                                <td>{{ location.qtyInStock }}</td>
                                <td>{{ location.qtyOnHand }}</td>
                                <td>{{ location.qtySold }}</td>
                                <td>{{ location.qtySoldOnline }}</td>
                                <td>{{ location.qtyReservedForSale }}</td>
                                <td>{{ location.qtyReturnedByCustomer }}</td>
                                <td>{{ location.qtyWaitingForSupplier }}</td>
                                <td>{{ location.qtyOrderedFromVendor }}</td>
                                <td>{{ location.qtyDamaged }}</td>
                                <td>{{ location.qtyWaste }}</td>
                                <td>{{ location.qtyInTransit }}</td>
                                <td>{{ location.qtyCustom }}</td>
                                <td>{{ location.lastSyncedAt ? new Date(location.lastSyncedAt).toLocaleString() : '-' }}</td>
                            </tr>
                        </tbody>
                    </v-table>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn color="primary" @click="detailsDialog = false">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useNuxtApp } from '#app';

definePageMeta({
    middleware: ['auth', 'role'],
    roles: ['admin', 'sales_manager'],
});

interface InventoryRecord {
    id: number;
    productId: number;
    squareVariationId: string;
    locationId: number;
    qtyCustom: number;
    qtyInStock: number;
    qtySold: number;
    qtySoldOnline: number;
    qtyReservedForSale: number;
    qtyReturnedByCustomer: number;
    qtyWaitingForSupplier: number;
    qtyOrderedFromVendor: number;
    qtyNone: number;
    qtyDamaged: number;
    qtyWaste: number;
    qtyUnlinkedReturn: number;
    qtyComposed: number;
    qtyDecomposed: number;
    qtySupportedByNewerVersion: number;
    qtyInTransit: number;
    qtyOnHand: number;
    lastSyncedAt: string | null;
    updatedAt: string;
    createdAt: string;
    product: {
        id: number;
        name: string;
        sku: string;
        squareVariationId: string | null;
    } | null;
    location: {
        id: number;
        name: string;
        squareLocationId: string | null;
    } | null;
}

interface GroupedInventoryItem {
    productId: number;
    productName: string;
    productSku: string;
    squareVariationId: string | null;
    locations: Array<{
        locationId: number;
        locationName: string;
        qtyCustom: number;
        qtyInStock: number;
        qtySold: number;
        qtySoldOnline: number;
        qtyReservedForSale: number;
        qtyReturnedByCustomer: number;
        qtyWaitingForSupplier: number;
        qtyOrderedFromVendor: number;
        qtyNone: number;
        qtyDamaged: number;
        qtyWaste: number;
        qtyUnlinkedReturn: number;
        qtyComposed: number;
        qtyDecomposed: number;
        qtySupportedByNewerVersion: number;
        qtyInTransit: number;
        qtyOnHand: number;
        lastSyncedAt: string | null;
    }>;
    totalQtyInStock: number;
    totalQtyOnHand: number;
    totalQtySold: number;
}

const nuxtApp = useNuxtApp();
const squareImportApi = nuxtApp.$squareImportApi as import('~/services/api/wrappers/square-import.api').SquareImportApiService;
const { clients, fetchClients } = useClient();

const loading = ref(false);
const selectedClientId = ref(1);
const inventoryRecords = ref<InventoryRecord[]>([]);
const detailsDialog = ref(false);
const selectedItem = ref<GroupedInventoryItem | null>(null);

const headers = [
    { title: 'Product', key: 'product', sortable: true },
    { title: 'SKU', key: 'productSku', sortable: true },
    { title: 'Locations', key: 'locations', sortable: false },
    { title: 'Total In Stock', key: 'qtyInStock', sortable: true },
    { title: 'Total On Hand', key: 'qtyOnHand', sortable: true },
    { title: 'Total Sold', key: 'qtySold', sortable: true },
    { title: 'Actions', key: 'actions', sortable: false },
];

const clientOptions = computed(() =>
    clients.value.map((client) => ({ title: client.name, value: client.id }))
);

const groupedInventory = computed<GroupedInventoryItem[]>(() => {
    const grouped = new Map<number, GroupedInventoryItem>();

    inventoryRecords.value.forEach((record) => {
        if (!record.product) return;

        const productId = record.product.id;
        if (!grouped.has(productId)) {
            grouped.set(productId, {
                productId,
                productName: record.product.name,
                productSku: record.product.sku,
                squareVariationId: record.product.squareVariationId,
                locations: [],
                totalQtyInStock: 0,
                totalQtyOnHand: 0,
                totalQtySold: 0,
            });
        }

        const item = grouped.get(productId)!;
        item.locations.push({
            locationId: record.locationId,
            locationName: record.location?.name || 'No Location',
            qtyCustom: record.qtyCustom,
            qtyInStock: record.qtyInStock,
            qtySold: record.qtySold,
            qtySoldOnline: record.qtySoldOnline,
            qtyReservedForSale: record.qtyReservedForSale,
            qtyReturnedByCustomer: record.qtyReturnedByCustomer,
            qtyWaitingForSupplier: record.qtyWaitingForSupplier,
            qtyOrderedFromVendor: record.qtyOrderedFromVendor,
            qtyNone: record.qtyNone,
            qtyDamaged: record.qtyDamaged,
            qtyWaste: record.qtyWaste,
            qtyUnlinkedReturn: record.qtyUnlinkedReturn,
            qtyComposed: record.qtyComposed,
            qtyDecomposed: record.qtyDecomposed,
            qtySupportedByNewerVersion: record.qtySupportedByNewerVersion,
            qtyInTransit: record.qtyInTransit,
            qtyOnHand: record.qtyOnHand,
            lastSyncedAt: record.lastSyncedAt,
        });

        item.totalQtyInStock += record.qtyInStock;
        item.totalQtyOnHand += record.qtyOnHand;
        item.totalQtySold += record.qtySold;
    });

    return Array.from(grouped.values());
});

const fetchData = async () => {
    loading.value = true;
    try {
        const response = await squareImportApi.getAllInventory(selectedClientId.value);
        if (response.success && response.data) {
            inventoryRecords.value = response.data;
        }
    } catch (error) {
        console.error('Error fetching inventory:', error);
    } finally {
        loading.value = false;
    }
};

const viewDetails = (item: GroupedInventoryItem) => {
    selectedItem.value = item;
    detailsDialog.value = true;
};

onMounted(async () => {
    await fetchClients();
    await fetchData();
});
</script>
