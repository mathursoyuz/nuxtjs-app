import { computed, ref, type ComputedRef, type Ref } from 'vue'
import { useCountry } from '~/composables/useCountry'
import { useOrganisation } from '~/composables/useOrganisation'
import type { CreateLocationFormData } from '~/schemas/location.schema'
import type { Location } from '~/types/location.types'

interface LocationDialogFields {
    formData: Ref<CreateLocationFormData>
    organisationOptions: ComputedRef<Array<{ title: string; value: number }>>
    countryOptions: ComputedRef<Array<{ title: string; value: string }>>
    stateOptions: ComputedRef<Array<{ title: string; value: string }>>
    rules: {
        required: (value: unknown) => true | string
        latitude: (value: unknown) => true | string
        longitude: (value: unknown) => true | string
    }
    loadOptions: () => Promise<void>
    loadLocation: (location: Location) => Promise<void>
    handleCountryChange: (countryId: string | null) => Promise<void>
    reset: () => void
    toPayload: () => CreateLocationFormData
}

const emptyLocation = (): CreateLocationFormData => ({
    organisationId: 0,
    name: '',
    address: undefined,
    city: undefined,
    state: undefined,
    country: undefined,
    phoneNumber: undefined,
    lat: undefined,
    long: undefined,
    isActive: true,
})

const coordinate = (
    value: string | undefined,
    minimum: number,
    maximum: number
): string | undefined => {
    if (value === undefined || value === '') return undefined
    const parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed < minimum || parsed > maximum) {
        throw new Error('Invalid location coordinate')
    }
    return Number(parsed.toFixed(8)).toString()
}

export const useLocationDialogFields = (): LocationDialogFields => {
    const { organisations, fetchOrganisations } = useOrganisation()
    const { countryOptions, fetchCountries, fetchStates, getStateOptions } = useCountry()
    const formData = ref<CreateLocationFormData>(emptyLocation())

    const organisationOptions = computed(
        (): Array<{ title: string; value: number }> =>
            organisations.value.map((organisation) => ({
                title: organisation.name,
                value: organisation.id,
            }))
    )
    const stateOptions = computed(
        (): Array<{ title: string; value: string }> =>
            formData.value.country ? getStateOptions(formData.value.country).value : []
    )
    const coordinateRule = (
        value: unknown,
        minimum: number,
        maximum: number,
        label: string
    ): true | string => {
        if (value === null || value === undefined || value === '') return true
        const parsed = Number(value)
        if (!Number.isFinite(parsed)) return `${label} must be a valid number`
        return (
            (parsed >= minimum && parsed <= maximum) ||
            `${label} must be between ${minimum} and ${maximum}`
        )
    }
    const rules = {
        required: (value: unknown): true | string => !!value || 'This field is required',
        latitude: (value: unknown): true | string => coordinateRule(value, -90, 90, 'Latitude'),
        longitude: (value: unknown): true | string => coordinateRule(value, -180, 180, 'Longitude'),
    }

    const loadOptions = async (): Promise<void> => {
        await Promise.all([fetchOrganisations(), fetchCountries()])
    }
    const handleCountryChange = async (countryId: string | null): Promise<void> => {
        formData.value.state = undefined
        if (countryId) await fetchStates(countryId)
    }
    const loadLocation = async (location: Location): Promise<void> => {
        formData.value = {
            organisationId: location.organisationId,
            name: location.name,
            address: location.address || undefined,
            city: location.city || undefined,
            state: location.state || undefined,
            country: location.country || undefined,
            phoneNumber: location.phoneNumber || undefined,
            lat: location.lat || undefined,
            long: location.long || undefined,
            isActive: location.isActive,
        }
        if (formData.value.country) await fetchStates(formData.value.country)
    }
    const reset = (): void => {
        formData.value = emptyLocation()
    }
    const toPayload = (): CreateLocationFormData => ({
        ...formData.value,
        organisationId: Number(formData.value.organisationId),
        lat: coordinate(formData.value.lat, -90, 90),
        long: coordinate(formData.value.long, -180, 180),
    })

    return {
        formData,
        organisationOptions,
        countryOptions,
        stateOptions,
        rules,
        loadOptions,
        loadLocation,
        handleCountryChange,
        reset,
        toPayload,
    }
}
