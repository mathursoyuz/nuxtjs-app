/**
 * Transaction utility functions
 * Application-wide utilities for managing transaction status display and logic
 */

import { TransactionStatus, TRANSACTION_STATUS_LABELS } from '~/constants/transaction.constants';

/**
 * Get the text label for a transaction status
 * @param status - Transaction status number (0 = Pending, 1 = Approved, 2 = Declined)
 * @returns Status label string
 */
export function getTransactionStatusText(status: number): string {
    return TRANSACTION_STATUS_LABELS[status as TransactionStatus] || 'Unknown';
}

/**
 * Get the color for a transaction status (for Vuetify chips, badges, etc.)
 * @param status - Transaction status number (0 = Pending, 1 = Approved, 2 = Declined)
 * @returns Vuetify color name
 */
export function getTransactionStatusColor(status: number): string {
    const statusColors: Record<TransactionStatus, string> = {
        [TransactionStatus.Pending]: 'warning',
        [TransactionStatus.Approved]: 'success',
        [TransactionStatus.Declined]: 'error',
    };
    return statusColors[status as TransactionStatus] || 'default';
}

/**
 * Check if a transaction status is approved
 * @param status - Transaction status number
 * @returns true if status is Approved (1)
 */
export function isTransactionApproved(status: number): boolean {
    return status === TransactionStatus.Approved;
}

/**
 * Check if a transaction status is declined
 * @param status - Transaction status number
 * @returns true if status is Declined (2)
 */
export function isTransactionDeclined(status: number): boolean {
    return status === TransactionStatus.Declined;
}

/**
 * Check if a transaction status is pending
 * @param status - Transaction status number
 * @returns true if status is Pending (0)
 */
export function isTransactionPending(status: number): boolean {
    return status === TransactionStatus.Pending;
}

/**
 * Filter transactions by status
 * @param transactions - Array of transactions
 * @param status - Transaction status to filter by
 * @returns Filtered array of transactions
 */
export function filterTransactionsByStatus<T extends { paymentStatus: number }>(
    transactions: T[],
    status: TransactionStatus
): T[] {
    return transactions.filter((transaction) => transaction.paymentStatus === status);
}
