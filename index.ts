export interface PorkbunConfig {
  baseUrl: string;
  apiKey: string;
  secretKey: string;
  baseDomain: string;
  defaultTtl?: string;
  defaultNotes?: string;
}

export interface DnsRecordResult {
  success: boolean;
  id?: string;
  error?: string;
}

interface PorkbunResponse {
  status?: string;
  id?: string;
  [key: string]: unknown;
}

export function createPorkbunClient(config: PorkbunConfig) {
  const {
    baseUrl,
    apiKey,
    secretKey,
    baseDomain,
    defaultTtl = "600",
    defaultNotes = "Automatically created by porkbun-provider",
  } = config;

  async function request(
    path: string,
    payload: Record<string, unknown>
  ): Promise<PorkbunResponse> {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apikey: apiKey,
        secretapikey: secretKey,
        ...payload,
      }),
    });

    const responseData = (await response.json()) as PorkbunResponse;
    if (!response.ok || responseData.status !== "SUCCESS") {
      throw new Error(
        `Porkbun API error: ${response.status} - ${JSON.stringify(responseData)}`
      );
    }

    return responseData;
  }

  async function createRecord(
    type: "CNAME" | "TXT",
    name: string,
    content: string
  ): Promise<DnsRecordResult> {
    try {
      const responseData = await request(`/dns/create/${baseDomain}`, {
        name,
        type,
        content,
        ttl: defaultTtl,
        notes: defaultNotes,
      });
      const id =
        typeof responseData.id === "string" ? responseData.id : undefined;

      return {
        success: true,
        ...(id ? { id } : {}),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Porkbun's deleteByNameType removes ALL records of `type` at `name`. TXT
  // names routinely hold several values (for example many `_vercel` ownership
  // challenges live under a single `_vercel` name), so a TXT delete is a bulk
  // delete of that name - same semantics as the CNAME delete.
  async function deleteRecordByNameType(
    type: "CNAME" | "TXT",
    name: string
  ): Promise<DnsRecordResult> {
    try {
      await request(
        `/dns/deleteByNameType/${baseDomain}/${type}/${encodeURIComponent(name)}`,
        {}
      );

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  function createCnameRecord(
    subdomain: string,
    content: string
  ): Promise<DnsRecordResult> {
    return createRecord("CNAME", subdomain, content);
  }

  function deleteCnameRecord(subdomain: string): Promise<DnsRecordResult> {
    return deleteRecordByNameType("CNAME", subdomain);
  }

  function createTxtRecord(
    name: string,
    content: string
  ): Promise<DnsRecordResult> {
    return createRecord("TXT", name, content);
  }

  function deleteTxtRecord(name: string): Promise<DnsRecordResult> {
    return deleteRecordByNameType("TXT", name);
  }

  return {
    createCnameRecord,
    deleteCnameRecord,
    createTxtRecord,
    deleteTxtRecord,
  };
}
