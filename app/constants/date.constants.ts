/**
 * Date Format Constants
 * Application-wide constants for date formatting
 */

/**
 * Default date format options for toLocaleString
 * Used throughout the application for consistent date display
 */
export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
} as const;

/**
 * Date-only format options (without time)
 */
export const DATE_ONLY_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
} as const;

/**
 * Time-only format options (without date)
 */
export const TIME_ONLY_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
} as const;

/**
 * Long date format options (full month name)
 */
export const LONG_DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
} as const;

/**
 * Short date format options (numeric)
 */
export const SHORT_DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
} as const;

/**
 * Default locale for date formatting
 */
export const DEFAULT_DATE_LOCALE = 'en-US' as const;
