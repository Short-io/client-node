import { client } from "./generated/client.gen"
import { createClient, createConfig } from "./generated/client"
import type { Client } from "./generated/client"
export * from './generated/types.gen';
export * from './generated/sdk.gen';
export * from './generated/zod.gen';

// ─── Rate Limit Types ────────────────────────────────────────────────────────

export interface RateLimitConfig {
    enabled?: boolean;
    maxRetries?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    onRateLimited?: (info: RateLimitInfo) => void;
}

export interface RateLimitInfo {
    status: number;
    attempt: number;
    delayMs: number;
    retryAfter?: number;
    rateLimitLimit?: number;
    rateLimitRemaining?: number;
    rateLimitReset?: number;
    request: Request;
}

// ─── Rate Limit Internal State ───────────────────────────────────────────────

const DEFAULT_RATE_LIMIT_CONFIG: Required<Omit<RateLimitConfig, 'onRateLimited'>> & Pick<RateLimitConfig, 'onRateLimited'> = {
    enabled: true,
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 60000,
    onRateLimited: undefined,
};

let globalRateLimitConfig: RateLimitConfig | null = null;

// ─── Rate Limit Helper Functions ─────────────────────────────────────────────

function parseRateLimitHeaders(response: Response): Pick<RateLimitInfo, 'retryAfter' | 'rateLimitLimit' | 'rateLimitRemaining' | 'rateLimitReset'> {
    const retryAfterHeader = response.headers.get('Retry-After');
    const rateLimitLimit = response.headers.get('X-RateLimit-Limit');
    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    const rateLimitReset = response.headers.get('X-RateLimit-Reset');

    let retryAfter: number | undefined;
    if (retryAfterHeader) {
        const parsed = parseInt(retryAfterHeader, 10);
        if (!isNaN(parsed)) {
            retryAfter = parsed;
        } else {
            // Try parsing as HTTP-date
            const date = Date.parse(retryAfterHeader);
            if (!isNaN(date)) {
                retryAfter = Math.max(0, Math.ceil((date - Date.now()) / 1000));
            }
        }
    }

    return {
        retryAfter,
        rateLimitLimit: rateLimitLimit ? parseInt(rateLimitLimit, 10) : undefined,
        rateLimitRemaining: rateLimitRemaining ? parseInt(rateLimitRemaining, 10) : undefined,
        rateLimitReset: rateLimitReset ? parseInt(rateLimitReset, 10) : undefined,
    };
}

function calculateBackoffDelay(
    attempt: number,
    baseDelay: number,
    maxDelay: number,
    retryAfter?: number
): number {
    if (retryAfter !== undefined) {
        return Math.min(retryAfter * 1000, maxDelay);
    }
    // Exponential backoff with jitter
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 0.1 * exponentialDelay;
    return Math.min(exponentialDelay + jitter, maxDelay);
}

export type SleepFunction = (ms: number) => Promise<void>;

export const defaultSleep: SleepFunction = (ms: number) =>
    new Promise(resolve => setTimeout(resolve, ms));

// ─── Rate Limit Fetch Wrapper ────────────────────────────────────────────────

export function createRateLimitFetch(
    originalFetch: typeof fetch,
    config: RateLimitConfig,
    sleepFn: SleepFunction = defaultSleep
): typeof fetch {
    const mergedConfig = { ...DEFAULT_RATE_LIMIT_CONFIG, ...config };

    return async function rateLimitFetch(
        input: RequestInfo | URL,
        init?: RequestInit
    ): Promise<Response> {
        let lastResponse: Response | undefined;

        // If input is already a Request, clone it to preserve for retries
        // Clone once at the start to create a "template" we can clone for each attempt
        const templateRequest = input instanceof Request ? input.clone() : new Request(input, init);

        for (let attempt = 1; attempt <= mergedConfig.maxRetries + 1; attempt++) {
            // Clone the template for each attempt
            const requestForAttempt = templateRequest.clone();
            const response = await originalFetch(requestForAttempt);

            if (response.status !== 429) {
                return response;
            }

            lastResponse = response;

            if (attempt > mergedConfig.maxRetries) {
                break;
            }

            const headerInfo = parseRateLimitHeaders(response);
            const delayMs = calculateBackoffDelay(
                attempt,
                mergedConfig.baseDelayMs,
                mergedConfig.maxDelayMs,
                headerInfo.retryAfter
            );

            if (mergedConfig.onRateLimited) {
                const info: RateLimitInfo = {
                    status: 429,
                    attempt,
                    delayMs,
                    ...headerInfo,
                    request: templateRequest.clone(),
                };
                mergedConfig.onRateLimited(info);
            }

            await sleepFn(delayMs);
        }

        return lastResponse!;
    };
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function enableRateLimiting(config: Partial<RateLimitConfig> = {}): void {
    globalRateLimitConfig = { ...DEFAULT_RATE_LIMIT_CONFIG, ...config, enabled: true };
    client.setConfig({
        fetch: createRateLimitFetch(globalThis.fetch, globalRateLimitConfig),
    });
}

export function disableRateLimiting(): void {
    globalRateLimitConfig = null;
    client.setConfig({
        fetch: globalThis.fetch,
    });
}

export function getRateLimitConfig(): Readonly<RateLimitConfig> | null {
    return globalRateLimitConfig ? { ...globalRateLimitConfig } : null;
}

export function createRateLimitedClient(config: Partial<RateLimitConfig> = {}): Client {
    const mergedConfig = { ...DEFAULT_RATE_LIMIT_CONFIG, ...config, enabled: true };
    return createClient(createConfig({
        baseUrl: 'https://api.short.io',
        fetch: createRateLimitFetch(globalThis.fetch, mergedConfig),
    }));
}

// ─── Client Configuration ────────────────────────────────────────────────────

client.setConfig({
    baseUrl: "https://api.short.io"
})

export const setApiKey = (apiKey: string) => {
    client.setConfig({
        headers: {
            authorization: apiKey
        }
    })
}

// ─── Encrypted Links ─────────────────────────────────────────────────────────

import type { Options } from "./generated/sdk.gen"
import type { CreateLinkData } from "./generated/types.gen"
import { createLink } from "./generated/sdk.gen"
import { webcrypto } from "node:crypto"

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    return Buffer.from(buffer).toString('base64');
}

async function encryptURL(originalURL: string): Promise<{ encryptedURL: string; key: string }> {
    const subtle = webcrypto.subtle;
    const cryptoKey = await subtle.generateKey({ name: "AES-GCM", length: 128 }, true, [
        "encrypt",
        "decrypt",
    ]);
    const iv = webcrypto.getRandomValues(new Uint8Array(12));
    const urlData = new TextEncoder().encode(originalURL);
    const encryptedUrl = await subtle.encrypt({ name: "AES-GCM", iv }, cryptoKey, urlData);
    const encryptedUrlBase64 = arrayBufferToBase64(encryptedUrl);
    const encryptedIvBase64 = arrayBufferToBase64(iv.buffer);
    const encryptedURL = `shortsecure://${encryptedUrlBase64}?${encryptedIvBase64}`;
    const exportedKey = await subtle.exportKey("raw", cryptoKey);
    const key = arrayBufferToBase64(exportedKey);
    return { encryptedURL, key };
}

export async function createEncryptedLink(
    options: Options<CreateLinkData, false> & { body: { originalURL: string } }
) {
    const { encryptedURL, key } = await encryptURL(options.body.originalURL);

    const result = await createLink({
        ...options,
        body: {
            ...options.body,
            originalURL: encryptedURL,
        },
    });

    if (result.data) {
        const data = result.data as Record<string, unknown>;
        if (typeof data.shortURL === 'string') {
            data.shortURL = `${data.shortURL}#${key}`;
        }
        if (typeof data.secureShortURL === 'string') {
            data.secureShortURL = `${data.secureShortURL}#${key}`;
        }
        return { ...result, data: { ...data, encryptionKey: key } };
    }

    return result;
}
