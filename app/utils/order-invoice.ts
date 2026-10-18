import type { CommerceOrder, CustomerOrderAddress } from '~/types/order.types'

interface InvoiceLine {
    text: string
    size?: number
}

const ascii = (value: unknown): string =>
    String(value ?? '')
        .normalize('NFKD')
        .replace(/[^\x20-\x7E]/g, '?')

const pdfText = (value: string): string =>
    ascii(value).replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)')

const money = (value: number, currency: string): string =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value)

const addressLines = (label: string, address: CustomerOrderAddress): InvoiceLine[] => [
    { text: label, size: 12 },
    { text: `${address.firstName} ${address.lastName}` },
    ...(address.company ? [{ text: address.company }] : []),
    { text: address.address },
    { text: `${address.city}, ${address.stateCode} ${address.postalCode}` },
    { text: address.countryCode },
    { text: `${address.phone} | ${address.email}` },
    { text: '' },
]

const createPdf = (lines: InvoiceLine[]): Blob => {
    const linesPerPage = 46
    const pages = Array.from(
        { length: Math.max(1, Math.ceil(lines.length / linesPerPage)) },
        (_, index) => lines.slice(index * linesPerPage, (index + 1) * linesPerPage)
    )
    const fontId = 3 + pages.length * 2
    const objects: string[] = []
    objects[1] = '<< /Type /Catalog /Pages 2 0 R >>'
    objects[2] = `<< /Type /Pages /Kids [${pages.map((_, index) => `${3 + index * 2} 0 R`).join(' ')}] /Count ${pages.length} >>`
    pages.forEach((pageLines, index) => {
        const pageId = 3 + index * 2
        const contentId = pageId + 1
        const content = pageLines
            .map((line, lineIndex) => {
                const y = 790 - lineIndex * 16
                return `BT /F1 ${line.size ?? 10} Tf 50 ${y} Td (${pdfText(line.text)}) Tj ET`
            })
            .join('\n')
        objects[pageId] =
            `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`
        objects[contentId] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`
    })
    objects[fontId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'

    let pdf = '%PDF-1.4\n'
    const offsets: number[] = [0]
    for (let id = 1; id <= fontId; id += 1) {
        offsets[id] = pdf.length
        pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`
    }
    const xrefOffset = pdf.length
    pdf += `xref\n0 ${fontId + 1}\n0000000000 65535 f \n`
    for (let id = 1; id <= fontId; id += 1) {
        pdf += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`
    }
    pdf += `trailer\n<< /Size ${fontId + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
    return new Blob([pdf], { type: 'application/pdf' })
}

export const downloadOrderInvoice = (order: CommerceOrder): void => {
    const lines: InvoiceLine[] = [
        { text: 'ORDER INVOICE', size: 18 },
        { text: `Order: ${order.orderNumber}`, size: 12 },
        {
            text: `Type: ${order.orderType === 'CUSTOMER_SALE' ? 'Customer sale' : 'Procurement'}`,
        },
        { text: `Status: ${order.status.replaceAll('_', ' ')}` },
        { text: `Created: ${new Date(order.createdAt).toLocaleString()}` },
        { text: '' },
    ]

    if (order.orderType === 'CUSTOMER_SALE') {
        lines.push(
            {
                text: `Organisation: ${order.organisation?.name ?? `Organisation #${order.organisationId}`}`,
                size: 12,
            },
            {
                text: order.customer
                    ? `Customer: ${order.customer.firstName} ${order.customer.lastName} | ${order.customer.email}`
                    : `Customer: #${order.customerId}`,
            },
            { text: '' },
            ...addressLines('Billing address', order.payment.billing),
            ...addressLines(
                order.shippingMethod === 'PICKUP' ? 'Pickup contact' : 'Shipping address',
                order.payment.shipping
            )
        )
    } else {
        lines.push(
            {
                text: `Seller: ${order.sellerOrganisation?.name ?? 'Platform Organisation'}`,
                size: 12,
            },
            {
                text: `Buyer: ${order.buyerOrganisation?.name ?? `Organisation #${order.organisationId}`}`,
            },
            { text: '' },
            ...addressLines('Billing address', order.billing)
        )
    }

    lines.push({ text: 'ORDER ITEMS', size: 12 })
    order.items.forEach((item) => {
        const name = 'buyerProductName' in item ? item.buyerProductName : item.sellerProductName
        const sku = 'buyerSku' in item ? item.buyerSku : item.sellerSku
        lines.push({
            text: `${name} | SKU ${sku} | Qty ${item.quantity} | ${money(item.unitPrice, order.currency)} | ${money(item.totalAmount, order.currency)}`,
        })
    })
    lines.push(
        { text: '' },
        { text: `Subtotal: ${money(order.subtotalAmount, order.currency)}` },
        { text: `Tax: ${money(order.totalTax, order.currency)}` }
    )
    if (order.orderType === 'CUSTOMER_SALE') {
        lines.push({ text: `Shipping: ${money(order.shippingAmount, order.currency)}` })
    }
    lines.push(
        { text: `TOTAL: ${money(order.totalAmount, order.currency)}`, size: 14 },
        { text: '' },
        {
            text: `Payment: Card ending ${order.orderType === 'CUSTOMER_SALE' ? order.payment.lastFour || '----' : order.billing.lastFour || '----'}`,
        }
    )

    const url = URL.createObjectURL(createPdf(lines))
    const link = document.createElement('a')
    link.href = url
    link.download = `invoice-${order.orderNumber}.pdf`
    link.click()
    URL.revokeObjectURL(url)
}
