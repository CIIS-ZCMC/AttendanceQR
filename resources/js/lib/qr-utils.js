/**
 * Utility functions for parsing and validating location QR codes.
 */

/**
 * Extracts a location token from a scanned QR code text.
 * The QR code can be:
 * - A full URL: https://hostname/?token=XYZ or http://hostname/?token=XYZ
 * - A relative URL: /?token=XYZ
 * - A query string: ?token=XYZ or token=XYZ
 * - A direct UUID or alphanumeric token string
 *
 * @param {string} text - Raw decoded text from QR code
 * @returns {string|null} - Extracted token or null if not an expected location link
 */
export function extractLocationToken(text) {
    if (!text || typeof text !== "string") {
        return null;
    }

    const trimmed = text.trim();

    // 1. Try parsing as a URL
    try {
        const url = new URL(trimmed, window.location.origin);
        const tokenFromParam = url.searchParams.get("token");
        if (tokenFromParam && tokenFromParam.trim()) {
            return tokenFromParam.trim();
        }
    } catch {
        // Fall through to regex checks
    }

    // 2. Check for token in query parameters (case-insensitive)
    const queryMatch = trimmed.match(/[?&]token=([a-zA-Z0-9_-]+)/i);
    if (queryMatch && queryMatch[1]) {
        return queryMatch[1];
    }

    // 3. Check for standalone UUID pattern (e.g. f1dce4ae-920e-47fb-ae42-3a5f054b9945)
    const uuidMatch = trimmed.match(
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
    );
    if (uuidMatch) {
        return trimmed;
    }

    // 4. Check for key-value pair "token:XYZ" or "token=XYZ"
    const kvMatch = trimmed.match(/^token[:=]([a-zA-Z0-9_-]+)$/i);
    if (kvMatch && kvMatch[1]) {
        return kvMatch[1];
    }

    return null;
}

/**
 * Checks if a scanned QR text is expected to be an attendance location link.
 *
 * @param {string} text
 * @returns {boolean}
 */
export function isExpectedLocationLink(text) {
    return Boolean(extractLocationToken(text));
}
