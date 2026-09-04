/**
 * Le `baseURL` de Better Auth est l'origine de l'API NestJS : les liens
 * d'email générés nativement (vérification, réinitialisation) pointeraient
 * donc vers l'API et non vers le frontend Next.js.
 *
 * Cette fonction réécrit l'URL produite par Better Auth vers une page du
 * frontend en conservant le token et le callbackURL d'origine. La page cible
 * complète ensuite le flux via `authClient`, qui proxifie vers l'API :
 * NestJS reste le seul serveur d'authentification.
 *
 * Formats gérés (better-auth 1.6.x) :
 * - `${baseURL}/verify-email?token=...&callbackURL=...` (token en query)
 * - `${baseURL}/reset-password/<token>?callbackURL=...` (token dans le path)
 *
 * `extraParams` permet d'ajouter des paramètres utiles à la page frontend
 * (ex. l'email du compte pour proposer un renvoi d'email de vérification).
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
