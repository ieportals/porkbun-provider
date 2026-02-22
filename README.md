# porkbun-provider

A tiny TypeScript helper for creating and deleting Porkbun CNAME records.

## Usage

```ts
import { createPorkbunClient } from "porkbun-provider";

const dns = createPorkbunClient({
  baseUrl:
    process.env.PORKBUN_BASE_URL || "https://api.porkbun.com/api/json/v3",
  apiKey: process.env.PORKBUN_API_KEY || "",
  secretKey: process.env.PORKBUN_SECRET_KEY || "",
  baseDomain: "example.com",
  defaultTtl: "600",
  defaultNotes: "Created by my deployment pipeline",
});

const createResult = await dns.createCnameRecord(
  "staging",
  "cname.target.example.net",
);

if (!createResult.success) {
  console.error("Create failed:", createResult.error);
}

const deleteResult = await dns.deleteCnameRecord("staging");

if (!deleteResult.success) {
  console.error("Delete failed:", deleteResult.error);
}
```

## API

### `createPorkbunClient(config)`

Creates a client with shared config and returns methods:

- `createCnameRecord(subdomain: string, content: string)`
- `deleteCnameRecord(subdomain: string)`

Config fields:

- `baseUrl` - Porkbun API base URL
- `apiKey` - Porkbun API key
- `secretKey` - Porkbun secret API key
- `baseDomain` - Domain records are managed under (for example: `example.com`)
- `defaultTtl` - Optional default TTL (defaults to `"600"`)
- `defaultNotes` - Optional default notes for created records

Each method returns:

```ts
{
  success: boolean;
  id?: string;
  error?: string;
}
```
