<template>
    <v-breadcrumbs :items="items" class="pa-0">
        <template #divider>
            <v-icon>mdi-chevron-right</v-icon>
        </template>
    </v-breadcrumbs>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

interface BreadcrumbItem {
    title: string;
    disabled?: boolean;
    href?: string;
}

const route = useRoute();

const items = computed<BreadcrumbItem[]>(() => {
    const path = route.path;
    const segments = path.split('/').filter(Boolean);
    
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Home', href: '/', disabled: false },
    ];

    let currentPath = '';
    segments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        const isLast = index === segments.length - 1;
        breadcrumbs.push({
            title: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
            href: isLast ? undefined : currentPath,
            disabled: isLast,
        });
    });

    return breadcrumbs;
});
</script>
