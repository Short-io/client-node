import { client } from "./generated/client.gen"
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
