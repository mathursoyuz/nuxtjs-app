<template>
    <v-card variant="outlined">
        <v-card-title class="text-subtitle-1">{{ title }}</v-card-title>
        <v-card-text>
            <v-file-input
                :model-value="modelValue"
                :label="label"
                :accept="accept"
                :multiple="multiple"
                :disabled="disabled"
                :required="required"
                :rules="rules"
                :show-size="showSize"
                :prepend-icon="prependIcon"
                variant="outlined"
                density="compact"
                clearable
                @update:model-value="handleFileChange"
            />

            <!-- Preview for images -->
            <div v-if="preview && isImage" class="mt-4">
                <v-img
                    :src="preview"
                    :max-width="previewMaxWidth"
                    :max-height="previewMaxHeight"
                    class="rounded"
                    cover
                />
            </div>

            <!-- File list for multiple files -->
            <div v-if="multiple && fileList.length > 0" class="mt-4">
                <v-chip
                    v-for="(file, index) in fileList"
                    :key="index"
                    class="mr-2 mb-2"
                    closable
                    @click:close="removeFile(index)"
                >
                    {{ file.name }}
                </v-chip>
            </div>

            <!-- Upload progress -->
            <v-progress-linear
                v-if="uploading"
                :model-value="uploadProgress"
                color="primary"
                class="mt-4"
            >
                <template #default>
                    <span class="text-caption">{{ uploadProgress }}%</span>
                </template>
            </v-progress-linear>

            <!-- Error message -->
            <v-alert v-if="error" type="error" density="compact" class="mt-4">
                {{ error }}
            </v-alert>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface Props {
    modelValue: File | File[] | null;
    title?: string;
    label?: string;
    accept?: string;
    multiple?: boolean;
    disabled?: boolean;
    required?: boolean;
    rules?: Array<(value: unknown) => boolean | string>;
    showSize?: boolean;
    prependIcon?: string;
    previewMaxWidth?: number;
    previewMaxHeight?: number;
    autoUpload?: boolean;
    uploadUrl?: string;
}

interface Emits {
    (e: 'update:modelValue', value: File | File[] | null): void;
    (e: 'upload-progress', progress: number): void;
    (e: 'upload-complete', url: string | string[]): void;
    (e: 'upload-error', error: Error): void;
}

const props = withDefaults(defineProps<Props>(), {
    title: 'File Upload',
    label: 'Choose file',
    accept: '*/*',
    multiple: false,
    disabled: false,
    required: false,
    showSize: true,
    prependIcon: 'mdi-cloud-upload',
    previewMaxWidth: 300,
    previewMaxHeight: 300,
    autoUpload: false,
});

const emit = defineEmits<Emits>();

const preview = ref<string | null>(null);
const fileList = ref<File[]>([]);
const uploading = ref(false);
const uploadProgress = ref(0);
const error = ref<string | null>(null);

const isImage = computed(() => {
    if (!props.modelValue) return false;
    const file = Array.isArray(props.modelValue) ? props.modelValue[0] : props.modelValue;
    return file.type.startsWith('image/');
});

const handleFileChange = (files: File | File[] | null) => {
    error.value = null;
    
    if (!files) {
        preview.value = null;
        fileList.value = [];
        emit('update:modelValue', null);
        return;
    }

    if (Array.isArray(files)) {
        fileList.value = files;
        emit('update:modelValue', files);
        
        if (props.autoUpload && props.uploadUrl) {
            uploadFiles(files);
        }
    } else {
        fileList.value = [files];
        emit('update:modelValue', files);
        
        // Create preview for images
        if (isImage.value) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.value = e.target?.result as string;
            };
            reader.readAsDataURL(files);
        }
        
        if (props.autoUpload && props.uploadUrl) {
            uploadFile(files);
        }
    }
};

const removeFile = (index: number) => {
    fileList.value.splice(index, 1);
    if (fileList.value.length === 0) {
        emit('update:modelValue', null);
    } else {
        emit('update:modelValue', props.multiple ? fileList.value : fileList.value[0]);
    }
};

const uploadFile = async (file: File) => {
    if (!props.uploadUrl) return;
    
    uploading.value = true;
    uploadProgress.value = 0;
    error.value = null;

    try {
        const formData = new FormData();
        formData.append('file', file);

        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                uploadProgress.value = Math.round((e.loaded / e.total) * 100);
                emit('upload-progress', uploadProgress.value);
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status === 200 || xhr.status === 201) {
                const response = JSON.parse(xhr.responseText);
                emit('upload-complete', response.url || response.data?.url || '');
            } else {
                throw new Error('Upload failed');
            }
            uploading.value = false;
        });

        xhr.addEventListener('error', () => {
            error.value = 'Upload failed';
            uploading.value = false;
            emit('upload-error', new Error('Upload failed'));
        });

        xhr.open('POST', props.uploadUrl);
        xhr.send(formData);
    } catch (err) {
        error.value = err instanceof Error ? err.message : 'Upload failed';
        uploading.value = false;
        emit('upload-error', err instanceof Error ? err : new Error('Upload failed'));
    }
};

const uploadFiles = async (files: File[]) => {
    // Upload multiple files sequentially
    for (const file of files) {
        await uploadFile(file);
    }
};

watch(() => props.modelValue, (newValue) => {
    if (!newValue) {
        preview.value = null;
        fileList.value = [];
    }
}, { immediate: true });
</script>
