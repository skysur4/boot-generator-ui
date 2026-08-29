/**
 * Converts a camelCase string to PascalCase.
 * @param {string} str - The camelCase string to convert.
 * @returns {string} The converted PascalCase string.
 */
export const toPascalCase = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Converts a camelCase string into spaced Title Case (e.g., "userProfileData" -> "User Profile Data").
 * @param {string} str - The camelCase string to convert.
 * @returns {string} The converted string with spaces and capitalized words.
 */
export const toTitleCase = (str) => {
    if (!str) return '';

    // 1. Insert a space before any uppercase letter
    const spacedStr = str.replace(/([A-Z])/g, ' $1');

    // 2. Capitalize the very first letter and trim any accidental leading spaces
    return spacedStr.charAt(0).toUpperCase() + spacedStr.slice(1).trim();
};

// You can add more string utilities here later
export const reverseString = (str) => str.split('').reverse().join('');