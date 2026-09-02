<template>
    <div class="auth-page">
        <div class="auth-container">
            <!-- Left Side - Wine Animation -->
            <div class="wine-animation-section">
                <div class="wine-glass-container">
                    <div class="wine-glass">
                        <div class="wine-liquid"></div>
                        <div class="wine-bubbles">
                            <span v-for="i in 5" :key="i" :class="`bubble bubble-${i}`"></span>
                        </div>
                    </div>
                    <div class="wine-bottle">
                        <div class="wine-pour"></div>
                    </div>
                </div>
                <div class="wine-text">
                    <h2 class="text-h4 font-weight-bold mb-2">Join Us</h2>
                    <p class="text-body-1 text-medium-emphasis">
                        Create your account and start your journey
                    </p>
                </div>
            </div>

            <!-- Right Side - Register Form -->
            <div class="auth-form-section">
                <div class="auth-form-wrapper">
                    <div class="logo-container mb-8">
                        <img src="/assets/images/logo.png" alt="Logo" class="auth-logo" />
                    </div>

                    <h1 class="text-h4 font-weight-bold mb-2">Create Account</h1>
                    <p class="text-body-2 text-medium-emphasis mb-8">
                        Fill in your details to create a new account
                    </p>

                    <v-form ref="formRef" v-model="valid" @submit.prevent="handleRegister">
                        <v-text-field
                            v-model="formData.email"
                            label="Email"
                            type="email"
                            variant="outlined"
                            density="comfortable"
                            prepend-inner-icon="mdi-email-outline"
                            class="mb-4"
                            :rules="emailRules"
                        ></v-text-field>

                        <v-text-field
                            v-model="formData.firstName"
                            label="First Name"
                            variant="outlined"
                            density="comfortable"
                            prepend-inner-icon="mdi-account-outline"
                            class="mb-4"
                            :rules="nameRules"
                        ></v-text-field>

                        <v-text-field
                            v-model="formData.lastName"
                            label="Last Name"
                            variant="outlined"
                            density="comfortable"
                            prepend-inner-icon="mdi-account-outline"
                            class="mb-4"
                            :rules="nameRules"
                        ></v-text-field>

                        <v-text-field
                            v-model="formData.phoneNumber"
                            label="Phone Number"
                            variant="outlined"
                            density="comfortable"
                            prepend-inner-icon="mdi-phone-outline"
                            class="mb-4"
                            :rules="phoneRules"
                        ></v-text-field>

                        <v-text-field
                            v-model="formData.password"
                            label="Password"
                            :type="showPassword ? 'text' : 'password'"
                            variant="outlined"
                            density="comfortable"
                            prepend-inner-icon="mdi-lock-outline"
                            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                            @click:append-inner="showPassword = !showPassword"
                            class="mb-4"
                            :rules="passwordRules"
                        ></v-text-field>

                        <v-text-field
                            v-model="formData.confirmPassword"
                            label="Confirm Password"
                            :type="showConfirmPassword ? 'text' : 'password'"
                            variant="outlined"
                            density="comfortable"
                            prepend-inner-icon="mdi-lock-check-outline"
                            :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                            @click:append-inner="showConfirmPassword = !showConfirmPassword"
                            class="mb-4"
                            :rules="confirmPasswordRules"
                        ></v-text-field>

                        <v-select
                            v-model="formData.role"
                            label="Role"
                            :items="roleOptions"
                            item-title="title"
                            item-value="value"
                            prepend-inner-icon="mdi-account-badge-outline"
                            variant="outlined"
                            density="comfortable"
                            class="mb-4"
                        ></v-select>

                        <v-alert v-if="error" type="error" class="mb-4" density="compact">
                            {{ error }}
                        </v-alert>

                        <v-btn
                            type="submit"
                            color="primary"
                            size="large"
                            block
                            class="mb-4"
                            :loading="loading"
                            :disabled="!valid || loading"
                        >
                            Create Account
                        </v-btn>

                        <div class="text-center">
                            <span class="text-body-2 text-medium-emphasis">
                                Already have an account?
                            </span>
                            <NuxtLink
                                to="/login"
                                class="text-body-2 text-primary text-decoration-none ml-1"
                            >
                                Sign In
                            </NuxtLink>
                        </div>
                    </v-form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { registerSchema, type RegisterFormData } from '~/schemas/auth.schema'
import { useAuthStore } from '~/stores/auth.store'
import { useRouter } from 'vue-router'
import { useToast } from '~/composables/useToast'
import type { RegisterData } from '~/types/auth.types'

definePageMeta({
    layout: false,
    public: true, // Public route, no auth required
    middleware: ['guest'],
})

const authStore = useAuthStore()
const router = useRouter()
const { success: showSuccess, error: showError } = useToast()

const formRef = ref()
const valid = ref(false)
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const formData = reactive<RegisterFormData>({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: 'sales_rep', // Default role
})

const emailRules = [
    (v: string) => !!v || 'Email is required',
    (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid',
]

const nameRules = [
    (v: string) => !!v || 'Name is required',
    (v: string) => (v && v.length >= 3) || 'Name must be at least 3 characters',
]

const phoneRules = [
    (v: string) => !!v || 'Phone number is required',
    (v: string) => (v && v.length >= 10) || 'Phone number must be at least 10 characters',
]

const passwordRules = [
    (v: string) => !!v || 'Password is required',
    (v: string) => (v && v.length >= 8) || 'Password must be at least 8 characters',
]

const confirmPasswordRules = [
    (v: string) => !!v || 'Please confirm your password',
    (v: string) => v === formData.password || 'Passwords do not match',
]

const roleOptions = [
    { title: 'Sales Representative', value: 'sales_rep' },
    { title: 'Sales Manager', value: 'sales_manager' },
    { title: 'Administrator', value: 'admin' },
]

async function handleRegister() {
    if (!formRef.value) {
        return
    }

    const { valid: isValid } = await formRef.value.validate()
    if (!isValid) {
        return
    }

    try {
        loading.value = true
        error.value = ''

        const result = registerSchema.safeParse(formData)
        if (!result.success) {
            error.value = result.error.issues.map((e) => e.message).join(', ')
            return
        }

        // Prepare registration data - exclude role field, but keep confirmPassword for backend validation
        const { role, ...registrationData } = result.data

        // For now, we don't send roleId - backend will default to sales_rep
        // In the future, we can map role names to roleIds if we have a roles API
        const dataToSend: RegisterData = {
            ...registrationData,
            // roleId will be handled by backend based on role name if we add that endpoint
        }

        try {
            await authStore.register(dataToSend)
            showSuccess('Registration successful!')
            router.push('/dashboard')
        } catch (registerError: unknown) {
            // Check if this is a successful registration but without auth data (backend interceptor issue)
            if (
                registerError &&
                typeof registerError === 'object' &&
                'isRegistrationSuccess' in registerError
            ) {
                const successError = registerError as {
                    isRegistrationSuccess: boolean
                    message: string
                }
                if (successError.isRegistrationSuccess) {
                    showSuccess(successError.message)
                    // Redirect to login page since we don't have auth data
                    router.push('/login')
                    return
                }
            }
            throw registerError // Re-throw to be handled by outer catch
        }
    } catch (err: unknown) {
        let errorMessage = 'Registration failed. Please try again.'

        // Extract error message from API response
        if (err && typeof err === 'object' && 'response' in err) {
            const axiosError = err as {
                response?: { data?: { message?: string; error?: string | { message?: string } } }
            }
            if (axiosError.response?.data) {
                const data = axiosError.response.data
                if (typeof data.message === 'string') {
                    errorMessage = data.message
                } else if (typeof data.error === 'string') {
                    errorMessage = data.error
                } else if (
                    data.error &&
                    typeof data.error === 'object' &&
                    'message' in data.error
                ) {
                    errorMessage = (data.error as { message: string }).message
                }
            }
        } else if (err instanceof Error) {
            errorMessage = err.message
        }

        error.value = errorMessage
        showError(errorMessage)
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #fdfbfb 0%, #f8f9fa 100%);
    padding: 20px;
}

.auth-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    max-width: 1200px;
    width: 100%;
    background: white;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.wine-animation-section {
    background: linear-gradient(135deg, #9b2335 0%, #be3455 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 40px;
    position: relative;
    overflow: hidden;
}

.wine-text {
    color: white;
    text-align: center;
    margin-top: 40px;
    z-index: 2;
}

.wine-glass-container {
    position: relative;
    width: 200px;
    height: 300px;
    z-index: 1;
}

/* Wine Glass */
.wine-glass {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 120px;
    height: 200px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: none;
    border-radius: 0 0 60px 60px;
    background: rgba(255, 255, 255, 0.05);
    overflow: hidden;
}

/* Wine Liquid */
.wine-liquid {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 0%;
    background: linear-gradient(to top, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.4) 100%);
    border-radius: 0 0 60px 60px;
    animation: fillWine 3s ease-in-out infinite;
}

@keyframes fillWine {
    0% {
        height: 0%;
        opacity: 0;
    }
    50% {
        height: 70%;
        opacity: 1;
    }
    100% {
        height: 70%;
        opacity: 1;
    }
}

/* Wine Bubbles */
.wine-bubbles {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.bubble {
    position: absolute;
    bottom: 0;
    width: 8px;
    height: 8px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 50%;
    animation: bubbleRise 3s ease-in-out infinite;
}

.bubble-1 {
    left: 20%;
    animation-delay: 0s;
}

.bubble-2 {
    left: 40%;
    animation-delay: 0.5s;
    width: 6px;
    height: 6px;
}

.bubble-3 {
    left: 60%;
    animation-delay: 1s;
    width: 10px;
    height: 10px;
}

.bubble-4 {
    left: 30%;
    animation-delay: 1.5s;
    width: 5px;
    height: 5px;
}

.bubble-5 {
    left: 70%;
    animation-delay: 2s;
    width: 7px;
    height: 7px;
}

@keyframes bubbleRise {
    0% {
        bottom: 0;
        opacity: 0;
        transform: translateX(0);
    }
    10% {
        opacity: 1;
    }
    90% {
        opacity: 1;
    }
    100% {
        bottom: 70%;
        opacity: 0;
        transform: translateX(10px);
    }
}

/* Wine Bottle */
.wine-bottle {
    position: absolute;
    top: -80px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 100px;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px 8px 4px 4px;
}

.wine-bottle::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 15px;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 2px;
}

/* Wine Pour */
.wine-pour {
    position: absolute;
    top: -5px;
    left: 50%;
    transform: translateX(-50%);
    width: 3px;
    height: 60px;
    background: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0.8) 0%,
        rgba(255, 255, 255, 0.4) 100%
    );
    border-radius: 2px;
    animation: pourWine 3s ease-in-out infinite;
}

@keyframes pourWine {
    0% {
        height: 0;
        opacity: 0;
    }
    30% {
        height: 60px;
        opacity: 1;
    }
    70% {
        height: 60px;
        opacity: 1;
    }
    100% {
        height: 0;
        opacity: 0;
    }
}

/* Auth Form Section */
.auth-form-section {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px 40px;
    overflow-y: auto;
    max-height: 100vh;
}

.auth-form-wrapper {
    width: 100%;
    max-width: 400px;
}

.auth-logo {
    height: 50px;
    width: auto;
}

/* Responsive */
@media (max-width: 960px) {
    .auth-container {
        grid-template-columns: 1fr;
    }

    .wine-animation-section {
        min-height: 300px;
        padding: 40px 20px;
    }

    .wine-glass-container {
        width: 150px;
        height: 200px;
    }

    .wine-glass {
        width: 100px;
        height: 150px;
    }

    .auth-form-section {
        max-height: none;
    }
}
</style>
