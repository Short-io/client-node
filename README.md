# Short.io Node.js SDK

The Short.io Node.js official SDK client is a library that allows you to integrate [short.io](https://short.io) URL shortening and link management API with your Node.js application in an easy and elegant way.

## API reference

See the [API docs](https://developers.short.io/reference) for more information.

## Installing

To install this package, type:

```sh
npm i @short.io/client-node
```

## Getting Started

First you need to get your API key from the Short.io dashboard in the [Integrations & API](https://app.short.io/settings/integrations/api-key) section.
This SDK contains methods for working with links, domains and statistics. Import the Shortio class:

```js
import { Shortio } from "shortio";
```

## Usage

Then create an instance of the Shortio class, and pass your API key as the first parameter:

```js
const shortio = new Shortio("YOUR_API_KEY");
```

To get the domain list, you can use the following code:

```js
const domains = await shortio.domain.list();
```

Get the link list of the first domain above:

```js
const links = await shortio.link.list(domains[0].id);
```

Get the link statistics of the first link above:

```js
const stats = await shortio.statistics.getByLink(links[0].idString);
```

Create links:

```js
const link = await shortio.link.create({
  domain: "link.example.com",
  path: "example",
  originalURL: "https://example.com",
});
console.log(link.shortURL); // https://link.example.com/example

const publicLink = await shortio.link.createPublic({
  domain: "link.example.com",
  originalURL: "https://example.com",
  publicAPIKey: "PUBLIC_API_KEY",
});
console.log(publicLink.shortURL); // https://link.example.com/a83t48

const secureLink = await shortio.link.createSecure({
  domain: "link.example.com",
  publicAPIKey: "PUBLIC_API_KEY",
  originalURL: "https://example.com",
});
console.log(secureLink.shortURL); // https://link.example.com/a83t48#ta95me8
```