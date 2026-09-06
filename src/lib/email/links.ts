/**
 * Better Auth's `baseURL` points to the NestJS API, but email links must open
 * frontend pages. This rewrites Better Auth email URLs to frontend pages while
 * preserving token and callbackURL; the target page completes the flow through
 * `authClient`, which proxies to the API (NestJS stays the sole auth server).
 *
 * Handled formats (better-auth 1.6.x):
 * - `${baseURL}/verify-email?token=...&callbackURL=...` (token in query)
 * - `${baseURL}/reset-password/<token>?callbackURL=...` (token in path)
 *
 * `extraParams` appends params useful to the frontend page
 * (e.g. the account email, to offer a "resend verification" action).
 */
export function buildFrontendAuthUrl(
  serverUrl: string,
  pagePath: string,
  extraParams?: Record<string, string | null | undefined>,
): string {
  const origin = frontendOrigin();

  try {
    const parsed = new URL(serverUrl);
    const token =
      parsed.searchParams.get("token") ?? tokenFromPathname(parsed.pathname);
    const callbackURL = parsed.searchParams.get("callbackURL");

    const target = new URL(pagePath, `${origin}/`);
    if (token) {
      target.searchParams.set("token", token);
    }
    if (callbackURL) {
      target.searchParams.set("callbackURL", callbackURL);
    }
    for (const [key, value] of Object.entries(extraParams ?? {})) {
      if (value) {
        target.searchParams.set(key, value);
      }
    }
    return target.toString();
  } catch {
    return `${origin}${pagePath}`;
  }
}

const DEFAULT_FRONTEND_URL = "http://localhost:3001";

function frontendOrigin(): string {
  return (process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL).replace(/\/+$/, "");
}

function tokenFromPathname(pathname: string): string | null {
  const match = /\/reset-password\/([^/]+)$/.exec(pathname);

  return match ? decodeURIComponent(match[1]) : null;
}
