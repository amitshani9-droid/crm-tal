/**
 * formatters.js
 * Shared utility functions for formatting data across the CRM.
 */

/**
 * Returns initials from a full name string.
 * E.g. "ישראל ישראלי" → "יי"
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length > 1) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
}
