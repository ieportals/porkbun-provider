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

  async function createCnameRecord(
    subdomain: string,
    content: string
  ): Promise<DnsRecordResult> {
    try {
      const responseData = await request(`/dns/create/${baseDomain}`, {
        name: subdomain,
        type: "CNAME",
        content,
        ttl: defaultTtl,
        notes: defaultNotes,
      });

      return {
        success: true,
        id: typeof responseData.id === "string" ? responseData.id : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async function deleteCnameRecord(subdomain: string): Promise<DnsRecordResult> {
    try {
      await request(
        `/dns/deleteByNameType/${baseDomain}/CNAME/${encodeURIComponent(subdomain)}`,
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

  return {
    createCnameRecord,
    deleteCnameRecord,
  };
}
