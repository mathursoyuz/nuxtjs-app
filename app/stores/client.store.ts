import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Client } from '~/types/client.types'

export const useClientStore = defineStore('client', () => {
    const clients = ref<Client[]>([])
    const currentClient = ref<Client | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    const activeClients = computed(() => clients.value.filter((client) => client.isActive))
    const clientById = computed(
        () => (id: number) => clients.value.find((client) => client.id === id)
    )

    function setClients(value: Client[]): void {
        clients.value = value
    }

    function setCurrentClient(value: Client | null): void {
        currentClient.value = value
    }

    function addClient(client: Client): void {
        clients.value.push(client)
    }

    function updateClient(client: Client): void {
        const index = clients.value.findIndex((item) => item.id === client.id)
        if (index >= 0) clients.value[index] = client
        if (currentClient.value?.id === client.id) currentClient.value = client
    }

    function removeClient(id: number): void {
        clients.value = clients.value.filter((client) => client.id !== id)
        if (currentClient.value?.id === id) currentClient.value = null
    }

    function setLoading(value: boolean): void {
        loading.value = value
    }

    function setError(value: string | null): void {
        error.value = value
    }

    function clearError(): void {
        error.value = null
    }

    return {
        clients,
        currentClient,
        loading,
        error,
        activeClients,
        clientById,
        setClients,
        setCurrentClient,
        addClient,
        updateClient,
        removeClient,
        setLoading,
        setError,
        clearError,
    }
})
