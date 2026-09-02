<template>
    <v-col :cols="cols" :md="md" :lg="lg">
        <v-text-field
            v-if="type === 'text' || type === 'email' || type === 'password' || type === 'number'"
            :model-value="modelValue"
            :label="label"
            :type="type"
            :required="required"
            :rules="rules"
            :disabled="disabled"
            :readonly="readonly"
            :placeholder="placeholder"
            :prepend-inner-icon="prependIcon"
            :append-inner-icon="appendIcon"
            :hint="hint"
            :persistent-hint="persistentHint"
            :error-messages="errorMessages"
            :variant="variant"
            :density="density"
            :clearable="clearable"
            :min="type === 'number' ? min : undefined"
            :max="type === 'number' ? max : undefined"
            :step="type === 'number' ? step : undefined"
            @update:model-value="handleUpdate($event)"
            @input="handleInput($event)"
            @change="handleChange($event)"
            @blur="handleBlur($event)"
            @focus="$emit('focus', $event)"
        />

        <v-textarea
            v-else-if="type === 'textarea'"
            :model-value="modelValue"
            :label="label"
            :required="required"
            :rules="rules"
            :disabled="disabled"
            :readonly="readonly"
            :placeholder="placeholder"
            :hint="hint"
            :persistent-hint="persistentHint"
            :error-messages="errorMessages"
            :variant="variant"
            :density="density"
            :rows="rows"
            :auto-grow="autoGrow"
            @update:model-value="handleUpdate($event)"
            @input="handleInput($event)"
            @change="handleChange($event)"
            @blur="handleBlur($event)"
            @focus="$emit('focus', $event)"
        />

        <v-select
            v-else-if="type === 'select'"
            :model-value="modelValue"
            :label="label"
            :items="selectItems"
            :required="required"
            :rules="rules"
            :disabled="disabled"
            :readonly="readonly"
            :placeholder="placeholder"
            :hint="hint"
            :persistent-hint="persistentHint"
            :error-messages="errorMessages"
            :variant="variant"
            :density="density"
            :clearable="clearable"
            :multiple="multiple"
            :item-title="itemTitle"
            :item-value="itemValue"
            @update:model-value="handleUpdate($event)"
            @input="handleInput($event)"
            @change="handleChange($event)"
            @blur="handleBlur($event)"
            @focus="$emit('focus', $event)"
        />

        <v-switch
            v-else-if="type === 'checkbox'"
            :model-value="modelValue"
            :label="label"
            :required="required"
            :rules="rules"
            :disabled="disabled"
            :readonly="readonly"
            :hint="hint"
            :persistent-hint="persistentHint"
            :error-messages="errorMessages"
            :density="density"
            color="primary"
            @update:model-value="$emit('update:modelValue', $event)"
        />

        <v-switch
            v-else-if="type === 'switch'"
            :model-value="modelValue"
            :label="label"
            :required="required"
            :rules="rules"
            :disabled="disabled"
            :readonly="readonly"
            :hint="hint"
            :persistent-hint="persistentHint"
            :error-messages="errorMessages"
            :density="density"
            :color="switchColor"
            @update:model-value="$emit('update:modelValue', $event)"
        />

        <v-file-input
            v-else-if="type === 'file'"
            :model-value="modelValue"
            :label="label"
            :required="required"
            :rules="rules"
            :disabled="disabled"
            :readonly="readonly"
            :placeholder="placeholder"
            :hint="hint"
            :persistent-hint="persistentHint"
            :error-messages="errorMessages"
            :variant="variant"
            :density="density"
            :clearable="clearable"
            :accept="accept"
            :show-size="showSize"
            :prepend-icon="prependIcon"
            @update:model-value="$emit('update:modelValue', $event)"
        />
    </v-col>
</template>

<script setup lang="ts">
interface SelectItem {
    title: string;
    value: string | number;
    [key: string]: unknown;
}

interface Props {
    modelValue: string | number | boolean | File | File[] | null | undefined;
    label: string;
    name?: string; // Field name for validation
    type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'switch' | 'file';
    required?: boolean;
    rules?: Array<(value: unknown) => boolean | string>;
    disabled?: boolean;
    readonly?: boolean;
    placeholder?: string;
    hint?: string;
    persistentHint?: boolean;
    errorMessages?: string | string[];
    variant?: 'filled' | 'outlined' | 'plain' | 'underlined' | 'solo' | 'solo-inverted' | 'solo-filled';
    density?: 'default' | 'comfortable' | 'compact';
    clearable?: boolean;
    cols?: number | string;
    md?: number | string;
    lg?: number | string;
    // Text/Number specific
    min?: number;
    max?: number;
    step?: number;
    // Textarea specific
    rows?: number;
    autoGrow?: boolean;
    // Select specific
    selectItems?: SelectItem[] | string[] | number[];
    multiple?: boolean;
    itemTitle?: string;
    itemValue?: string;
    // Switch specific
    switchColor?: string;
    // File specific
    accept?: string;
    showSize?: boolean;
    // Icons
    prependIcon?: string;
    appendIcon?: string;
}

interface Emits {
    (e: 'update:modelValue', value: unknown): void;
    (e: 'input', value: unknown): void;
    (e: 'change', value: unknown): void;
    (e: 'blur', event: FocusEvent): void;
    (e: 'focus', event: FocusEvent): void;
}

const props = withDefaults(defineProps<Props>(), {
    type: 'text',
    required: false,
    disabled: false,
    readonly: false,
    persistentHint: false,
    variant: 'outlined',
    density: 'default',
    clearable: false,
    cols: 12,
    md: 6,
    lg: 4,
    rows: 3,
    autoGrow: false,
    multiple: false,
    itemTitle: 'title',
    itemValue: 'value',
    switchColor: 'primary',
    showSize: true,
    selectItems: () => [],
});

const emit = defineEmits<Emits>();

const handleUpdate = (value: unknown): void => {
    emit('update:modelValue', value);
};

const handleInput = (event: Event): void => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const value = target.value;
    emit('input', value);
    emit('update:modelValue', value);
};

const handleChange = (event: Event): void => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const value = target.value;
    emit('change', value);
    emit('update:modelValue', value);
};

const handleBlur = (event: FocusEvent): void => {
    emit('blur', event);
};
</script>
