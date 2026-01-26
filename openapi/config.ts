import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
    client: {
        name: "@hey-api/client-fetch",
        bundle: true,
    },
    experimentalParser: true,
    input: {
        path: "https://api.short.io/openapi.json"
    },
    output: {
        path: "src/generated",
        format: "prettier",
        lint: "eslint",
    },
    parser: {
        patch: {
            operations: {
                // Links - CRUD
                'POST /links': (op) => { op.operationId = 'createLink'; },
                'GET /api/links': (op) => { op.operationId = 'listLinks'; },
                'GET /links/{linkId}': (op) => { op.operationId = 'getLink'; },
                'POST /links/{linkId}': (op) => { op.operationId = 'updateLink'; },
                'DELETE /links/{link_id}': (op) => { op.operationId = 'deleteLink'; },
                'DELETE /links/delete_bulk': (op) => { op.operationId = 'deleteLinksBulk'; },
                'GET /links/expand': (op) => { op.operationId = 'expandLink'; },
                'GET /links/by-original-url': (op) => { op.operationId = 'getLinkByOriginalUrl'; },
                'GET /links/multiple-by-url': (op) => { op.operationId = 'getLinksByUrl'; },
                'GET /links/tweetbot': (op) => { op.operationId = 'createLinkSimple'; },
                'POST /links/public': (op) => { op.operationId = 'createLinkPublic'; },
                'POST /links/bulk': (op) => { op.operationId = 'createLinksBulk'; },
                'POST /links/examples': (op) => { op.operationId = 'createExampleLinks'; },
                'POST /links/duplicate/{linkId}': (op) => { op.operationId = 'duplicateLink'; },

                // Links - Archive
                'POST /links/archive': (op) => { op.operationId = 'archiveLink'; },
                'POST /links/archive_bulk': (op) => { op.operationId = 'archiveLinksBulk'; },
                'POST /links/unarchive': (op) => { op.operationId = 'unarchiveLink'; },
                'POST /links/unarchive_bulk': (op) => { op.operationId = 'unarchiveLinksBulk'; },

                // Links - QR
                'POST /links/qr/{linkIdString}': (op) => { op.operationId = 'generateQrCode'; },
                'POST /links/qr/bulk': (op) => { op.operationId = 'generateQrCodesBulk'; },

                // Links - OpenGraph
                'GET /links/opengraph/{domainId}/{linkId}': (op) => { op.operationId = 'getLinkOpengraph'; },
                'PUT /links/opengraph/{domainId}/{linkId}': (op) => { op.operationId = 'updateLinkOpengraph'; },

                // Links - Permissions
                'GET /links/permissions/{domainId}/{linkId}': (op) => { op.operationId = 'getLinkPermissions'; },
                'DELETE /links/permissions/{domainId}/{linkId}/{userId}': (op) => { op.operationId = 'deleteLinkPermission'; },
                'POST /links/permissions/{domainId}/{linkId}/{userId}': (op) => { op.operationId = 'addLinkPermission'; },

                // Country targeting
                'GET /link_country/{linkId}': (op) => { op.operationId = 'getLinkCountries'; },
                'POST /link_country/{linkId}': (op) => { op.operationId = 'createLinkCountry'; },
                'POST /link_country/bulk/{linkId}': (op) => { op.operationId = 'createLinkCountriesBulk'; },
                'DELETE /link_country/{linkId}/{country}': (op) => { op.operationId = 'deleteLinkCountry'; },

                // Region targeting
                'GET /link_region/{linkId}': (op) => { op.operationId = 'getLinkRegions'; },
                'POST /link_region/{linkId}': (op) => { op.operationId = 'createLinkRegion'; },
                'GET /link_region/list/{country}': (op) => { op.operationId = 'getRegionsByCountry'; },
                'POST /link_region/bulk/{linkId}': (op) => { op.operationId = 'createLinkRegionsBulk'; },
                'DELETE /link_region/{linkId}/{country}/{region}': (op) => { op.operationId = 'deleteLinkRegion'; },

                // Folders
                'GET /links/folders/{domainId}': (op) => { op.operationId = 'listFolders'; },
                'GET /links/folders/{domainId}/{folderId}': (op) => { op.operationId = 'getFolder'; },
                'POST /links/folders': (op) => { op.operationId = 'createFolder'; },

                // Domains
                'GET /api/domains': (op) => { op.operationId = 'listDomains'; },
                'GET /domains/{domainId}': (op) => { op.operationId = 'getDomain'; },
                'POST /domains/settings/{domainId}': (op) => { op.operationId = 'updateDomainSettings'; },
                'POST /domains': (op) => { op.operationId = 'createDomain'; },

                // Tags
                'POST /tags/bulk': (op) => { op.operationId = 'addTagsBulk'; },
            },
        },
    },
    plugins: [
        "@hey-api/schemas",
        "@hey-api/sdk",
        {
            enums: "javascript",
            name: "@hey-api/typescript",
        },
        {
            name: "zod",
            compatibilityVersion: 4,
            exportFromIndex: true,
        },
    ],
});
