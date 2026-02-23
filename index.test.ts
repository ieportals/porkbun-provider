import { afterEach, describe, expect, it, vi } from "vitest";
import { createPorkbunClient } from "./index";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createPorkbunClient", () => {
  it("creates a CNAME record and returns id on success", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: "SUCCESS", id: "abc123" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

    const client = createPorkbunClient({
      baseUrl: "https://api.porkbun.com/api/json/v3",
      apiKey: "api-key",
      secretKey: "secret-key",
      baseDomain: "example.com",
      defaultTtl: "600",
      defaultNotes: "Created by tests",
    });

    const result = await client.createCnameRecord("staging", "target.example.com");

    expect(result).toEqual({ success: true, id: "abc123" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.porkbun.com/api/json/v3/dns/create/example.com",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apikey: "api-key",
          secretapikey: "secret-key",
          name: "staging",
          type: "CNAME",
          content: "target.example.com",
          ttl: "600",
          notes: "Created by tests",
        }),
      },
    );
  });

  it("returns success false when API returns an error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ status: "ERROR", message: "bad request" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const client = createPorkbunClient({
      baseUrl: "https://api.porkbun.com/api/json/v3",
      apiKey: "api-key",
      secretKey: "secret-key",
      baseDomain: "example.com",
    });

    const result = await client.createCnameRecord("staging", "target.example.com");

    expect(result.success).toBe(false);
    expect(result.error).toContain("Porkbun API error");
  });

  it("encodes subdomain in delete endpoint", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: "SUCCESS" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

    const client = createPorkbunClient({
      baseUrl: "https://api.porkbun.com/api/json/v3",
      apiKey: "api-key",
      secretKey: "secret-key",
      baseDomain: "example.com",
    });

    const result = await client.deleteCnameRecord("foo/bar");

    expect(result).toEqual({ success: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.porkbun.com/api/json/v3/dns/deleteByNameType/example.com/CNAME/foo%2Fbar",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });
});
