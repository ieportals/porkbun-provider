import { describe, expect, it } from "vitest";
import { createPorkbunClient } from "./index";

const baseUrl = process.env.PORKBUN_BASE_URL ?? "https://api.porkbun.com/api/json/v3";
const apiKey = process.env.PORKBUN_API_KEY;
const secretKey = process.env.PORKBUN_SECRET_KEY;
const baseDomain = process.env.PORKBUN_TEST_BASE_DOMAIN;
const cnameContent =
  process.env.PORKBUN_TEST_CNAME_CONTENT ?? "test-target.example.com";

const canRunIntegration = Boolean(apiKey && secretKey && baseDomain);
const describeIntegration = canRunIntegration ? describe : describe.skip;

describeIntegration("porkbun live integration", () => {
  it("creates and deletes a real CNAME record", async () => {
    const client = createPorkbunClient({
      baseUrl,
      apiKey: apiKey ?? "",
      secretKey: secretKey ?? "",
      baseDomain: baseDomain ?? "",
      defaultNotes: "Created by porkbun-provider vitest integration",
    });

    const subdomain = `vitest-${Date.now()}`;
    const createResult = await client.createCnameRecord(subdomain, cnameContent);
    if (!createResult.success) {
      throw new Error(`Create failed: ${createResult.error ?? "Unknown error"}`);
    }

    const deleteResult = await client.deleteCnameRecord(subdomain);
    if (!deleteResult.success) {
      throw new Error(`Delete failed: ${deleteResult.error ?? "Unknown error"}`);
    }

    expect(createResult.success).toBe(true);
    expect(deleteResult.success).toBe(true);
  }, 30000);
});
