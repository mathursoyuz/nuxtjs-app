/**
 * Transaction/Payment Status Constants
 * These constants are used application-wide for managing transaction status
 */

/**
 * Transaction Status Enum
 * Maps to backend PaymentStatus enum
 */
export enum TransactionStatus {
    Pending = 0,
    Approved = 1,
    Declined = 2,
}

/**
 * Transaction Status IDs as constants
 */
export const TRANSACTION_STATUS = {
    PENDING: TransactionStatus.Pending,
    APPROVED: TransactionStatus.Approved,
    DECLINED: TransactionStatus.Declined,
} as const;

/**
 * Transaction Status Labels
 */
export const TRANSACTION_STATUS_LABELS = {
    [TransactionStatus.Pending]: 'Pending',
    [TransactionStatus.Approved]: 'Approved',
    [TransactionStatus.Declined]: 'Declined',
} as const;

/**
 * Transaction Status Options for dropdowns/selects
 */
export const TRANSACTION_STATUS_OPTIONS = [
    { title: 'Pending', value: TransactionStatus.Pending },
    { title: 'Approved', value: TransactionStatus.Approved },
    { title: 'Declined', value: TransactionStatus.Declined },
] as const;

/**
 * Type for transaction status
 */
export type TransactionStatusType = TransactionStatus;
