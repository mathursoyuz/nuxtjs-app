import { ref, type Ref } from 'vue';
import type { ZodSchema, ZodError } from 'zod';

export interface FieldErrors {
    [field: string]: string[];
}

function debounce<T extends (...args: unknown[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}

export function useFormValidation<T extends Record<string, unknown>>(schema: ZodSchema<T>) {
    const fieldErrors: Ref<FieldErrors> = ref({});
    const isValid = ref(false);
    const isSubmitting = ref(false);

    /**
     * Validate a single field
     * @param field - Field name
     * @param value - Field value
     */
    const validateField = (field: string, value: unknown): boolean => {
        try {
            // Try to validate the entire form data with just this field
            // This is a simplified approach - for better performance, you could cache field schemas
            const formData = { [field]: value } as Partial<T>;
            const result = schema.safeParse(formData);
            
            if (result.success) {
                // Clear error if validation passes
                if (fieldErrors.value[field]) {
                    delete fieldErrors.value[field];
                }
                return true;
            } else {
                // Extract errors for this specific field
                const fieldErrorsList = (result.error.errors || [])
                    .filter((e) => e.path && e.path.length > 0 && e.path[0] === field)
                    .map((e) => e.message);
                
                if (fieldErrorsList.length > 0) {
                    fieldErrors.value[field] = fieldErrorsList;
                } else {
                    // Clear error if no errors for this field
                    if (fieldErrors.value[field]) {
                        delete fieldErrors.value[field];
                    }
                }
                return fieldErrorsList.length === 0;
            }
        } catch (error) {
            if (error instanceof Error && 'errors' in error) {
                const zodError = error as ZodError;
                const fieldErrorsList = (zodError.errors || [])
                    .filter((e) => e.path && e.path.length > 0 && e.path[0] === field)
                    .map((e) => e.message);
                if (fieldErrorsList.length > 0) {
                    fieldErrors.value[field] = fieldErrorsList;
                }
            } else {
                fieldErrors.value[field] = [error instanceof Error ? error.message : 'Validation failed'];
            }
            return false;
        }
    };

    /**
     * Validate on input (debounced)
     */
    const validateOnInput = debounce((field: string, value: unknown) => {
        validateField(field, value);
    }, 300);

    /**
     * Validate on blur (immediate)
     */
    const validateOnBlur = (field: string, value: unknown): boolean => {
        return validateField(field, value);
    };

    /**
     * Validate on change (immediate)
     */
    const validateOnChange = (field: string, value: unknown): boolean => {
        return validateField(field, value);
    };

    /**
     * Validate entire form on submit
     * @param data - Form data to validate
     * @returns Validation result and parsed data
     */
    const validateOnSubmit = (data: unknown): { success: boolean; data?: T; errors?: FieldErrors } => {
        try {
            const parsed = schema.parse(data);
            fieldErrors.value = {};
            isValid.value = true;
            return { success: true, data: parsed };
        } catch (error) {
            if (error instanceof Error && 'errors' in error) {
                const zodError = error as ZodError;
                const errors: FieldErrors = {};
                (zodError.errors || []).forEach((err) => {
                    const field = (err.path && err.path.length > 0 ? err.path[0]?.toString() : undefined) || 'unknown';
                    if (!errors[field]) {
                        errors[field] = [];
                    }
                    errors[field].push(err.message);
                });
                fieldErrors.value = errors;
                isValid.value = false;
                return { success: false, errors };
            }
            isValid.value = false;
            return { success: false, errors: { unknown: ['Validation failed'] } };
        }
    };

    /**
     * Clear field error
     */
    const clearFieldError = (field: string): void => {
        if (fieldErrors.value[field]) {
            delete fieldErrors.value[field];
        }
    };

    /**
     * Clear all errors
     */
    const clearAllErrors = (): void => {
        fieldErrors.value = {};
    };

    /**
     * Get error message for a field
     */
    const getFieldError = (field: string): string | undefined => {
        const errors = fieldErrors.value[field];
        return errors && errors.length > 0 ? errors[0] : undefined;
    };

    /**
     * Get all error messages for a field
     */
    const getFieldErrors = (field: string): string[] => {
        return fieldErrors.value[field] || [];
    };

    return {
        fieldErrors,
        isValid,
        isSubmitting,
        validateField,
        validateOnInput,
        validateOnBlur,
        validateOnChange,
        validateOnSubmit,
        clearFieldError,
        clearAllErrors,
        getFieldError,
        getFieldErrors,
    };
}
