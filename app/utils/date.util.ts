/**
 * Date utility functions
 * Application-wide utilities for date formatting and manipulation
 */

import {
    DATE_FORMAT_OPTIONS,
    DATE_ONLY_FORMAT_OPTIONS,
    TIME_ONLY_FORMAT_OPTIONS,
    LONG_DATE_FORMAT_OPTIONS,
    SHORT_DATE_FORMAT_OPTIONS,
    DEFAULT_DATE_LOCALE,
} from '~/constants/date.constants';

/**
 * Format a date string or Date object using the default application format
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "Jan 15, 2024, 10:30 AM")
 */
export function formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
    }
    
    return dateObj.toLocaleString(DEFAULT_DATE_LOCALE, DATE_FORMAT_OPTIONS);
}

/**
 * Format a date string or Date object to show only the date (no time)
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
export function formatDateOnly(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
    }
    
    return dateObj.toLocaleString(DEFAULT_DATE_LOCALE, DATE_ONLY_FORMAT_OPTIONS);
}

/**
 * Format a date string or Date object to show only the time (no date)
 * @param date - Date string or Date object
 * @returns Formatted time string (e.g., "10:30 AM")
 */
export function formatTimeOnly(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
    }
    
    return dateObj.toLocaleString(DEFAULT_DATE_LOCALE, TIME_ONLY_FORMAT_OPTIONS);
}

/**
 * Format a date string or Date object using long format (full month name)
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "January 15, 2024, 10:30 AM")
 */
export function formatLongDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
    }
    
    return dateObj.toLocaleString(DEFAULT_DATE_LOCALE, LONG_DATE_FORMAT_OPTIONS);
}

/**
 * Format a date string or Date object using short numeric format
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "01/15/2024")
 */
export function formatShortDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
    }
    
    return dateObj.toLocaleString(DEFAULT_DATE_LOCALE, SHORT_DATE_FORMAT_OPTIONS);
}

/**
 * Format a date string or Date object with custom options
 * @param date - Date string or Date object
 * @param options - Custom Intl.DateTimeFormatOptions
 * @param locale - Locale string (defaults to 'en-US')
 * @returns Formatted date string
 */
export function formatDateCustom(
    date: string | Date,
    options: Intl.DateTimeFormatOptions,
    locale: string = DEFAULT_DATE_LOCALE
): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
    }
    
    return dateObj.toLocaleString(locale, options);
}

/**
 * Check if a date string is valid
 * @param date - Date string or Date object
 * @returns true if date is valid
 */
export function isValidDate(date: string | Date): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return !isNaN(dateObj.getTime());
}

/**
 * Get relative time string (e.g., "2 hours ago", "3 days ago")
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export function formatRelativeTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
    }
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
}
