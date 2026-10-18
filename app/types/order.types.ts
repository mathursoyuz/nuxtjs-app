export type OrderType = 'PROCUREMENT' | 'CUSTOMER_SALE'
export type OrderStatus =
    | 'PENDING_PAYMENT'
    | 'PAYMENT_PROCESSING'
    | 'PAYMENT_FAILED'
    | 'PAYMENT_HELD'
    | 'PAID'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'REFUND_PROCESSING'
    | 'PARTIALLY_REFUNDED'
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
    sellerOrganisationProductId: number
    sellerOrganisationProductVariantId: number
    buyerOrganisationProductId: number
    buyerOrganisationProductVariantId: number
    destinationLocationId: number
    sellerSku: string
    sellerProductName: string
    buyerSku: string
    buyerProductName: string
    quantity: number
    unitPrice: number
    unitCog: number
    totalAmount: number
}

export interface ProcurementOrder {
    id: number
    orderNumber: string
    organisationId: number
    sellerOrganisation: {
        id: number
        name: string
    } | null
    buyerOrganisation: {
        id: number
        name: string
    } | null
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
    completedAt: string | null
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
    sellerOrganisationProductId: number
    sellerOrganisationProductVariantId: number
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
    sellerOrganisationProductId: number
    sellerOrganisationProductVariantId: number
    inventoryLocationId: number
    sellerSku: string
    sellerProductName: string
    quantity: number
    unitPrice: number
    unitCog: number
    taxAmount: number
    totalAmount: number
}

export interface CustomerOrderRefund {
    id: number
    amount: number
    shippingAmount: number
    reason: string | null
    method: string
    status: string
    providerTransactionId: string | null
    refundedBy: number | null
    createdAt: string
    items: Array<{
        orderItemId: number
        quantity: number
        amount: number
    }>
}

export interface CustomerSaleOrder {
    id: number
    orderNumber: string
    organisationId: number
    customerId: number
    organisation: {
        id: number
        name: string
    }
    customer: {
        id: number
        firstName: string
        lastName: string
        email: string
        phoneNumber: string
    }
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
        billing: CustomerOrderAddress
        shipping: CustomerOrderAddress
    }
    items: CustomerOrderItem[]
    attempts: PaymentAttempt[]
    refunds: CustomerOrderRefund[]
    lastPaymentError: string | null
    paidAt: string | null
    completedAt: string | null
    cancelledAt: string | null
    refundedAt: string | null
    createdAt: string
    updatedAt: string
}

export interface CustomerOrderPage {
    data: CustomerSaleOrder[]
    nextCursor: number | null
}

export interface CustomerOrderAddress {
    firstName: string
    lastName: string
    company: string
    address: string
    city: string
    stateCode: string
    postalCode: string
    countryCode: string
    phone: string
    email: string
}

export interface CustomerOrderDraftLine {
    organisationProductVariantId: number
    inventoryLocationId: number
    productName: string
    sku: string
    unitPrice: number
    available: number
    quantity: number
}

export interface CreateCustomerOrderDTO {
    customerId: number
    creditCardId?: number
    shippingAddressId?: number
    billingAddress?: CustomerOrderAddress
    shippingAddress?: CustomerOrderAddress
    shippingMethod: string
    notes?: string
    items: Array<{
        organisationProductVariantId: number
        inventoryLocationId: number
        quantity: number
    }>
    idempotencyKey: string
}

export interface UpdatePendingCustomerOrderDTO {
    creditCardId?: number
    shippingAddressId?: number
    billingAddress?: CustomerOrderAddress
    shippingAddress?: CustomerOrderAddress
    shippingMethod: string
    notes?: string
    items: Array<{
        organisationProductVariantId: number
        inventoryLocationId: number
        quantity: number
    }>
}

export interface RefundCustomerOrderDTO {
    idempotencyKey: string
    manual: boolean
    refundShipping: boolean
    reason?: string
    items: Array<{
        orderItemId: number
        quantity: number
    }>
}

export type CommerceOrder =
    | (ProcurementOrder & { orderType: 'PROCUREMENT' })
    | (CustomerSaleOrder & { orderType: 'CUSTOMER_SALE' })
