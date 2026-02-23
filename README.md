# porkbun-provider

A tiny TypeScript helper for creating and deleting Porkbun CNAME records.

## Environment variables

An example env file is included at `.env.example`.

Runtime keys:

- `PORKBUN_BASE_URL`
- `PORKBUN_API_KEY`
- `PORKBUN_SECRET_KEY`
- `PORKBUN_BASE_DOMAIN`

Optional test keys:

- `PORKBUN_TEST_BASE_DOMAIN`
- `PORKBUN_TEST_CNAME_CONTENT` (test-only CNAME target, for example `test-target.example.com`)

## Usage

```ts
import { createPorkbunClient } from "porkbun-provider";

const dns = createPorkbunClient({
  baseUrl:
    process.env.PORKBUN_BASE_URL || "https://api.porkbun.com/api/json/v3",
  apiKey: process.env.PORKBUN_API_KEY || "",
  secretKey: process.env.PORKBUN_SECRET_KEY || "",
  baseDomain: process.env.PORKBUN_BASE_DOMAIN || "example.com",
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

## Testing

Run tests:

```bash
pnpm test
```

Vitest loads `.env` and `.env.local` automatically for tests.

Integration tests are env-gated. They are skipped unless:

- `PORKBUN_API_KEY` is set
- `PORKBUN_SECRET_KEY` is set
- `PORKBUN_TEST_BASE_DOMAIN` is set

Important: in Porkbun, the `PORKBUN_TEST_BASE_DOMAIN` must have **API access enabled** in domain settings.

If set, tests will create and then delete a real CNAME record under the test domain.
