# Short.io Node.js SDK

Official Node.js SDK for the [Short.io](https://short.io) URL shortening and link management API.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage Examples](#usage-examples)
  - [Link Management](#link-management)
  - [Domain Management](#domain-management)
  - [Bulk Operations](#bulk-operations)
  - [QR Codes](#qr-codes)
  - [Geographic Targeting](#geographic-targeting)
  - [Folders](#folders)
  - [OpenGraph](#opengraph)
  - [Permissions](#permissions)
- [API Reference](#api-reference)
- [Advanced Configuration](#advanced-configuration)
- [TypeScript Support](#typescript-support)
- [Rate Limits](#rate-limits)
- [Error Handling](#error-handling)
- [Support](#support)
- [License](#license)

## Features

- **Link Management** - Create, update, delete, duplicate, and archive short links
- **Domain Management** - Handle custom domains and their settings
- **QR Code Generation** - Generate QR codes for single links or in bulk
- **Bulk Operations** - Create, delete, or archive up to 1000 links at once
- **Geographic Targeting** - Set country and region-specific redirects
- **Link Analytics** - Get detailed link statistics and expand information
- **Folder Organization** - Organize links into folders
- **OpenGraph Control** - Customize link preview metadata
- **Permissions Management** - Control user access to links
- **Full TypeScript Support** - Comprehensive type definitions included
- **Modern ESM** - Built with ES modules

## Requirements

- Node.js 18.0.0 or higher
- npm or yarn package manager

## Installation

```bash
npm install @short.io/client-node
```

Or with yarn:

```bash
yarn add @short.io/client-node
```

## Quick Start

### 1. Get Your API Key

Get your API key from the Short.io dashboard: [Integrations & API](https://app.short.io/settings/integrations/api-key)

### 2. Initialize the SDK

```javascript
import { setApiKey } from "@short.io/client-node";

setApiKey("YOUR_API_KEY");
```

Or using environment variables:

```bash
export SHORT_IO_API_KEY="your-api-key"
```

```javascript
import { setApiKey } from "@short.io/client-node";

setApiKey(process.env.SHORT_IO_API_KEY);
```

### 3. Create Your First Short Link

```javascript
import { createLink } from "@short.io/client-node";

const result = await createLink({
  body: {
    originalURL: "https://example.com/very-long-url",
    domain: "your-domain.com",
    path: "custom-path", // Optional
    title: "My Link"     // Optional
  }
});

console.log("Short URL:", result.data.shortURL);
console.log("Link ID:", result.data.idString);
```

## Usage Examples

### Link Management

#### Create a Link

```javascript
import { createLink } from "@short.io/client-node";

const result = await createLink({
  body: {
    originalURL: "https://example.com",
    domain: "your-domain.com",
    path: "my-link",           // Optional: custom path
    title: "Example Link",     // Optional: link title
    tags: ["marketing"],       // Optional: tags for organization
    expiresAt: "2025-12-31",   // Optional: expiration date
    password: "secret123"      // Optional: password protection
  }
});
```

#### Get Link Information

```javascript
import { getLink, expandLink } from "@short.io/client-node";

// Get link by ID
const linkInfo = await getLink({
  path: { linkId: "your-link-id" }
});

console.log("Original URL:", linkInfo.data.originalURL);
console.log("Clicks:", linkInfo.data.clicks);

// Get link by domain and path
const expanded = await expandLink({
  query: {
    domain: "your-domain.com",
    path: "my-link"
  }
});
```

#### Update a Link

```javascript
import { updateLink } from "@short.io/client-node";

const updated = await updateLink({
  path: { linkId: "your-link-id" },
  body: {
    originalURL: "https://new-destination.com",
    title: "Updated Title"
  }
});
```

#### Delete a Link

```javascript
import { deleteLink } from "@short.io/client-node";

await deleteLink({
  path: { link_id: "your-link-id" }
});
```

#### Duplicate a Link

```javascript
import { duplicateLink } from "@short.io/client-node";

const duplicate = await duplicateLink({
  path: { linkId: "your-link-id" },
  body: {
    path: "new-custom-path" // Optional: specify new path
  }
});
```

#### Archive/Unarchive Links

```javascript
import { archiveLink, unarchiveLink } from "@short.io/client-node";

// Archive a link
await archiveLink({
  body: { link_id: "your-link-id" }
});

// Unarchive a link
await unarchiveLink({
  body: { link_id: "your-link-id" }
});
```

#### List Links

```javascript
import { listLinks } from "@short.io/client-node";

const links = await listLinks({
  query: {
    domain_id: "your-domain-id",
    limit: 50,
    offset: 0
  }
});

console.log("Total links:", links.data.length);
```

### Domain Management

```javascript
import {
  listDomains,
  getDomain,
  createDomain,
  updateDomainSettings
} from "@short.io/client-node";

// List all domains
const domains = await listDomains();
console.log("Domains:", domains.data);

// Get specific domain
const domain = await getDomain({
  path: { domainId: "your-domain-id" }
});

// Create a new domain
const newDomain = await createDomain({
  body: {
    hostname: "links.example.com"
  }
});

// Update domain settings
await updateDomainSettings({
  path: { domainId: "your-domain-id" },
  body: {
    hideReferer: true,
    cloaking: false
  }
});
```

### Bulk Operations

#### Create Multiple Links

```javascript
import { createLinksBulk } from "@short.io/client-node";

// Create up to 1000 links at once
const bulkResult = await createLinksBulk({
  body: [
    { originalURL: "https://example1.com", domain: "your-domain.com" },
    { originalURL: "https://example2.com", domain: "your-domain.com", path: "custom" },
    { originalURL: "https://example3.com", domain: "your-domain.com", title: "Third Link" }
  ]
});

// Results array contains link objects or error objects
bulkResult.data.forEach((item, index) => {
  if (item.shortURL) {
    console.log(`Link ${index}: ${item.shortURL}`);
  } else {
    console.log(`Link ${index} failed:`, item.error);
  }
});
```

#### Delete Multiple Links

```javascript
import { deleteLinksBulk } from "@short.io/client-node";

await deleteLinksBulk({
  body: {
    links: ["link-id-1", "link-id-2", "link-id-3"]
  }
});
```

#### Archive Multiple Links

```javascript
import { archiveLinksBulk, unarchiveLinksBulk } from "@short.io/client-node";

// Archive multiple links
await archiveLinksBulk({
  body: { links: ["link-id-1", "link-id-2"] }
});

// Unarchive multiple links
await unarchiveLinksBulk({
  body: { links: ["link-id-1", "link-id-2"] }
});
```

#### Bulk Tagging

```javascript
import { addTagsBulk } from "@short.io/client-node";

await addTagsBulk({
  body: {
    links: ["link-id-1", "link-id-2"],
    tag: "marketing-campaign"
  }
});
```

### QR Codes

```javascript
import { generateQrCode, generateQrCodesBulk } from "@short.io/client-node";

// Generate QR code for a single link
const qrCode = await generateQrCode({
  path: { linkIdString: "your-link-id" },
  body: {
    size: 300,
    format: "png"  // or "svg"
  }
});

// Bulk QR code generation (rate limited: 1 request per minute)
const bulkQr = await generateQrCodesBulk({
  body: {
    links: ["link-id-1", "link-id-2"],
    size: 200,
    format: "svg"
  }
});
```

### Geographic Targeting

#### Country Targeting

```javascript
import {
  createLinkCountry,
  getLinkCountries,
  deleteLinkCountry,
  createLinkCountriesBulk
} from "@short.io/client-node";

// Set country-specific redirect
await createLinkCountry({
  path: { linkId: "your-link-id" },
  body: {
    country: "US",
    url: "https://us-specific-page.com"
  }
});

// Get all country redirects for a link
const countries = await getLinkCountries({
  path: { linkId: "your-link-id" }
});

// Remove country targeting
await deleteLinkCountry({
  path: {
    linkId: "your-link-id",
    country: "US"
  }
});

// Bulk country targeting
await createLinkCountriesBulk({
  path: { linkId: "your-link-id" },
  body: [
    { country: "US", url: "https://us.example.com" },
    { country: "UK", url: "https://uk.example.com" },
    { country: "DE", url: "https://de.example.com" }
  ]
});
```

#### Region Targeting

```javascript
import {
  createLinkRegion,
  getLinkRegions,
  getRegionsByCountry,
  createLinkRegionsBulk
} from "@short.io/client-node";

// Get available regions for a country
const regions = await getRegionsByCountry({
  path: { country: "US" }
});

// Set region-specific redirect
await createLinkRegion({
  path: { linkId: "your-link-id" },
  body: {
    country: "US",
    region: "CA",  // California
    url: "https://california.example.com"
  }
});

// Get all region redirects for a link
const linkRegions = await getLinkRegions({
  path: { linkId: "your-link-id" }
});

// Bulk region targeting
await createLinkRegionsBulk({
  path: { linkId: "your-link-id" },
  body: [
    { country: "US", region: "CA", url: "https://ca.example.com" },
    { country: "US", region: "NY", url: "https://ny.example.com" }
  ]
});
```

### Folders

```javascript
import {
  listFolders,
  getFolder,
  createFolder
} from "@short.io/client-node";

// List all folders for a domain
const folders = await listFolders({
  path: { domainId: "your-domain-id" }
});

// Get specific folder
const folder = await getFolder({
  path: {
    domainId: "your-domain-id",
    folderId: "your-folder-id"
  }
});

// Create a new folder
const newFolder = await createFolder({
  body: {
    domainId: "your-domain-id",
    name: "Marketing Links"
  }
});
```

### OpenGraph

```javascript
import {
  getLinkOpengraph,
  updateLinkOpengraph
} from "@short.io/client-node";

// Get OpenGraph properties
const og = await getLinkOpengraph({
  path: {
    domainId: "your-domain-id",
    linkId: "your-link-id"
  }
});

// Set OpenGraph properties
await updateLinkOpengraph({
  path: {
    domainId: "your-domain-id",
    linkId: "your-link-id"
  },
  body: {
    title: "Custom Title",
    description: "Custom description for social sharing",
    image: "https://example.com/image.png"
  }
});
```

### Permissions

```javascript
import {
  getLinkPermissions,
  addLinkPermission,
  deleteLinkPermission
} from "@short.io/client-node";

// Get link permissions
const permissions = await getLinkPermissions({
  path: {
    domainId: "your-domain-id",
    linkId: "your-link-id"
  }
});

// Add user permission
await addLinkPermission({
  path: {
    domainId: "your-domain-id",
    linkId: "your-link-id",
    userId: "user-id"
  },
  body: {
    permission: "read"  // or "write"
  }
});

// Remove user permission
await deleteLinkPermission({
  path: {
    domainId: "your-domain-id",
    linkId: "your-link-id",
    userId: "user-id"
  }
});
```

## API Reference

### Link Operations

| Function | Description | Rate Limit |
|----------|-------------|------------|
| `createLink` | Create a new short link | 50/s |
| `listLinks` | List all links for a domain | - |
| `getLink` | Get link info by ID | 20/s |
| `updateLink` | Update an existing link | 20/s |
| `deleteLink` | Delete a link | 20/s |
| `expandLink` | Get link info by domain and path | 20/s |
| `getLinkByOriginalUrl` | Get link by original URL (deprecated) | 20/s |
| `getLinksByUrl` | Get all links with same original URL | - |
| `duplicateLink` | Duplicate an existing link | 50/s |
| `archiveLink` | Archive a link | - |
| `unarchiveLink` | Unarchive a link | - |
| `createLinkPublic` | Create link using public API key | 50/s |
| `createLinkSimple` | Create link (GET method) | 50/s |
| `createExampleLinks` | Generate example links | 5/10s |

### Bulk Operations

| Function | Description | Rate Limit |
|----------|-------------|------------|
| `createLinksBulk` | Create up to 1000 links | 5/10s |
| `deleteLinksBulk` | Delete multiple links | 1/s |
| `archiveLinksBulk` | Archive multiple links | - |
| `unarchiveLinksBulk` | Unarchive multiple links | - |
| `addTagsBulk` | Add tag to multiple links | - |

### Domain Operations

| Function | Description |
|----------|-------------|
| `listDomains` | List all domains |
| `getDomain` | Get domain details |
| `createDomain` | Create a new domain |
| `updateDomainSettings` | Update domain settings |

### QR Code Operations

| Function | Description | Rate Limit |
|----------|-------------|------------|
| `generateQrCode` | Generate QR code for a link | - |
| `generateQrCodesBulk` | Generate QR codes in bulk | 1/min |

### Geographic Targeting

| Function | Description |
|----------|-------------|
| `getLinkCountries` | Get country redirects |
| `createLinkCountry` | Set country redirect |
| `createLinkCountriesBulk` | Set multiple country redirects |
| `deleteLinkCountry` | Remove country redirect |
| `getLinkRegions` | Get region redirects |
| `createLinkRegion` | Set region redirect |
| `createLinkRegionsBulk` | Set multiple region redirects |
| `deleteLinkRegion` | Remove region redirect |
| `getRegionsByCountry` | List available regions |

### Folder Operations

| Function | Description |
|----------|-------------|
| `listFolders` | List folders for a domain |
| `getFolder` | Get folder details |
| `createFolder` | Create a new folder |

### OpenGraph Operations

| Function | Description |
|----------|-------------|
| `getLinkOpengraph` | Get OpenGraph properties |
| `updateLinkOpengraph` | Set OpenGraph properties |

### Permission Operations

| Function | Description |
|----------|-------------|
| `getLinkPermissions` | Get link permissions |
| `addLinkPermission` | Add user permission |
| `deleteLinkPermission` | Remove user permission |

## Advanced Configuration

### Custom Client Configuration

```javascript
import { client } from "@short.io/client-node";

client.setConfig({
  baseUrl: "https://api.short.io",
  headers: {
    "User-Agent": "MyApp/1.0.0",
    "authorization": "your-api-key"
  }
});
```

### Using a Custom Client Instance

```javascript
import { createClient } from "@short.io/client-node";
import { createLink } from "@short.io/client-node";

const customClient = createClient({
  baseUrl: "https://api.short.io",
  headers: {
    authorization: "your-api-key"
  }
});

const result = await createLink({
  client: customClient,
  body: {
    originalURL: "https://example.com",
    domain: "your-domain.com"
  }
});
```

## TypeScript Support

The SDK provides comprehensive TypeScript definitions for all operations:

```typescript
import {
  CreateLinkData,
  CreateLinkResponse,
  ListLinksResponse,
  type Options
} from "@short.io/client-node";

// Typed request
const linkData: CreateLinkData = {
  body: {
    originalURL: "https://example.com",
    domain: "your-domain.com",
    path: "typed-link"
  }
};

// Typed response
const result: CreateLinkResponse = await createLink(linkData);

if (result.data) {
  console.log(result.data.shortURL);  // TypeScript knows this is a string
  console.log(result.data.idString);  // TypeScript knows all available properties
}
```

### Response Types

All functions return a response object with the following structure:

```typescript
interface Response<T> {
  data?: T;           // Response data on success
  error?: unknown;    // Error details on failure
  response: Response; // Raw fetch Response object
}
```

## Rate Limits

| Endpoint Category | Rate Limit |
|-------------------|------------|
| Link Creation | 50 requests/second |
| Link Updates/Deletes | 20 requests/second |
| Link Info | 20 requests/second |
| Bulk Operations | 5 requests per 10 seconds |
| Bulk Delete | 1 request/second |
| QR Bulk Generation | 1 request/minute |
| Public API | 50 requests/second |

## Error Handling

```javascript
import { createLink } from "@short.io/client-node";

const result = await createLink({
  body: {
    originalURL: "https://example.com",
    domain: "your-domain.com"
  }
});

if (result.error) {
  // Handle specific error codes
  switch (result.response.status) {
    case 400:
      console.error("Bad request - check your parameters");
      break;
    case 401:
      console.error("Unauthorized - check your API key");
      break;
    case 403:
      console.error("Forbidden - insufficient permissions");
      break;
    case 404:
      console.error("Not found - resource doesn't exist");
      break;
    case 409:
      console.error("Conflict - link with this path already exists");
      break;
    case 429:
      console.error("Rate limit exceeded - slow down requests");
      break;
    default:
      console.error("Unexpected error:", result.error);
  }
} else {
  console.log("Success:", result.data.shortURL);
}
```

### Using ThrowOnError

```typescript
import { createLink } from "@short.io/client-node";

try {
  const result = await createLink({
    throwOnError: true,
    body: {
      originalURL: "https://example.com",
      domain: "your-domain.com"
    }
  });

  console.log("Success:", result.data.shortURL);
} catch (error) {
  console.error("Request failed:", error);
}
```

## Support

- **API Documentation**: [https://developers.short.io](https://developers.short.io)
- **API Reference**: [https://developers.short.io/reference](https://developers.short.io/reference)
- **Issues**: [https://github.com/Short-io/client-node/issues](https://github.com/Short-io/client-node/issues)
- **Dashboard**: [https://app.short.io](https://app.short.io)

## License

FSL (Functional Source License)
