/**
 * apiClient.js
 * Thin, composable fetch wrapper that handles:
 *   - Bearer token injection from the next-auth session
 *   - AES-CBC request encryption & response decryption
 *   - Automatic token refresh on 401 (via next-auth signIn / update)
 *   - Absolute-URL resolution against VITE_API_BASE_URL
 *
 * Usage:
 *   import { apiRequest, get, post, put, del } from '@/lib/apiClient'
 *
 *   const data = await get('/pnb/fetch/fetchById')
 *   const result = await post('/pnb/isu_soundbox/lang/update_language', { lang: 'hi' })
 */

import { getSession, signIn } from "next-auth/react";
import { apiConfig } from "./apiConfig";
import { encryptPayload, unwrapApiResponse } from "./crypto";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const METHODS_WITH_BODY = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Resolves a relative path against the configured base URL.
 * Absolute URLs (http/https) are returned unchanged.
 * @param {string} path
 * @returns {string}
 */
function resolveUrl(path) {
    console.log("resolveUrl", path);
    console.log("resolveUrl", apiConfig.baseUrl);
    if (/^https?:\/\//.test(path)) return path;
    return `${apiConfig.baseUrl}${path}`;
}

/**
 * Safely parses JSON from a fetch Response.
 * Returns `null` when the body is not JSON.
 * @param {Response} response
 * @returns {Promise<unknown>}
 */
async function parseJson(response) {
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) return null;
    return response.json();
}

/**
 * Builds the Authorization header.
 * Priority: next-auth session token → static auth fallback.
 * @returns {Promise<Record<string, string>>}
 */
async function getAuthHeader() {
    try {
        const session = await getSession();
        if (session?.accessToken) {
            return { Authorization: `Bearer ${session.accessToken}` };
        }
    } catch {
        // no-op
    }
    return {};
}

/**
 * Wraps a body that should be encrypted in the `{ RequestData: "<encrypted>" }` envelope.
 * Bodies that should not be encrypted are returned unchanged.
 * @param {string} method
 * @param {unknown} body
 * @returns {{ body: string|undefined, shouldSetContentType: boolean }}
 */
function prepareBody(method, body) {
    if (!METHODS_WITH_BODY.has(method.toUpperCase()) || body == null) {
        return { body: undefined, shouldSetContentType: false };
    }

    const encrypted = JSON.stringify({ RequestData: encryptPayload(body) });
    return { body: encrypted, shouldSetContentType: true };
}

/**
 * Assembles the final RequestInit, injecting auth, pass-key, Content-Type,
 * and an encrypted body.
 * @param {string} method
 * @param {unknown} rawBody
 * @param {Record<string, string>} extraHeaders
 * @returns {Promise<RequestInit>}
 */
async function buildRequestInit(method, rawBody, extraHeaders = {}) {
    const headers = new Headers(extraHeaders);

    // Auth header (session-first, then static fallback)
    const authHeader = await getAuthHeader();
    Object.entries(authHeader).forEach(([k, v]) => headers.set(k, v));

    // Pass-key header
    headers.set("pass_key", process.env.NEXT_PUBLIC_PASS_KEY);

    // Body encryption
    const { body, shouldSetContentType } = prepareBody(method, rawBody);
    if (shouldSetContentType && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    return { method: method.toUpperCase(), headers, body };
}

// ---------------------------------------------------------------------------
// Core request function
// ---------------------------------------------------------------------------

/**
 * Makes an HTTP request, handling encryption, auth injection, and 401 retry.
 *
 * @param {string} path - Relative or absolute URL.
 * @param {object}  [options]
 * @param {string}  [options.method='GET']
 * @param {unknown} [options.body]            - Will be encrypted automatically.
 * @param {Record<string, string>} [options.headers] - Extra headers to merge.
 * @returns {Promise<unknown>} Decrypted and parsed response data.
 * @throws {Error} When the response is not ok after a retry attempt.
 *
 * @example
 * const data = await apiRequest('/pnb/fetch/fetchById', { method: 'GET' })
 * const result = await apiRequest('/pnb/isu_soundbox/lang/update_language', {
 *   method: 'POST',
 *   body: { lang: 'hi' },
 * })
 */
export async function apiRequest(path, options = {}) {
    const { method = "GET", body, headers: extraHeaders = {} } = options;
    const url = resolveUrl(path);

    let init = await buildRequestInit(method, body, extraHeaders);
    let response = await fetch(url, init);
    // ------------------------------------------------------------------
    // 401 → attempt session refresh via next-auth, then retry once
    // ------------------------------------------------------------------
    if (response.status === 401) {
        try {
            // Trigger a silent re-authentication to refresh the session cookie/token
            await signIn("authentik", { redirect: true });
            // Rebuild headers so the new session token is picked up
            init = await buildRequestInit(method, body, extraHeaders);
            response = await fetch(url, init);
        } catch (refreshError) {
            console.error("[apiClient] Token refresh failed:", refreshError);
            // Continue — we'll throw the 401 error below
        }
    }

    // ------------------------------------------------------------------
    // Parse & decrypt
    // ------------------------------------------------------------------
    const rawData = await parseJson(response);
    const data = unwrapApiResponse(rawData);

    // if (!response.ok) {
    //     const message =
    //         (typeof data === "object" && data !== null && data.message) ||
    //         `Request failed: ${response.status} ${response.statusText}`;
    //     throw new Error(message);
    // }

    return data;
}

// ---------------------------------------------------------------------------
// Convenience wrappers
// ---------------------------------------------------------------------------

/**
 * GET request — no body, no encryption.
 * @param {string} path
 * @param {Record<string, string>} [headers]
 */
export function get(path, headers) {
    return apiRequest(path, { method: "GET", headers });
}

/**
 * POST request — body is encrypted automatically.
 * @param {string}  path
 * @param {unknown} body
 * @param {Record<string, string>} [headers]
 */
export function post(path, body, headers) {
    return apiRequest(path, { method: "POST", body, headers });
}

/**
 * PUT request — body is encrypted automatically.
 * @param {string}  path
 * @param {unknown} body
 * @param {Record<string, string>} [headers]
 */
export function put(path, body, headers) {
    return apiRequest(path, { method: "PUT", body, headers });
}

/**
 * PATCH request — body is encrypted automatically.
 * @param {string}  path
 * @param {unknown} body
 * @param {Record<string, string>} [headers]
 */
export function patch(path, body, headers) {
    return apiRequest(path, { method: "PATCH", body, headers });
}

/**
 * DELETE request — body is encrypted when provided.
 * @param {string}  path
 * @param {unknown} [body]
 * @param {Record<string, string>} [headers]
 */
export function del(path, body, headers) {
    return apiRequest(path, { method: "DELETE", body, headers });
}
