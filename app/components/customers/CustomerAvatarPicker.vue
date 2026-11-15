<template>
    <div>
        <div class="text-body-2 font-weight-medium mb-2">Avatar Image</div>
        <div
            v-if="!preview"
            class="upload-zone d-flex flex-column align-center justify-center pa-4"
            @click="avatarInput?.click()"
            @dragover.prevent
            @drop.prevent="handleDrop"
        >
            <v-icon size="32" color="primary" class="mb-2">mdi-cloud-upload</v-icon>
            <div class="text-body-2 text-center">Drop Avatar here to upload</div>
            <input
                ref="avatarInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleChange"
            />
        </div>
        <div v-else class="avatar-preview-container">
            <v-img :src="preview" max-height="150" max-width="150" contain class="rounded mb-2" />
            <v-btn variant="text" color="error" size="small" @click="removeAvatar">Remove</v-btn>
        </div>
    </div>
</template>

<script setup lang="ts">
import { CUSTOMER_MESSAGES } from '~/constants/messages.constants'

const props = defineProps<{ modelValue: File | null }>()
const emit = defineEmits<{ 'update:modelValue': [file: File | null] }>()
const { error } = useToast()
const avatarInput = ref<HTMLInputElement | null>(null)
const preview = ref<string | null>(null)
let selectionVersion = 0

const selectFile = (file: File): void => {
    if (file.size > 2 * 1024 * 1024) {
        error(CUSTOMER_MESSAGES.FILE_SIZE_ERROR)
        return
    }
    if (!file.type.startsWith('image/')) {
        error(CUSTOMER_MESSAGES.FILE_TYPE_ERROR)
        return
    }
    emit('update:modelValue', file)
    const version = ++selectionVersion
    const reader = new FileReader()
    reader.onload = () => {
        if (selectionVersion === version) preview.value = String(reader.result ?? '')
    }
    reader.readAsDataURL(file)
}

const handleChange = (event: Event): void => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (file) selectFile(file)
    input.value = ''
}

const handleDrop = (event: DragEvent): void => {
    const file = event.dataTransfer?.files[0]
    if (file) selectFile(file)
}

const removeAvatar = (): void => {
    ++selectionVersion
    preview.value = null
    emit('update:modelValue', null)
    if (avatarInput.value) avatarInput.value.value = ''
}

watch(
    () => props.modelValue,
    (file) => {
        if (file === null) {
            ++selectionVersion
            preview.value = null
        }
    }
)
</script>

<style scoped>
.upload-zone {
    min-height: 150px;
    border: 2px dashed rgb(var(--v-theme-primary) / 0.4);
    border-radius: 8px;
    background-color: rgb(var(--v-theme-primary) / 0.02);
    cursor: pointer;
    transition: all 0.2s ease;
}

.upload-zone:hover {
    border-color: rgb(var(--v-theme-primary) / 0.8);
    background-color: rgb(var(--v-theme-primary) / 0.05);
}

.avatar-preview-container {
    text-align: center;
}
</style>
