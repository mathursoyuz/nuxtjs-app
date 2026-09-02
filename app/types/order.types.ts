export type OrderType = 'PROCUREMENT' | 'CUSTOMER_SALE'
export type OrderStatus =
    | 'PENDING_PAYMENT'
    | 'PAYMENT_PROCESSING'
    | 'PAYMENT_FAILED'
    | 'PAYMENT_HELD'
    | 'PAID'
    | 'CANCELLED'
    | 'REFUND_PROCESSING'
    | 'REFUNDED'

export type PaymentAttemptStatus =
    | 'INITIATED'
    | 'PROCESSING'
    | 'APPROVED'
    | 'DECLINED'
    | 'ERROR'
    | 'HELD'
    | 'UNKNOWN'

export interface PaymentAttempt {
    id: number
    orderId: number
    attemptNumber: number
    idempotencyKey: string
    provider: string
    operation: string
    status: PaymentAttemptStatus
    providerTransactionId: string | null
    authCode: string | null
    lastFour: string | null
    responseCode: string | null
    messageCode: string | null
    errorCode: string | null
    errorMessage: string | null
    startedAt: string
    completedAt: string | null
}

export interface ProcurementOrderItem {
    id: number
    sourceProductVariantId: number
    clientProductVariantId: number | null
    destinationLocationId: number
    platformSku: string
    platformName: string
    clientSku: string | null
    clientProductName: string | null
    quantity: number
    unitPrice: number
    unitCog: number
    totalAmount: number
}

export interface ProcurementOrder {
    id: number
    orderNumber: string
    clientId: number
    orderType?: 'PROCUREMENT'
    status: OrderStatus
    paymentStatus: string
    currency: string
    subtotalAmount: number
    totalTax: number
    totalAmount: number
    isInternal: boolean
    billing: {
        email: string
        firstName: string
        lastName: string
        company: string
        phone: string
        address: string
        city: string
        stateCode: string
        postalCode: string
        countryCode: string
        customerProfileId: string | null
        paymentProfileId: string | null
        lastFour: string | null
    }
    items: ProcurementOrderItem[]
    attempts: PaymentAttempt[]
    lastPaymentError: string | null
    paidAt: string | null
    refundedAt: string | null
    createdAt: string
    updatedAt: string
}

export interface ProcurementOrderPage {
    data: ProcurementOrder[]
    nextCursor: number | null
}

export interface ProcurementCatalogItem {
    productVariantId: number
    productId: number
    productName: string
    sku: string
    price: number
    cog: number
    stockManaged: boolean
    availableQty: number | null
}

export interface ProcurementCatalog {
    canUseInternalProcurement: boolean
    items: ProcurementCatalogItem[]
}

export interface CreateProcurementOrderDTO {
    items: Array<{
        productVariantId: number
        destinationLocationId: number
        quantity: number
    }>
    idempotencyKey: string
    isInternal?: boolean
}

export interface ChargeOrderDTO {
    idempotencyKey: string
}

export interface CustomerOrderItem {
    id: number
    sourceProductVariantId: number
    clientProductVariantId: number
    inventoryLocationId: number
    platformSku: string
    platformName: string
    clientSku: string
    clientProductName: string
    quantity: number
    unitPrice: number
    unitCog: number
    totalAmount: number
}

export interface CustomerSaleOrder {
    id: number
    orderNumber: string
    clientId: number
    customerId: number
    orderType?: 'CUSTOMER_SALE'
    status: OrderStatus
    paymentStatus: string
    currency: string
    subtotalAmount: number
    totalTax: number
    shippingAmount: number
    totalAmount: number
    shippingMethod: string
    notes: string | null
    payment: {
        customerProfileId: string
        paymentProfileId: string
        lastFour: string
    }
    items: CustomerOrderItem[]
    attempts: PaymentAttempt[]
    lastPaymentError: string | null
    paidAt: string | null
    createdAt: string
    updatedAt: string
}

export interface CustomerOrderPage {
    data: CustomerSaleOrder[]
    nextCursor: number | null
}

export interface CreateCustomerOrderDTO {
    customerId: number
    shippingAddressId?: number
    shippingMethod: string
    notes?: string
    items: Array<{
        clientProductVariantId: number
        inventoryLocationId: number
        quantity: number
    }>
    idempotencyKey: string
}

export type CommerceOrder =
    | (ProcurementOrder & { orderType: 'PROCUREMENT' })
    | (CustomerSaleOrder & { orderType: 'CUSTOMER_SALE' })
