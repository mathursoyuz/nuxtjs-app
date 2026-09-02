const LOGOUT_ALL_CHANNEL = 'winerysupport-auth'
const LOGOUT_ALL_STORAGE_KEY = 'winerysupport:logout-all'

interface AuthSyncMessage {
    type: 'logout-all'
    nonce: string
}

const createLogoutMessage = (): AuthSyncMessage => ({
    type: 'logout-all',
    nonce: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
})

export const publishLogoutAll = (): void => {
    const message = createLogoutMessage()

    if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel(LOGOUT_ALL_CHANNEL)
        channel.postMessage(message)
        channel.close()
        return
    }

    // The storage event is a fallback for browsers without BroadcastChannel.
    localStorage.setItem(LOGOUT_ALL_STORAGE_KEY, JSON.stringify(message))
    localStorage.removeItem(LOGOUT_ALL_STORAGE_KEY)
}

export const subscribeToLogoutAll = (callback: () => void): (() => void) => {
    const channel = 'BroadcastChannel' in window ? new BroadcastChannel(LOGOUT_ALL_CHANNEL) : null

    const handleChannelMessage = (event: MessageEvent<AuthSyncMessage>): void => {
        if (event.data?.type === 'logout-all') {
            callback()
        }
    }

    const handleStorage = (event: StorageEvent): void => {
        if (event.key !== LOGOUT_ALL_STORAGE_KEY || !event.newValue) {
            return
        }

        try {
            const message = JSON.parse(event.newValue) as AuthSyncMessage
            if (message.type === 'logout-all') {
                callback()
            }
        } catch {
            // Ignore malformed cross-tab messages.
        }
    }

    if (channel) {
        channel.addEventListener('message', handleChannelMessage)
    } else {
        window.addEventListener('storage', handleStorage)
    }

    return () => {
        channel?.removeEventListener('message', handleChannelMessage)
        channel?.close()
        if (!channel) {
            window.removeEventListener('storage', handleStorage)
        }
    }
}
