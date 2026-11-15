<template>
    <v-col cols="12" md="6">
        <div class="text-body-2 font-weight-medium mb-2">Avatar Image</div>
        <div
            v-if="!avatarPreview"
            class="upload-zone upload-zone-small d-flex flex-column align-center justify-center pa-4"
            @click="triggerAvatarInput"
            @dragover.prevent
            @drop.prevent="handleAvatarDrop"
        >
            <v-icon size="32" color="primary" class="mb-2">mdi-cloud-upload</v-icon>
            <div class="text-body-2 text-center">Drop Avatar here to upload</div>
            <input
                ref="avatarInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleAvatarChange"
            />
        </div>
        <div v-else class="avatar-preview-container">
            <v-img
                :src="avatarPreview"
                max-height="150"
                max-width="150"
                contain
                class="rounded mb-2"
            />
            <v-btn variant="text" color="error" size="small" @click="removeAvatar">Remove</v-btn>
        </div>
    </v-col>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useToast } from '~/composables/useToast'

const props = defineProps<{
    modelValue: File | null
    existingImageUrl: string | null
    resetToken: number
}>()
const emit = defineEmits<{ 'update:modelValue': [file: File | null] }>()
const { error } = useToast()
const avatarInput = ref<HTMLInputElement | null>(null)
const avatarPreview = ref<string | null>(props.existingImageUrl)
let readRevision = 0

watch(
    (): [string | null, number] => [props.existingImageUrl, props.resetToken],
    (): void => {
        readRevision += 1
        avatarPreview.value = props.existingImageUrl
    }
)

const triggerAvatarInput = (): void => {
    avatarInput.value?.click()
}

const setAvatarFile = (file: File): void => {
    if (file.size > 2 * 1024 * 1024) {
        error('File size must be less than 2MB')
        return
    }
    if (!file.type.startsWith('image/')) {
        error('Please select an image file')
        return
    }

    emit('update:modelValue', file)
    const currentRead = ++readRevision
    const reader = new FileReader()
    reader.onload = (event: ProgressEvent<FileReader>): void => {
        if (currentRead !== readRevision) return
        avatarPreview.value = typeof event.target?.result === 'string' ? event.target.result : null
    }
    reader.readAsDataURL(file)
}

const handleAvatarChange = (event: Event): void => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) setAvatarFile(file)
    target.value = ''
}

const handleAvatarDrop = (event: DragEvent): void => {
    const file = event.dataTransfer?.files[0]
    if (file) setAvatarFile(file)
}

const removeAvatar = (): void => {
    readRevision += 1
    emit('update:modelValue', null)
    avatarPreview.value = null
    if (avatarInput.value) avatarInput.value.value = ''
}
</script>

<style scoped>
.upload-zone {
    border: 2px dashed rgb(var(--v-theme-primary) / 0.4);
    border-radius: 8px;
    background-color: rgb(var(--v-theme-primary) / 0.02);
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 150px;
}

.upload-zone:hover {
    border-color: rgb(var(--v-theme-primary) / 0.8);
    background-color: rgb(var(--v-theme-primary) / 0.05);
}

.upload-zone-small {
    min-height: 100px;
}

.avatar-preview-container {
    text-align: center;
}
</style>
