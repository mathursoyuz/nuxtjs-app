<template>
    <v-navigation-drawer :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
        <v-list>
            <v-list-item prepend-icon="mdi-view-dashboard" title="Dashboard" :to="'/dashboard'" />
            
            <v-list-group value="ecommerce">
                <template #activator="{ props }">
                    <v-list-item v-bind="props" prepend-icon="mdi-store" title="E-Commerce" />
                </template>
                <v-list-item prepend-icon="mdi-package-variant" title="Products" :to="'/products'" />
                <v-list-item prepend-icon="mdi-folder" title="Categories" :to="'/categories'" />
                <v-list-item prepend-icon="mdi-account-group" title="Customers" :to="'/customers'" />
                <v-list-item prepend-icon="mdi-office-building" title="Clients" :to="'/clients'" />
            </v-list-group>

            <v-list-item prepend-icon="mdi-map-marker" title="Locations" :to="'/locations'" />

            <v-list-group value="integrations">
                <template #activator="{ props }">
                    <v-list-item v-bind="props" prepend-icon="mdi-link" title="Integrations" />
                </template>
                <v-list-item prepend-icon="mdi-calculator" title="QuickBooks" :to="'/integrations/quickbooks'" />
                <v-list-item prepend-icon="mdi-square" title="Square" :to="'/integrations/square'" />
                <v-list-item prepend-icon="mdi-truck" title="ShipStation" :to="'/integrations/shipstation'" />
                <v-list-item prepend-icon="mdi-wine" title="Corksy" :to="'/integrations/corksy'" />
                <v-list-item prepend-icon="mdi-credit-card" title="Authorize.net" :to="'/integrations/authorize-net'" />
            </v-list-group>
        </v-list>

        <template #append>
            <v-divider />
            <v-list>
                <RoleGuard roles="admin">
                    <v-list-item prepend-icon="mdi-cog" title="Settings" />
                </RoleGuard>
            </v-list>
        </template>
    </v-navigation-drawer>
</template>

<script setup lang="ts">
import RoleGuard from '~/components/guards/RoleGuard.vue';

interface Props {
    modelValue: boolean;
}

interface Emits {
    (e: 'update:modelValue', value: boolean): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>
