/**
 * crypto.js
 * AES-CBC encryption/decryption for API request & response payloads.
 * Key is a Base64-encoded 256-bit value stored in PAYLOAD_ENCRYPTION_KEY.
 */

import CryptoJS from "crypto-js";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function getDecodedKey() {
    const raw = process.env.NEXT_PUBLIC_PAYLOAD_ENCRYPTION_KEY ?? "";
    if (!raw) {
        throw new Error(
            "[crypto] Missing PAYLOAD_ENCRYPTION_KEY. " +
                "Add it to your .env file before making encrypted requests.",
        );
    }
    return CryptoJS.enc.Base64.parse(raw);
}

function toJsonString(value) {
    if (typeof value === "string") return value;
    return JSON.stringify(value ?? {});
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Encrypts any object/string into a Base64 string (IV + ciphertext).
 * @param {unknown} payload - Request body to encrypt.
 * @returns {string} Base64-encoded encrypted string.
 */
export function encryptPayload(payload) {
    const key = getDecodedKey();
    const iv = CryptoJS.lib.WordArray.random(16);
    const plaintext = CryptoJS.enc.Utf8.parse(toJsonString(payload));

    const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });

    // Prepend IV so the server can extract it: [16-byte IV][ciphertext]
    return CryptoJS.enc.Base64.stringify(iv.concat(encrypted.ciphertext));
}

/**
 * Decrypts a Base64 string (IV + ciphertext) into a plain string.
 * Returns the original value unchanged if it is not a non-empty string.
 * @param {unknown} encryptedBase64 - Base64-encoded encrypted string.
 * @returns {string|unknown} Decrypted string, or the original value on pass-through.
 */
export function decryptPayload(encryptedBase64) {
    if (!encryptedBase64 || typeof encryptedBase64 !== "string") {
        return encryptedBase64;
    }

    const key = getDecodedKey();
    const bytes = CryptoJS.enc.Base64.parse(encryptedBase64);
    const iv = CryptoJS.lib.WordArray.create(bytes.words.slice(0, 4), 16);
    const ciphertext = CryptoJS.lib.WordArray.create(
        bytes.words.slice(4),
        bytes.sigBytes - 16,
    );

    const decrypted = CryptoJS.AES.decrypt({ ciphertext }, key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
}

/**
 * Unwraps an API envelope that carries an encrypted `ResponseData` field.
 * If the response has no `ResponseData` it is returned as-is.
 * @param {object|unknown} apiResponse - Raw JSON parsed from the API.
 * @returns {object|string|unknown} Decrypted (and JSON-parsed, when possible) payload.
 */
export function unwrapApiResponse(apiResponse) {
    if (!apiResponse || typeof apiResponse !== "object") return apiResponse;
    if (!("ResponseData" in apiResponse)) return apiResponse;

    const decryptedString = decryptPayload(apiResponse.ResponseData);

    try {
        return JSON.parse(decryptedString);
    } catch {
        return decryptedString;
    }
}
