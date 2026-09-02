<template>
    <div>
        <div
            v-if="allPreviews.length === 0"
            class="upload-zone upload-zone-small d-flex flex-column align-center justify-center pa-6"
            @click="triggerFileInput"
            @dragover.prevent
            @drop.prevent="handleDrop"
        >
            <v-icon size="40" color="primary" class="mb-2">mdi-cloud-upload</v-icon>
            <div class="text-body-2 text-center">Drop Gallery images here to upload</div>
            <input
                ref="fileInput"
                type="file"
                :accept="acceptedMimeTypes"
                multiple
                style="display: none"
                @change="handleFileChange"
            />
        </div>
        <div v-if="allPreviews.length" class="gallery-container mt-4">
            <div class="d-flex flex-wrap ga-3">
                <!-- Existing Images -->
                <div
                    v-for="(image, idx) in existingGallery"
                    :key="`existing-${idx}`"
                    class="gallery-preview-item"
                >
                    <v-img
                        :src="`${apiBaseUrl}/uploads/${uploadPath}/${image}`"
                        max-height="150"
                        max-width="150"
                        contain
                        class="rounded"
                    />
                    <v-btn
                        icon
                        size="small"
                        color="error"
                        variant="flat"
                        class="remove-btn"
                        @click="removeExistingImage(idx)"
                    >
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </div>
                <!-- New Uploaded Files -->
                <div
                    v-for="(preview, idx) in previewUrls"
                    :key="`new-${idx}`"
                    class="gallery-preview-item"
                >
                    <v-img
                        :src="preview"
                        max-height="150"
                        max-width="150"
                        contain
                        class="rounded"
                    />
                    <v-btn
                        icon
                        size="small"
                        color="error"
                        variant="flat"
                        class="remove-btn"
                        @click="removeNewFile(idx)"
                    >
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </div>
                <div class="gallery-preview-item add-more" @click="triggerFileInput">
                    <v-icon size="40" color="primary">mdi-plus</v-icon>
                    <div class="text-caption mt-2">Add More</div>
                    <input
                        ref="fileInput"
                        type="file"
                        :accept="acceptedMimeTypes"
                        multiple
                        style="display: none"
                        @change="handleFileChange"
                    />
                </div>
            </div>
        </div>
        <div v-if="error && error.length" class="text-error text-caption mt-2">
            {{ Array.isArray(error) ? error[0] : error }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { FILE_UPLOAD, FILE_UPLOAD_MESSAGES } from '~/constants/product.constants'

interface Props {
    modelValue: File[] | null | undefined
    existingGallery?: string[]
    error?: string | string[]
    uploadPath?: string
}

const props = withDefaults(defineProps<Props>(), {
    existingGallery: () => [],
    uploadPath: 'products',
})

const emit = defineEmits<{
    'update:modelValue': [value: File[]]
    'remove-existing-image': [filename: string]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const internalValue = ref<File[]>(Array.isArray(props.modelValue) ? props.modelValue : [])
const currentImages = ref<string[]>([...props.existingGallery])
const runtimeConfig = useRuntimeConfig()
const apiBaseUrl = runtimeConfig.public.apiBaseUrl
const uploadPath = computed(() => props.uploadPath || 'products')
const acceptedMimeTypes = FILE_UPLOAD.ACCEPTED_TYPES.join(',')

const previewUrls = computed(() => {
    return internalValue.value.map((f) => (f instanceof File ? URL.createObjectURL(f) : ''))
})

const allPreviews = computed(() => {
    return [...currentImages.value, ...previewUrls.value]
})

watch(
    () => props.modelValue,
    (newVal) => {
        internalValue.value = Array.isArray(newVal) ? newVal : []
    }
)

watch(
    () => props.existingGallery,
    (newVal) => {
        currentImages.value = [...(newVal || [])]
    }
)

const triggerFileInput = () => {
    fileInput.value?.click()
}

const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    const files = Array.from(target.files || [])
    if (files.length === 0) return

    const remainingSlots =
        FILE_UPLOAD.MAX_GALLERY_FILES - currentImages.value.length - internalValue.value.length
    if (remainingSlots <= 0) {
        alert(FILE_UPLOAD_MESSAGES.MAX_GALLERY_FILES)
        target.value = ''
        return
    }

    const validFiles: File[] = []
    files.forEach((file) => {
        if (validFiles.length >= remainingSlots) return
        if (file.size > FILE_UPLOAD.MAX_SIZE_BYTES) {
            alert(FILE_UPLOAD_MESSAGES.MAX_SIZE(file.name))
            return
        }
        if (!(FILE_UPLOAD.ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
            alert(FILE_UPLOAD_MESSAGES.INVALID_TYPE(file.name))
            return
        }
        validFiles.push(file)
    })

    if (files.length > validFiles.length && validFiles.length === remainingSlots) {
        alert(FILE_UPLOAD_MESSAGES.MAX_GALLERY_FILES)
    }

    internalValue.value.push(...validFiles)
    emit('update:modelValue', [...internalValue.value])
    target.value = ''
}

const handleDrop = (event: DragEvent) => {
    const files = Array.from(event.dataTransfer?.files || [])
    if (files.length === 0) return

    const fakeEvent = {
        target: {
            files,
        },
    } as unknown as Event
    handleFileChange(fakeEvent)
}

const removeNewFile = (index: number) => {
    internalValue.value.splice(index, 1)
    emit('update:modelValue', [...internalValue.value])
}

const removeExistingImage = (index: number) => {
    const filename = currentImages.value[index]
    if (!filename) {
        return
    }
    currentImages.value.splice(index, 1)
    // Emit event to notify parent to call backend delete API
    emit('remove-existing-image', filename)
}
</script>

<style scoped>
.upload-zone {
    border: 2px dashed rgba(155, 35, 53, 0.4);
    border-radius: 8px;
    background-color: rgba(155, 35, 53, 0.02);
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 150px;
}

.upload-zone:hover {
    border-color: rgba(155, 35, 53, 0.8);
    background-color: rgba(155, 35, 53, 0.05);
}

.upload-zone-small {
    min-height: 150px;
}

.gallery-preview-item {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.12);
    width: 150px;
    height: 150px;
}

.gallery-preview-item.add-more {
    border: 2px dashed rgba(155, 35, 53, 0.4);
    background-color: rgba(155, 35, 53, 0.02);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.gallery-preview-item.add-more:hover {
    border-color: rgba(155, 35, 53, 0.8);
    background-color: rgba(155, 35, 53, 0.05);
}

.remove-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    background: rgba(0, 0, 0, 0.5);
}

.gap-2 {
    gap: 8px;
}
</style>
