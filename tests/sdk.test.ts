import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
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
