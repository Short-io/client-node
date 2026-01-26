# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is `@short.io/client-node` — the official Short.io API client for Node.js, written in TypeScript. It provides 45+ typed functions for URL shortening, link management, QR codes, analytics, geographic targeting, and more.

**Almost all code is auto-generated.** Only two files are hand-written:
- `src/index.ts` — entry point, exports, and `setApiKey()` helper
- `openapi/config.ts` — OpenAPI code generation config with semantic operation ID mappings

Everything under `src/generated/` is produced by `@hey-api/openapi-ts` from the Short.io OpenAPI spec.

## Build & Development Commands

```bash
# Install dependencies (uses Yarn 1.x)
yarn install

# Regenerate SDK from OpenAPI spec (https://api.short.io/openapi.json)
npm run generate

# Compile TypeScript (tsc + tsc-alias for path resolution)
npm run compile
```

There are no tests in this repository. The SDK is validated through OpenAPI spec conformance.

## Architecture

```
src/
├── index.ts                    # Hand-written: exports + setApiKey()
└── generated/                  # All auto-generated
    ├── sdk.gen.ts              # 45+ API operation functions (createLink, listLinks, etc.)
    ├── types.gen.ts            # All TypeScript types (~3800 lines)
    ├── client.gen.ts           # Client singleton
    ├── client/                 # HTTP client implementation (fetch-based)
    └── core/                   # Auth, serializers, SSE, utilities
```

**Layered design:**
1. **Public API** (`src/index.ts`) — re-exports everything, provides `setApiKey()`
2. **SDK functions** (`sdk.gen.ts`) — each API operation is a typed function using a consistent generic pattern
3. **Client** (`client/`) — HTTP client factory with interceptors, config merging, URL building
4. **Core** (`core/`) — auth handling, body/query/path serialization, SSE support

**SDK function pattern** — every operation follows this signature:
```typescript
export const operationName = <ThrowOnError extends boolean = false>(
  options: Options<OperationData, ThrowOnError>
) => (options.client ?? client).httpMethod<Response, Error, ThrowOnError>({...})
```

## Key Development Notes

- **ESM-only** (`"type": "module"`) — no CommonJS support
- **Strict TypeScript** with `noUnusedLocals`, incremental compilation
- **Node.js 18.0.0+** required
- **Runtime dependency:** `@hey-api/client-fetch` only
- The `dist/` directory is gitignored; `npm run compile` produces it
- `openapi.json` is also gitignored — it's fetched during generation

## Modifying the SDK

To update API operations:
1. Edit operation ID mappings in `openapi/config.ts` (the `operationPatching` object maps HTTP endpoints to semantic function names like `'POST /links'` → `createLink`)
2. Run `npm run generate` to regenerate from the live OpenAPI spec
3. Run `npm run compile` to verify compilation

Do **not** manually edit files under `src/generated/` — they will be overwritten on next generation.
