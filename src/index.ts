import { client, postLinks } from "./generated/client.gen.ts"
import { postLinks } from "./generated"
export * from './generated/types.gen';
export * from './generated/sdk.gen';

client.setConfig({
    baseUrl: "https://api.short.io"
})

export const setApiKey = (apiKey: string) => {
    client.setConfig({
        headers: {
            authorization: apiKey
        }
    })
}

export const createLink = postLinks;
