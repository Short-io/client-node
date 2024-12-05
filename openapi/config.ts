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
    plugins: [
        "@hey-api/schemas",
        "@hey-api/sdk",
        {
            enums: "javascript",
            name: "@hey-api/typescript",
        },
    ],
});
