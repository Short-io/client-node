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
import { createLink, postLinks } from "@short.io/client-node";

// Using the convenience function
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

// postLinks is the same function (createLink is an alias)
```

#### Get Link Information

```javascript
import { getLinksByLinkId, getLinksExpand } from "@short.io/client-node";

// Get link by ID
const linkInfo = await getLinksByLinkId({
  path: { linkId: "your-link-id" }
});

console.log("Original URL:", linkInfo.data.originalURL);
console.log("Clicks:", linkInfo.data.clicks);

// Get link by domain and path
const expanded = await getLinksExpand({
  query: {
    domain: "your-domain.com",
    path: "my-link"
  }
});
```

#### Update a Link

```javascript
import { postLinksByLinkId } from "@short.io/client-node";

const updated = await postLinksByLinkId({
  path: { linkId: "your-link-id" },
  body: {
    originalURL: "https://new-destination.com",
    title: "Updated Title"
  }
});
```

#### Delete a Link

```javascript
import { deleteLinksByLinkId } from "@short.io/client-node";

await deleteLinksByLinkId({
  path: { link_id: "your-link-id" }
});
```

#### Duplicate a Link

```javascript
import { postLinksDuplicateByLinkId } from "@short.io/client-node";

const duplicate = await postLinksDuplicateByLinkId({
  path: { linkId: "your-link-id" },
  body: {
    path: "new-custom-path" // Optional: specify new path
  }
});
```

#### Archive/Unarchive Links

```javascript
import { postLinksArchive, postLinksUnarchive } from "@short.io/client-node";

// Archive a link
await postLinksArchive({
  body: { link_id: "your-link-id" }
});

// Unarchive a link
await postLinksUnarchive({
  body: { link_id: "your-link-id" }
});
```

#### List Links

```javascript
import { getApiLinks } from "@short.io/client-node";

const links = await getApiLinks({
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
  getApiDomains,
  getDomainsByDomainId,
  postDomains,
  postDomainsSettingsByDomainId
} from "@short.io/client-node";

// List all domains
const domains = await getApiDomains();
console.log("Domains:", domains.data);

// Get specific domain
const domain = await getDomainsByDomainId({
  path: { domainId: "your-domain-id" }
});

// Create a new domain
const newDomain = await postDomains({
  body: {
    hostname: "links.example.com"
  }
});

// Update domain settings
await postDomainsSettingsByDomainId({
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
import { postLinksBulk } from "@short.io/client-node";

// Create up to 1000 links at once
const bulkResult = await postLinksBulk({
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
import { deleteLinksDeleteBulk } from "@short.io/client-node";

await deleteLinksDeleteBulk({
  body: {
    links: ["link-id-1", "link-id-2", "link-id-3"]
  }
});
```

#### Archive Multiple Links

```javascript
import { postLinksArchiveBulk, postLinksUnarchiveBulk } from "@short.io/client-node";

// Archive multiple links
await postLinksArchiveBulk({
  body: { links: ["link-id-1", "link-id-2"] }
});

// Unarchive multiple links
await postLinksUnarchiveBulk({
  body: { links: ["link-id-1", "link-id-2"] }
});
```

#### Bulk Tagging

```javascript
import { postTagsBulk } from "@short.io/client-node";

await postTagsBulk({
  body: {
    links: ["link-id-1", "link-id-2"],
    tag: "marketing-campaign"
  }
});
```

### QR Codes

```javascript
import { postLinksQrByLinkIdString, postLinksQrBulk } from "@short.io/client-node";

// Generate QR code for a single link
const qrCode = await postLinksQrByLinkIdString({
  path: { linkIdString: "your-link-id" },
  body: {
    size: 300,
    format: "png"  // or "svg"
  }
});

// Bulk QR code generation (rate limited: 1 request per minute)
const bulkQr = await postLinksQrBulk({
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
  postLinkCountryByLinkId,
  getLinkCountryByLinkId,
  deleteLinkCountryByLinkIdByCountry,
  postLinkCountryBulkByLinkId
} from "@short.io/client-node";

// Set country-specific redirect
await postLinkCountryByLinkId({
  path: { linkId: "your-link-id" },
  body: {
    country: "US",
    url: "https://us-specific-page.com"
  }
});

// Get all country redirects for a link
const countries = await getLinkCountryByLinkId({
  path: { linkId: "your-link-id" }
});

// Remove country targeting
await deleteLinkCountryByLinkIdByCountry({
  path: {
    linkId: "your-link-id",
    country: "US"
  }
});

// Bulk country targeting
await postLinkCountryBulkByLinkId({
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
  postLinkRegionByLinkId,
  getLinkRegionByLinkId,
  getLinkRegionListByCountry,
  postLinkRegionBulkByLinkId
} from "@short.io/client-node";

// Get available regions for a country
const regions = await getLinkRegionListByCountry({
  path: { country: "US" }
});

// Set region-specific redirect
await postLinkRegionByLinkId({
  path: { linkId: "your-link-id" },
  body: {
    country: "US",
    region: "CA",  // California
    url: "https://california.example.com"
  }
});

// Get all region redirects for a link
const linkRegions = await getLinkRegionByLinkId({
  path: { linkId: "your-link-id" }
});

// Bulk region targeting
await postLinkRegionBulkByLinkId({
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
  getLinksFoldersByDomainId,
  getLinksFoldersByDomainIdByFolderId,
  postLinksFolders
} from "@short.io/client-node";

// List all folders for a domain
const folders = await getLinksFoldersByDomainId({
  path: { domainId: "your-domain-id" }
});

// Get specific folder
const folder = await getLinksFoldersByDomainIdByFolderId({
  path: {
    domainId: "your-domain-id",
    folderId: "your-folder-id"
  }
});

// Create a new folder
const newFolder = await postLinksFolders({
  body: {
    domainId: "your-domain-id",
    name: "Marketing Links"
  }
});
```

### OpenGraph

```javascript
import {
  getLinksOpengraphByDomainIdByLinkId,
  putLinksOpengraphByDomainIdByLinkId
} from "@short.io/client-node";

// Get OpenGraph properties
const og = await getLinksOpengraphByDomainIdByLinkId({
  path: {
    domainId: "your-domain-id",
    linkId: "your-link-id"
  }
});

// Set OpenGraph properties
await putLinksOpengraphByDomainIdByLinkId({
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
  getLinksPermissionsByDomainIdByLinkId,
  postLinksPermissionsByDomainIdByLinkIdByUserId,
  deleteLinksPermissionsByDomainIdByLinkIdByUserId
} from "@short.io/client-node";

// Get link permissions
const permissions = await getLinksPermissionsByDomainIdByLinkId({
  path: {
    domainId: "your-domain-id",
    linkId: "your-link-id"
  }
});

// Add user permission
await postLinksPermissionsByDomainIdByLinkIdByUserId({
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
await deleteLinksPermissionsByDomainIdByLinkIdByUserId({
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
| `postLinks` / `createLink` | Create a new short link | 50/s |
| `getApiLinks` | List all links for a domain | - |
| `getLinksByLinkId` | Get link info by ID | 20/s |
| `postLinksByLinkId` | Update an existing link | 20/s |
| `deleteLinksByLinkId` | Delete a link | 20/s |
| `getLinksExpand` | Get link info by domain and path | 20/s |
| `getLinksByOriginalUrl` | Get link by original URL (deprecated) | 20/s |
| `getLinksMultipleByUrl` | Get all links with same original URL | - |
| `postLinksDuplicateByLinkId` | Duplicate an existing link | 50/s |
| `postLinksArchive` | Archive a link | - |
| `postLinksUnarchive` | Unarchive a link | - |
| `postLinksPublic` | Create link using public API key | 50/s |
| `getLinksTweetbot` | Create link (GET method) | 50/s |
| `postLinksExamples` | Generate example links | 5/10s |

### Bulk Operations

| Function | Description | Rate Limit |
|----------|-------------|------------|
| `postLinksBulk` | Create up to 1000 links | 5/10s |
| `deleteLinksDeleteBulk` | Delete multiple links | 1/s |
| `postLinksArchiveBulk` | Archive multiple links | - |
| `postLinksUnarchiveBulk` | Unarchive multiple links | - |
| `postTagsBulk` | Add tag to multiple links | - |

### Domain Operations

| Function | Description |
|----------|-------------|
| `getApiDomains` | List all domains |
| `getDomainsByDomainId` | Get domain details |
| `postDomains` | Create a new domain |
| `postDomainsSettingsByDomainId` | Update domain settings |

### QR Code Operations

| Function | Description | Rate Limit |
|----------|-------------|------------|
| `postLinksQrByLinkIdString` | Generate QR code for a link | - |
| `postLinksQrBulk` | Generate QR codes in bulk | 1/min |

### Geographic Targeting

| Function | Description |
|----------|-------------|
| `getLinkCountryByLinkId` | Get country redirects |
| `postLinkCountryByLinkId` | Set country redirect |
| `postLinkCountryBulkByLinkId` | Set multiple country redirects |
| `deleteLinkCountryByLinkIdByCountry` | Remove country redirect |
| `getLinkRegionByLinkId` | Get region redirects |
| `postLinkRegionByLinkId` | Set region redirect |
| `postLinkRegionBulkByLinkId` | Set multiple region redirects |
| `deleteLinkRegionByLinkIdByCountryByRegion` | Remove region redirect |
| `getLinkRegionListByCountry` | List available regions |

### Folder Operations

| Function | Description |
|----------|-------------|
| `getLinksFoldersByDomainId` | List folders for a domain |
| `getLinksFoldersByDomainIdByFolderId` | Get folder details |
| `postLinksFolders` | Create a new folder |

### OpenGraph Operations

| Function | Description |
|----------|-------------|
| `getLinksOpengraphByDomainIdByLinkId` | Get OpenGraph properties |
| `putLinksOpengraphByDomainIdByLinkId` | Set OpenGraph properties |

### Permission Operations

| Function | Description |
|----------|-------------|
| `getLinksPermissionsByDomainIdByLinkId` | Get link permissions |
| `postLinksPermissionsByDomainIdByLinkIdByUserId` | Add user permission |
| `deleteLinksPermissionsByDomainIdByLinkIdByUserId` | Remove user permission |

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
import { postLinks } from "@short.io/client-node";

const customClient = createClient({
  baseUrl: "https://api.short.io",
  headers: {
    authorization: "your-api-key"
  }
});

const result = await postLinks({
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
  PostLinksData,
  PostLinksResponse,
  GetApiLinksResponse,
  type Options
} from "@short.io/client-node";

// Typed request
const linkData: PostLinksData = {
  body: {
    originalURL: "https://example.com",
    domain: "your-domain.com",
    path: "typed-link"
  }
};

// Typed response
const result: PostLinksResponse = await createLink(linkData);

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
