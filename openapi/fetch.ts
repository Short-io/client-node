import fs from "fs";

const resp = await fetch("https://api.short.io/openapi.json");
const openapiJSON = await resp.json();
fs.writeFileSync("openapi/openapi.json", JSON.stringify(openapiJSON, null, 2));
