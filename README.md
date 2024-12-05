# Short.io Node.js SDK

The Short.io Node.js official SDK client is a library that allows you to integrate [short.io](https://short.io) URL shortening and link management API with your Node.js application in an easy and elegant way.
This SDK contains methods for working with links and domains.

## API reference

See the [API docs](https://developers.short.io/reference) for more information.

## Installing

To install the SDK, run:

```sh
npm i @short.io/client-node
```

## Getting Started

First you need to get your API key from the Short.io dashboard in the [Integrations & API](https://app.short.io/settings/integrations/api-key) section.
Then you need to set the configuration for the client:

```js
import { setApiKey } from "@short.io/client-node";

setApiKey("YOUR_API_KEY");
```

## Usage

Import the needed methods from the SDK and use them in your code:

```js
import {
    getApiDomains,
    getLinksExpand,
    // and other needed methods
} from "@short.io/client-node";

const domainsResp = await getApiDomains();
```

`domainsResp.data` will contain the list of domains.

```js
const linkResp = await getLinksExpand({
    client,
    query: {
        domain: "your_domain.com",
        path: "lnk_abc123_abcde12345,
    },
});
```

`linkResp.data` will contain the expanded link.
