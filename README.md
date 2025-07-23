# Short.io Node.js SDK

The Short.io Node.js official SDK client is a library that allows you to integrate [short.io](https://short.io) URL shortening and link management API with your Node.js application in an easy and elegant way.

This SDK provides comprehensive methods for working with links, domains, permissions, QR codes, and more.

## Features

- ✅ **Link Management**: Create, update, delete, and manage short links
- ✅ **Domain Management**: Handle custom domains and their settings
- ✅ **QR Code Generation**: Generate QR codes for links
- ✅ **Bulk Operations**: Perform operations on multiple links at once
- ✅ **Geographic Targeting**: Set country and region-specific redirects
- ✅ **Link Analytics**: Get detailed link statistics and expand information
- ✅ **Permissions Management**: Control access to links and domains
- ✅ **TypeScript Support**: Full TypeScript definitions included
- ✅ **Modern ESM**: Built with modern ES modules

## Installation

```bash
npm install @short.io/client-node
```

## Quick Start

### 1. Get Your API Key

First, get your API key from the Short.io dashboard in the [Integrations & API](https://app.short.io/settings/integrations/api-key) section.

### 2. Initialize the SDK

```javascript
import { setApiKey } from "@short.io/client-node";

// Set your API key
setApiKey("YOUR_API_KEY");
```

### 3. Create Your First Short Link

```javascript
import { createLink } from "@short.io/client-node";

try {
  const result = await createLink({
    body: {
      originalURL: "https://example.com/very-long-url",
      domain: "your-domain.com",
      path: "custom-path", // Optional: custom short path
      title: "My Link" // Optional: link title
    }
  });
  
  console.log("Short URL:", result.data.shortURL);
  console.log("Link ID:", result.data.idString);
} catch (error) {
  console.error("Error creating link:", error);
}
```

## Core Usage Examples

### Domain Management

```javascript
import { getApiDomains, getDomainsByDomainId } from "@short.io/client-node";

// Get all your domains
const domains = await getApiDomains();
console.log("Available domains:", domains.data);

// Get specific domain details
const domainDetails = await getDomainsByDomainId({
  path: { domainId: "your-domain-id" }
});
console.log("Domain info:", domainDetails.data);
```

### Link Operations

```javascript
import { 
  getApiLinks, 
  getLinksByLinkId, 
  postLinksByLinkId,
  deleteLinksByLinkId 
} from "@short.io/client-node";

// Get all links for a domain
const links = await getApiLinks({
  query: {
    domain_id: "your-domain-id",
    limit: 50,
    offset: 0
  }
});

// Get specific link details
const linkInfo = await getLinksByLinkId({
  path: { linkId: "your-link-id" }
});

// Update a link
const updatedLink = await postLinksByLinkId({
  path: { linkId: "your-link-id" },
  body: {
    originalURL: "https://new-destination.com",
    title: "Updated Title"
  }
});

// Delete a link
await deleteLinksByLinkId({
  path: { link_id: "your-link-id" }
});
```

### Link Expansion and Analytics

```javascript
import { getLinksExpand } from "@short.io/client-node";

// Expand a short link to get detailed information
const expandedLink = await getLinksExpand({
  query: {
    domain: "your-domain.com",
    path: "abc123"
  }
});

console.log("Original URL:", expandedLink.data.originalURL);
console.log("Click count:", expandedLink.data.clicksCount);
console.log("Creation date:", expandedLink.data.createdAt);
```

### Bulk Operations

```javascript
import { 
  postLinksBulk, 
  deleteLinksDeleteBulk,
  postLinksArchiveBulk 
} from "@short.io/client-node";

// Create multiple links at once
const bulkLinks = await postLinksBulk({
  body: [
    {
      originalURL: "https://example1.com",
      domain: "your-domain.com"
    },
    {
      originalURL: "https://example2.com", 
      domain: "your-domain.com",
      path: "custom-path"
    }
  ]
});

// Delete multiple links
await deleteLinksDeleteBulk({
  body: {
    links: ["link-id-1", "link-id-2", "link-id-3"]
  }
});

// Archive multiple links
await postLinksArchiveBulk({
  body: {
    links: ["link-id-1", "link-id-2"]
  }
});
```

### QR Code Generation

```javascript
import { postLinksQrByLinkIdString, postLinksQrBulk } from "@short.io/client-node";

// Generate QR code for a single link
const qrCode = await postLinksQrByLinkIdString({
  path: { linkIdString: "your-link-id" },
  body: {
    size: 300,
    format: "png"
  }
});

// Generate QR codes in bulk (rate limited: 1 request per minute)
const bulkQrCodes = await postLinksQrBulk({
  body: {
    links: ["link-id-1", "link-id-2"],
    size: 200,
    format: "svg"
  }
});
```

### Geographic Targeting

```javascript
import { 
  postLinkCountryByLinkId,
  postLinkRegionByLinkId,
  getLinkRegionListByCountry 
} from "@short.io/client-node";

// Set country-specific redirect
await postLinkCountryByLinkId({
  path: { linkId: "your-link-id" },
  body: {
    country: "US",
    url: "https://us-specific-page.com"
  }
});

// Set region-specific redirect
await postLinkRegionByLinkId({
  path: { linkId: "your-link-id" },
  body: {
    country: "US",
    region: "CA",
    url: "https://california-specific-page.com"
  }
});

// Get available regions for a country
const regions = await getLinkRegionListByCountry({
  path: { country: "US" }
});
```

### Permission Management

```javascript
import { 
  getLinksPermissionsByDomainIdByLinkId,
  postLinksPermissionsByDomainIdByLinkIdByUserId 
} from "@short.io/client-node";

// Get link permissions
const permissions = await getLinksPermissionsByDomainIdByLinkId({
  path: { 
    domainId: "your-domain-id",
    linkId: "your-link-id" 
  }
});

// Add user permission to a link
await postLinksPermissionsByDomainIdByLinkIdByUserId({
  path: {
    domainId: "your-domain-id",
    linkId: "your-link-id",
    userId: "user-id"
  },
  body: {
    permission: "read" // or "write"
  }
});
```

## Advanced Configuration

### Custom Client Configuration

```javascript
import { client } from "@short.io/client-node";

// Configure custom settings
client.setConfig({
  baseUrl: "https://api.short.io", // Default base URL
  headers: {
    "User-Agent": "MyApp/1.0.0",
    "authorization": "your-api-key"
  }
});
```

### Error Handling

```javascript
import { createLink } from "@short.io/client-node";

try {
  const result = await createLink({
    body: {
      originalURL: "https://example.com",
      domain: "invalid-domain.com"
    }
  });
} catch (error) {
  if (error.status === 400) {
    console.error("Bad request:", error.body);
  } else if (error.status === 401) {
    console.error("Authentication failed - check your API key");
  } else if (error.status === 409) {
    console.error("Conflict - link with this path already exists");
  } else {
    console.error("Unexpected error:", error);
  }
}
```

## TypeScript Support

The SDK is built with TypeScript and provides full type definitions:

```typescript
import { PostLinksData, PostLinksResponse } from "@short.io/client-node";

const linkData: PostLinksData = {
  body: {
    originalURL: "https://example.com",
    domain: "your-domain.com",
    path: "custom-path"
  }
};

const result: PostLinksResponse = await createLink(linkData);
```

## Rate Limits

Different endpoints have different rate limits:

- **Link Creation**: 50 requests/second  
- **Link Updates/Deletes**: 20 requests/second
- **Link Info**: 20 requests/second
- **Bulk Operations**: 5 requests per 10 seconds
- **QR Bulk Generation**: 1 request per minute
- **Public API**: 20 requests/second

## Environment Variables

You can also set your API key using environment variables:

```bash
export SHORT_IO_API_KEY="your-api-key"
```

```javascript
import { setApiKey } from "@short.io/client-node";

// Use environment variable
setApiKey(process.env.SHORT_IO_API_KEY);
```

## API Reference

For complete API documentation, visit: [https://developers.short.io/reference](https://developers.short.io/reference)

## Support

- **Documentation**: [https://developers.short.io](https://developers.short.io)
- **Issues**: [https://github.com/Short-io/client-node/issues](https://github.com/Short-io/client-node/issues)
- **Short.io Dashboard**: [https://app.short.io](https://app.short.io)

## License

FSL (Functional Source License)