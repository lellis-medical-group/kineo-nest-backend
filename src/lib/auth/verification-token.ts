import { compactVerify } from "jose";

export interface VerificationTokenPayload {
  email: string;
}

/**
 * Decodes a Better Auth verification token (HS256 JWT signed with
 * `BETTER_AUTH_SECRET`), intentionally ignoring expiration: `compactVerify`
 * only checks the JWS signature, and only this server can have produced it.
 * Used to know which account a verification link points to, even when the
 * token is expired or already consumed.
 *
 * Returns `null` on invalid signature, format or payload.
 */
export async function decodeVerificationToken(
  token: string,
  secret: string,
): Promise<VerificationTokenPayload | null> {
  try {
    const { payload } = await compactVerify(
      token,
      new TextEncoder().encode(secret),
    );

    const claims = JSON.parse(new TextDecoder().decode(payload)) as {
      email?: unknown;
    };

    const { email } = claims;

    if (typeof email !== "string" || email.length === 0) {
      return null;
    }

    return { email };
  } catch {
    return null;
  }
}
