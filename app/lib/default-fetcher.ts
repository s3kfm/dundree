import { constructSearchParams } from "@/app/lib/params";
import axios from "axios";

const normalizePathPart = (value: unknown) => {
  if (typeof value !== "string" && typeof value !== "number") return "";
  return String(value).replace(/^\/+|\/+$/g, "");
};

/**
 * Builds a stable `/api/...` URL from a TanStack React Query `queryKey`.
 *
 * The app uses a convention where all items in the query key except the last
 * form the base path, and the last item is either:
 * - an object of query params, or
 * - a string/number path segment.
 *
 * This function also normalizes segments to avoid accidental double slashes
 * (e.g. `/api//filters`) which can cause 308 redirects.
 */
function buildApiUrlFromQueryKey(queryKey: readonly unknown[]): string {
  if (!Array.isArray(queryKey) || queryKey.length === 0) return "/api";

  const baseParts = queryKey
    .slice(0, -1)
    .map(normalizePathPart)
    .filter(Boolean);

  let url = baseParts.length ? `/api/${baseParts.join("/")}` : "/api";

  const lastKey = queryKey[queryKey.length - 1] as unknown;

  // If the last query key is an object, convert it to query parameters.
  if (
    typeof lastKey === "object" &&
    lastKey !== null &&
    !Array.isArray(lastKey)
  ) {
    const queryParams = constructSearchParams(
      lastKey as Record<string, string | string[]>,
    ).toString();
    if (queryParams) url += `?${queryParams}`;
    return url;
  }

  // Otherwise treat it as a path segment.
  const lastPart = normalizePathPart(lastKey);
  if (lastPart) url += `/${lastPart}`;
  return url;
}

export const defaultFetcher = async ({
  queryKey,
}: {
  queryKey: Readonly<unknown[]>;
}) => {
  const url = buildApiUrlFromQueryKey(queryKey);
  const timeoutMs = 30_000; // avoid hanging navigation when server is slow (e.g. local dev)

  try {
    const response = await axios.get(url, { timeout: timeoutMs });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const msg =
        status != null
          ? `Request failed with status code ${status}: GET ${url}`
          : error.code === "ECONNABORTED"
            ? `Request timed out after ${timeoutMs / 1000}s: GET ${url}`
            : `Request failed: GET ${url}`;
      if (status === 422 || status === 400) {
        const errorData = error.response?.data;
        if (errorData?.errors) {
          throw errorData.errors;
        }
      }
      throw new Error(msg);
    }
    throw new Error(`Network response was not ok: GET ${url}`);
  }
};
