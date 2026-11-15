export const formatInventoryLabel = (value: string): string =>
    value.replaceAll('_', ' ').toLowerCase()

export const formatInventoryDate = (value: string): string =>
    new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value))

export const signedInventoryQuantity = (value: number): string =>
    value > 0 ? `+${value}` : String(value)
