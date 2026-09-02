<template>
    <div>
        <div
            v-if="!preview"
            class="upload-zone upload-zone-small d-flex flex-column align-center justify-center pa-6"
            @click="triggerInput"
            @dragover.prevent
            @drop.prevent="handleDrop"
        >
            <v-icon size="40" color="primary" class="mb-2">mdi-cloud-upload</v-icon>
            <div class="text-body-2 text-center">{{ title || 'Drop image here to upload' }}</div>
            <input
                ref="fileInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleChange"
            />
        </div>
        <div v-else class="image-preview-container">
            <v-img
                :src="preview"
                max-height="150"
                contain
                class="rounded mb-2"
            />
            <v-btn
                variant="text"
                color="error"
                size="small"
                @click="removeImage"
            >
                Remove
            </v-btn>
        </div>
        <div v-if="hint" class="text-caption text-medium-emphasis mt-2">
            {{ hint }}
        </div>
        <div v-if="errorMessage" class="text-error text-caption mt-1">
            {{ errorMessage }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
    modelValue: File | null;
    title?: string;
    hint?: string;
    errorMessage?: string;
    existingImageUrl?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
    title: 'Drop image here to upload',
    hint: '',
    errorMessage: '',
    existingImageUrl: null,
});

const emit = defineEmits<{
    'update:modelValue': [value: File | null];
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const preview = ref<string | null>(props.existingImageUrl || null);

const triggerInput = () => {
    fileInput.value?.click();
};

const handleChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.value = e.target?.result as string;
            emit('update:modelValue', file);
        };
        reader.readAsDataURL(file);
    }
};

const handleDrop = (event: DragEvent) => {
    const file = event.dataTransfer?.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.value = e.target?.result as string;
            emit('update:modelValue', file);
        };
        reader.readAsDataURL(file);
    }
};

const removeImage = () => {
    preview.value = null;
    emit('update:modelValue', null);
    if (fileInput.value) {
        fileInput.value.value = '';
    }
};

watch(() => props.existingImageUrl, (newUrl) => {
    if (newUrl && !props.modelValue) {
        preview.value = newUrl;
    } else if (!newUrl && !props.modelValue) {
        preview.value = null;
    }
});

watch(() => props.modelValue, (newFile) => {
    if (!newFile && !props.existingImageUrl) {
        preview.value = null;
    }
});
</script>

<style scoped>
.upload-zone {
    border: 2px dashed rgba(155, 35, 53, 0.4);
    border-radius: 8px;
    background-color: rgba(155, 35, 53, 0.02);
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 200px;
}

.upload-zone:hover {
    border-color: rgba(155, 35, 53, 0.8);
    background-color: rgba(155, 35, 53, 0.05);
}

.upload-zone-small {
    min-height: 150px;
}

.image-preview-container {
    text-align: center;
}
</style>
