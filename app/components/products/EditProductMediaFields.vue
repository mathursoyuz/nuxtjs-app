<template>
    <v-card variant="outlined" class="mb-5">
        <v-card-title>Product media</v-card-title>
        <v-card-text>
            <v-row>
                <v-col cols="12" md="4">
                    <div class="text-subtitle-2 mb-2">Thumbnail</div>
                    <ThumbnailUpload
                        :model-value="images.thumbnail"
                        :file-url="thumbnailUrl"
                        @update:model-value="emit('update:thumbnail', $event)"
                    />
                </v-col>
                <v-col cols="12" md="8">
                    <div class="text-subtitle-2 mb-2">Gallery</div>
                    <GalleryUpload
                        :can-remove-existing="canRemoveExisting"
                        :model-value="images.gallery"
                        :existing-gallery="existingGallery"
                        @update:model-value="emit('update:gallery', $event)"
                        @remove-existing-image="emit('remove-existing-image', $event)"
                    />
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import GalleryUpload from './GalleryUpload.vue'
import ThumbnailUpload from './ThumbnailUpload.vue'
import type { ImageFiles } from '~/services/product/ProductFormService'

defineProps<{
    images: ImageFiles
    thumbnailUrl: string | null
    existingGallery: string[]
    canRemoveExisting: boolean
}>()

const emit = defineEmits<{
    'update:thumbnail': [file: File | null]
    'update:gallery': [files: File[]]
    'remove-existing-image': [filename: string]
}>()
</script>
