export function buildApiUrl(
  baseUrl: string,
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): string {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = path.replace(/^\//, "");
  const url = new URL(normalizedPath, normalizedBase);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

/** Turn a failed Response into a readable ApiError. */
export async function parseApiError(
  response: Response,
  fallback = "Something went wrong.",
): Promise<ApiError> {
  let message = fallback;
  let details: unknown;
  try {
    const data = (await response.json()) as { message?: unknown };
    details = data;
    if (Array.isArray(data.message)) message = (data.message as string[]).join(", ");
    else if (typeof data.message === "string") message = data.message;
  } catch {
    // response body wasn't JSON; keep the fallback message
  }
  return new ApiError(response.status, message, details);
}
