<template>
    <v-card variant="outlined" class="rich-text-editor">
        <v-toolbar density="compact" color="grey-lighten-4" class="editor-toolbar">
            <v-btn icon size="small" variant="text" @click="formatText('bold')" :class="{ 'v-btn--active': isActive('bold') }">
                <v-icon>mdi-format-bold</v-icon>
            </v-btn>
            <v-btn icon size="small" variant="text" @click="formatText('italic')" :class="{ 'v-btn--active': isActive('italic') }">
                <v-icon>mdi-format-italic</v-icon>
            </v-btn>
            <v-btn icon size="small" variant="text" @click="formatText('underline')" :class="{ 'v-btn--active': isActive('underline') }">
                <v-icon>mdi-format-underline</v-icon>
            </v-btn>
            <v-divider vertical class="mx-1"></v-divider>
            <v-btn icon size="small" variant="text" @click="formatText('heading', 1)">
                <v-icon>mdi-format-header-1</v-icon>
            </v-btn>
            <v-btn icon size="small" variant="text" @click="formatText('heading', 2)">
                <v-icon>mdi-format-header-2</v-icon>
            </v-btn>
            <v-btn icon size="small" variant="text" @click="formatText('heading', 3)">
                <v-icon>mdi-format-header-3</v-icon>
            </v-btn>
            <v-divider vertical class="mx-1"></v-divider>
            <v-btn icon size="small" variant="text" @click="formatText('insertUnorderedList')">
                <v-icon>mdi-format-list-bulleted</v-icon>
            </v-btn>
            <v-btn icon size="small" variant="text" @click="formatText('insertOrderedList')">
                <v-icon>mdi-format-list-numbered</v-icon>
            </v-btn>
            <v-divider vertical class="mx-1"></v-divider>
            <v-btn icon size="small" variant="text" @click="formatText('createLink')">
                <v-icon>mdi-link</v-icon>
            </v-btn>
            <v-btn icon size="small" variant="text" @click="formatText('code')">
                <v-icon>mdi-code-tags</v-icon>
            </v-btn>
            <v-btn icon size="small" variant="text" @click="triggerImageInput">
                <v-icon>mdi-image</v-icon>
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn icon size="small" variant="text" @click="formatText('undo')">
                <v-icon>mdi-undo</v-icon>
            </v-btn>
            <v-btn icon size="small" variant="text" @click="formatText('redo')">
                <v-icon>mdi-redo</v-icon>
            </v-btn>
        </v-toolbar>
        <div
            ref="editorRef"
            contenteditable
            class="editor-content pa-4"
            :style="{ minHeight: minHeight + 'px' }"
            @input="handleInput"
            @blur="handleBlur"
        ></div>
        <input
            ref="imageInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleImageUpload"
        />
    </v-card>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';

interface Props {
    modelValue: string | null | undefined;
    minHeight?: number;
}

const props = withDefaults(defineProps<Props>(), {
    minHeight: 200,
});

const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();

const editorRef = ref<HTMLDivElement | null>(null);
const imageInput = ref<HTMLInputElement | null>(null);

const handleInput = () => {
    if (editorRef.value) {
        emit('update:modelValue', editorRef.value.innerHTML);
    }
};

const handleBlur = () => {
    if (editorRef.value) {
        emit('update:modelValue', editorRef.value.innerHTML);
    }
};

const formatText = (command: string, value?: unknown) => {
    if (!editorRef.value) return;

    editorRef.value.focus();
    document.execCommand(command, false, value as string);
    handleInput();
};

const isActive = (command: string): boolean => {
    if (!editorRef.value) return false;
    return document.queryCommandState(command);
};

const triggerImageInput = () => {
    imageInput.value?.click();
};

const handleImageUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file || !editorRef.value) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target?.result as string;
        img.style.maxWidth = '100%';
        document.execCommand('insertImage', false, img.src);
        handleInput();
    };
    reader.readAsDataURL(file);
    target.value = '';
};

watch(
    () => props.modelValue,
    (newValue) => {
        if (editorRef.value && editorRef.value.innerHTML !== (newValue || '')) {
            const selection = window.getSelection();
            const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
            editorRef.value.innerHTML = newValue || '';
            if (range && selection) {
                try {
                    selection.removeAllRanges();
                    selection.addRange(range);
                } catch (e) {
                    // Ignore selection errors
                }
            }
        }
    },
    { immediate: true }
);

onMounted(() => {
    if (editorRef.value) {
        editorRef.value.innerHTML = props.modelValue || '';
        // Set cursor to end
        const range = document.createRange();
        range.selectNodeContents(editorRef.value);
        range.collapse(false);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
    }
});
</script>

<style scoped>
.rich-text-editor {
    border-radius: 4px;
}

.editor-toolbar {
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.editor-content {
    outline: none;
    font-family: inherit;
    line-height: 1.6;
}

.editor-content:focus {
    outline: none;
}

.editor-content :deep(img) {
    max-width: 100%;
    height: auto;
}

:deep(.v-btn--active) {
    background-color: rgba(155, 35, 53, 0.1);
    color: #9b2335;
}
</style>
