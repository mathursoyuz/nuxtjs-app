<template>
    <div>
        <div
            v-if="!previewUrl"
            class="upload-zone upload-zone-small d-flex flex-column align-center justify-center pa-6"
            @click="triggerFileInput"
            @dragover.prevent
            @drop.prevent="handleDrop"
        >
            <v-icon size="40" color="primary" class="mb-2">mdi-cloud-upload</v-icon>
            <div class="text-body-2 text-center">Drop Thumbnail here to upload</div>
            <input
                ref="fileInput"
                type="file"
                :accept="acceptedMimeTypes"
                style="display: none"
                @change="handleFileChange"
            />
        </div>
        <div v-else class="thumbnail-preview-container">
            <v-img :src="previewUrl" max-height="150" contain class="rounded mb-2" />
            <v-btn variant="text" color="error" size="small" @click="removeThumbnail">Remove</v-btn>
        </div>
        <div v-if="error && error.length" class="text-error text-caption mt-2">
            {{ Array.isArray(error) ? error[0] : error }}
        </div>
    </div>
</template>

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

.thumbnail-preview-container {
    text-align: center;
}
</style>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { FILE_UPLOAD, FILE_UPLOAD_MESSAGES } from '~/constants/product.constants'

interface Props {
    modelValue: File | null | undefined
    fileUrl?: string | null
    error?: string | string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
    'update:modelValue': [value: File | null]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const internalValue = ref<File | null>(props.modelValue instanceof File ? props.modelValue : null)
const acceptedMimeTypes = FILE_UPLOAD.ACCEPTED_TYPES.join(',')

const previewUrl = computed(() => {
    if (internalValue.value instanceof File) {
        return URL.createObjectURL(internalValue.value)
    }
    return props.fileUrl || null
})

watch(
    () => props.modelValue,
    (newVal) => {
        if (newVal instanceof File) {
            internalValue.value = newVal
        } else if (newVal === null || newVal === undefined) {
            internalValue.value = null
        }
    }
)

const triggerFileInput = () => {
    fileInput.value?.click()
}

const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    if (file.size > FILE_UPLOAD.MAX_SIZE_BYTES) {
        alert(FILE_UPLOAD_MESSAGES.MAX_SIZE(file.name))
        return
    }

    if (!(FILE_UPLOAD.ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
        alert(FILE_UPLOAD_MESSAGES.INVALID_TYPE(file.name))
        return
    }

    internalValue.value = file
    emit('update:modelValue', file)
    target.value = ''
}

const handleDrop = (event: DragEvent) => {
    const file = event.dataTransfer?.files[0]
    if (!file) return

    const fakeEvent = {
        target: {
            files: [file],
        },
    } as unknown as Event
    handleFileChange(fakeEvent)
}

const removeThumbnail = () => {
    internalValue.value = null
    emit('update:modelValue', null)
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}
</script>
