import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
    client: {
        name: "@hey-api/client-fetch",
    },
    experimentalParser: true,
    input: {
        path: "openapi/openapi.json",
    },
    output: {
        path: "src",
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
