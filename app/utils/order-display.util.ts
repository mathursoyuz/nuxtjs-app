export const formatOrderStatus = (value: string): string =>
    value
        .replaceAll('_', ' ')
        .toLowerCase()
        .replace(/^./, (letter) => letter.toUpperCase())

export const formatOrderDate = (value: string): string =>
    new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(
        new Date(value)
    )
