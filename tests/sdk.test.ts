import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { createClient, createConfig } from '../src/generated/client';
import { createLink, getLink, deleteLink } from '../src/generated/sdk.gen';
import {
  zCreateLinkData,
  zGetLinkData,
  zListLinksData,
  zCreateLinkResponse,
} from '../src/generated/zod.gen';
import {
  createRateLimitFetch,
  createRateLimitedClient,
  enableRateLimiting,
  disableRateLimiting,
  getRateLimitConfig,
  type RateLimitInfo,
  type SleepFunction,
} from '../src/index';

const BASE_URL = 'https://api.short.io';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function makeClient() {
  return createClient(createConfig({ baseUrl: BASE_URL }));
}

// ── 1. API calls work (MSW-mocked) ─────────────────────────────────────

describe('API calls (MSW-mocked)', () => {
  it('createLink — POST /links', async () => {
    const mockResponse = {
      originalURL: 'https://example.com',
      path: 'abc123',
      shortURL: 'https://short.io/abc123',
      idString: 'lnk_abc_123',
    };

    server.use(
      http.post(`${BASE_URL}/links`, () => {
        return HttpResponse.json(mockResponse);
      }),
    );

    const result = await createLink({
      client: makeClient(),
      body: {
        originalURL: 'https://example.com',
        domain: 'short.io',
      },
    });

    expect(result.error).toBeUndefined();
    expect(result.data).toMatchObject(mockResponse);
  });

  it('getLink — GET /links/{linkId}', async () => {
    const mockResponse = {
      originalURL: 'https://example.com',
      path: 'abc123',
      idString: 'lnk_abc_123',
    };

    server.use(
      http.get(`${BASE_URL}/links/:linkId`, () => {
        return HttpResponse.json(mockResponse);
      }),
    );

    const result = await getLink({
      client: makeClient(),
      path: { linkId: 'lnk_abc_123' },
    });

    expect(result.error).toBeUndefined();
    expect(result.data).toMatchObject(mockResponse);
  });

  it('deleteLink — DELETE /links/{link_id}', async () => {
    const mockResponse = {
      success: true,
      idString: 'lnk_abc_123',
    };

    server.use(
      http.delete(`${BASE_URL}/links/:link_id`, () => {
        return HttpResponse.json(mockResponse);
      }),
    );

    const result = await deleteLink({
      client: makeClient(),
      path: { link_id: 'lnk_abc_123' },
    });

    expect(result.error).toBeUndefined();
    expect(result.data).toMatchObject(mockResponse);
  });
});

// ── 2. Error reporting ──────────────────────────────────────────────────

describe('Error reporting', () => {
  it('401 Unauthorized', async () => {
    server.use(
      http.post(`${BASE_URL}/links`, () => {
        return HttpResponse.json(
          { message: 'Unauthorized', statusCode: 401 },
          { status: 401 },
        );
      }),
    );

    const result = await createLink({
      client: makeClient(),
      body: {
        originalURL: 'https://example.com',
        domain: 'short.io',
      },
    });

    expect(result.data).toBeUndefined();
    expect(result.error).toMatchObject({
      message: 'Unauthorized',
      statusCode: 401,
    });
  });

  it('404 Not Found', async () => {
    server.use(
      http.get(`${BASE_URL}/links/:linkId`, () => {
        return HttpResponse.json(
          { error: 'Link not found' },
          { status: 404 },
        );
      }),
    );

    const result = await getLink({
      client: makeClient(),
      path: { linkId: 'lnk_nonexistent_123' },
    });

    expect(result.data).toBeUndefined();
    expect(result.error).toMatchObject({
      error: 'Link not found',
    });
  });

  it('throwOnError mode throws on 401', async () => {
    server.use(
      http.post(`${BASE_URL}/links`, () => {
        return HttpResponse.json(
          { message: 'Unauthorized', statusCode: 401 },
          { status: 401 },
        );
      }),
    );

    await expect(
      createLink({
        client: makeClient(),
        throwOnError: true,
        body: {
          originalURL: 'https://example.com',
          domain: 'short.io',
        },
      }),
    ).rejects.toThrow();
  });
});

// ── 3. Zod validation ───────────────────────────────────────────────────

describe('Zod validation', () => {
  it('valid createLink data passes', () => {
    const result = zCreateLinkData.safeParse({
      body: {
        originalURL: 'https://example.com',
        domain: 'short.io',
      },
    });
    expect(result.success).toBe(true);
  });

  it('invalid createLink data fails (missing domain)', () => {
    const result = zCreateLinkData.safeParse({
      body: {
        originalURL: 'https://example.com',
      },
    });
    expect(result.success).toBe(false);
  });

  it('getLink data with invalid linkId fails regex', () => {
    const result = zGetLinkData.safeParse({
      path: { linkId: 'invalid-format' },
    });
    expect(result.success).toBe(false);
  });

  it('listLinks data with domain_id: 0 fails (must be >= 1)', () => {
    const result = zListLinksData.safeParse({
      query: { domain_id: 0 },
    });
    expect(result.success).toBe(false);
  });

  it('valid createLink response passes', () => {
    const result = zCreateLinkResponse.safeParse({
      originalURL: 'https://example.com',
      path: 'abc123',
      idString: 'lnk_abc_123',
      id: '12345',
      shortURL: 'https://short.io/abc123',
      secureShortURL: 'https://short.io/abc123',
    });
    expect(result.success).toBe(true);
  });
});

// ── 4. Rate limiting ─────────────────────────────────────────────────────────

describe('Rate limiting', () => {
  const mockSleep: SleepFunction = vi.fn(() => Promise.resolve());

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retries on 429 with exponential backoff', async () => {
    let callCount = 0;
    server.use(
      http.post(`${BASE_URL}/links`, () => {
        callCount++;
        if (callCount < 3) {
          return HttpResponse.json(
            { error: 'Too Many Requests' },
            { status: 429 },
          );
        }
        return HttpResponse.json({
          originalURL: 'https://example.com',
          path: 'abc123',
          shortURL: 'https://short.io/abc123',
          idString: 'lnk_abc_123',
        });
      }),
    );

    const rateLimitedFetch = createRateLimitFetch(globalThis.fetch, { maxRetries: 3 }, mockSleep);
    const client = createClient(createConfig({
      baseUrl: BASE_URL,
      fetch: rateLimitedFetch,
    }));

    const result = await createLink({
      client,
      body: {
        originalURL: 'https://example.com',
        domain: 'short.io',
      },
    });

    expect(callCount).toBe(3);
    expect(result.error).toBeUndefined();
    expect(result.data).toMatchObject({ path: 'abc123' });
    expect(mockSleep).toHaveBeenCalledTimes(2);
  });

  it('respects Retry-After header (seconds format)', async () => {
    let callCount = 0;
    server.use(
      http.post(`${BASE_URL}/links`, () => {
        callCount++;
        if (callCount === 1) {
          return HttpResponse.json(
            { error: 'Too Many Requests' },
            {
              status: 429,
              headers: { 'Retry-After': '5' },
            },
          );
        }
        return HttpResponse.json({
          originalURL: 'https://example.com',
          path: 'abc123',
          shortURL: 'https://short.io/abc123',
          idString: 'lnk_abc_123',
        });
      }),
    );

    const rateLimitedFetch = createRateLimitFetch(globalThis.fetch, { maxRetries: 3 }, mockSleep);
    const client = createClient(createConfig({
      baseUrl: BASE_URL,
      fetch: rateLimitedFetch,
    }));

    await createLink({
      client,
      body: {
        originalURL: 'https://example.com',
        domain: 'short.io',
      },
    });

    expect(mockSleep).toHaveBeenCalledWith(5000); // 5 seconds in ms
  });

  it('respects Retry-After header (HTTP-date format)', async () => {
    const futureDate = new Date(Date.now() + 3000); // 3 seconds from now
    let callCount = 0;
    server.use(
      http.post(`${BASE_URL}/links`, () => {
        callCount++;
        if (callCount === 1) {
          return HttpResponse.json(
            { error: 'Too Many Requests' },
            {
              status: 429,
              headers: { 'Retry-After': futureDate.toUTCString() },
            },
          );
        }
        return HttpResponse.json({
          originalURL: 'https://example.com',
          path: 'abc123',
          shortURL: 'https://short.io/abc123',
          idString: 'lnk_abc_123',
        });
      }),
    );

    const rateLimitedFetch = createRateLimitFetch(globalThis.fetch, { maxRetries: 3 }, mockSleep);
    const client = createClient(createConfig({
      baseUrl: BASE_URL,
      fetch: rateLimitedFetch,
    }));

    await createLink({
      client,
      body: {
        originalURL: 'https://example.com',
        domain: 'short.io',
      },
    });

    // Should be approximately 3000ms (allow some tolerance)
    const delayArg = (mockSleep as ReturnType<typeof vi.fn>).mock.calls[0][0] as number;
    expect(delayArg).toBeGreaterThanOrEqual(2000);
    expect(delayArg).toBeLessThanOrEqual(4000);
  });

  it('fails after max retries exceeded (returns 429 response)', async () => {
    server.use(
      http.post(`${BASE_URL}/links`, () => {
        return HttpResponse.json(
          { error: 'Too Many Requests' },
          { status: 429 },
        );
      }),
    );

    const rateLimitedFetch = createRateLimitFetch(globalThis.fetch, { maxRetries: 2 }, mockSleep);
    const client = createClient(createConfig({
      baseUrl: BASE_URL,
      fetch: rateLimitedFetch,
    }));

    const result = await createLink({
      client,
      body: {
        originalURL: 'https://example.com',
        domain: 'short.io',
      },
    });

    expect(result.error).toMatchObject({ error: 'Too Many Requests' });
    expect(mockSleep).toHaveBeenCalledTimes(2);
  });

  it('calls onRateLimited callback with correct info', async () => {
    const onRateLimited = vi.fn();
    let callCount = 0;
    server.use(
      http.post(`${BASE_URL}/links`, () => {
        callCount++;
        if (callCount === 1) {
          return HttpResponse.json(
            { error: 'Too Many Requests' },
            {
              status: 429,
              headers: {
                'Retry-After': '10',
                'X-RateLimit-Limit': '100',
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': '1700000000',
              },
            },
          );
        }
        return HttpResponse.json({
          originalURL: 'https://example.com',
          path: 'abc123',
          shortURL: 'https://short.io/abc123',
          idString: 'lnk_abc_123',
        });
      }),
    );

    const rateLimitedFetch = createRateLimitFetch(
      globalThis.fetch,
      { maxRetries: 3, onRateLimited },
      mockSleep
    );
    const client = createClient(createConfig({
      baseUrl: BASE_URL,
      fetch: rateLimitedFetch,
    }));

    await createLink({
      client,
      body: {
        originalURL: 'https://example.com',
        domain: 'short.io',
      },
    });

    expect(onRateLimited).toHaveBeenCalledTimes(1);
    const info: RateLimitInfo = onRateLimited.mock.calls[0][0];
    expect(info.status).toBe(429);
    expect(info.attempt).toBe(1);
    expect(info.retryAfter).toBe(10);
    expect(info.rateLimitLimit).toBe(100);
    expect(info.rateLimitRemaining).toBe(0);
    expect(info.rateLimitReset).toBe(1700000000);
    expect(info.request).toBeInstanceOf(Request);
  });

  it('parses all rate limit headers correctly', async () => {
    const onRateLimited = vi.fn();
    let callCount = 0;
    server.use(
      http.get(`${BASE_URL}/links/:linkId`, () => {
        callCount++;
        if (callCount === 1) {
          return HttpResponse.json(
            { error: 'Rate limited' },
            {
              status: 429,
              headers: {
                'Retry-After': '30',
                'X-RateLimit-Limit': '1000',
                'X-RateLimit-Remaining': '5',
                'X-RateLimit-Reset': '1699999999',
              },
            },
          );
        }
        return HttpResponse.json({
          originalURL: 'https://example.com',
          path: 'abc123',
          idString: 'lnk_abc_123',
        });
      }),
    );

    const rateLimitedFetch = createRateLimitFetch(
      globalThis.fetch,
      { maxRetries: 2, onRateLimited },
      mockSleep
    );
    const client = createClient(createConfig({
      baseUrl: BASE_URL,
      fetch: rateLimitedFetch,
    }));

    await getLink({
      client,
      path: { linkId: 'lnk_abc_123' },
    });

    expect(onRateLimited).toHaveBeenCalledTimes(1);
    const info: RateLimitInfo = onRateLimited.mock.calls[0][0];
    expect(info.retryAfter).toBe(30);
    expect(info.rateLimitLimit).toBe(1000);
    expect(info.rateLimitRemaining).toBe(5);
    expect(info.rateLimitReset).toBe(1699999999);
  });

  it('works with createRateLimitedClient factory', async () => {
    let callCount = 0;
    server.use(
      http.post(`${BASE_URL}/links`, () => {
        callCount++;
        if (callCount === 1) {
          return HttpResponse.json(
            { error: 'Too Many Requests' },
            { status: 429 },
          );
        }
        return HttpResponse.json({
          originalURL: 'https://example.com',
          path: 'factory123',
          shortURL: 'https://short.io/factory123',
          idString: 'lnk_factory_123',
        });
      }),
    );

    // Note: createRateLimitedClient uses the real sleep, so we test differently
    // For this test, we're just verifying the factory creates a working client
    // We'll use a very small maxDelay to avoid long test times
    const client = createRateLimitedClient({ maxRetries: 1, baseDelayMs: 1, maxDelayMs: 1 });

    const result = await createLink({
      client,
      body: {
        originalURL: 'https://example.com',
        domain: 'short.io',
      },
    });

    expect(callCount).toBe(2);
    expect(result.data).toMatchObject({ path: 'factory123' });
  });

  it('enableRateLimiting and disableRateLimiting update global config', () => {
    expect(getRateLimitConfig()).toBeNull();

    enableRateLimiting({ maxRetries: 5 });
    const config = getRateLimitConfig();
    expect(config).not.toBeNull();
    expect(config?.maxRetries).toBe(5);
    expect(config?.enabled).toBe(true);

    disableRateLimiting();
    expect(getRateLimitConfig()).toBeNull();
  });

  it('does not retry non-429 errors', async () => {
    let callCount = 0;
    server.use(
      http.post(`${BASE_URL}/links`, () => {
        callCount++;
        return HttpResponse.json(
          { error: 'Server Error' },
          { status: 500 },
        );
      }),
    );

    const rateLimitedFetch = createRateLimitFetch(globalThis.fetch, { maxRetries: 3 }, mockSleep);
    const client = createClient(createConfig({
      baseUrl: BASE_URL,
      fetch: rateLimitedFetch,
    }));

    const result = await createLink({
      client,
      body: {
        originalURL: 'https://example.com',
        domain: 'short.io',
      },
    });

    expect(callCount).toBe(1);
    expect(result.error).toMatchObject({ error: 'Server Error' });
    expect(mockSleep).not.toHaveBeenCalled();
  });

  it('respects maxDelayMs cap', async () => {
    let callCount = 0;
    server.use(
      http.post(`${BASE_URL}/links`, () => {
        callCount++;
        if (callCount === 1) {
          return HttpResponse.json(
            { error: 'Too Many Requests' },
            {
              status: 429,
              headers: { 'Retry-After': '3600' }, // 1 hour
            },
          );
        }
        return HttpResponse.json({
          originalURL: 'https://example.com',
          path: 'abc123',
          shortURL: 'https://short.io/abc123',
          idString: 'lnk_abc_123',
        });
      }),
    );

    const rateLimitedFetch = createRateLimitFetch(
      globalThis.fetch,
      { maxRetries: 3, maxDelayMs: 5000 },
      mockSleep
    );
    const client = createClient(createConfig({
      baseUrl: BASE_URL,
      fetch: rateLimitedFetch,
    }));

    await createLink({
      client,
      body: {
        originalURL: 'https://example.com',
        domain: 'short.io',
      },
    });

    expect(mockSleep).toHaveBeenCalledWith(5000); // Capped at maxDelayMs
  });
});
