import { compactVerify } from "jose";

export interface VerificationTokenPayload {
  email: string;
}

/**
 * Décode un token de vérification Better Auth (JWT HS256 signé avec
 * `BETTER_AUTH_SECRET`) en ignorant volontairement son expiration :
 * `compactVerify` vérifie la **signature JWS** sans valider les claims JWT
 * (exp, iat, nbf). La clé `BETTER_AUTH_SECRET` ne permet que HMAC, donc seul
 * ce serveur a pu produire une signature valide.
 *
 * Sert à déterminer vers quel compte pointe un lien de vérification — même
 * expiré ou déjà consommé — afin que la page frontend puisse afficher l'écran
 * de succès quand l'adresse est déjà vérifiée.
 *
 * Retourne `null` si la signature, le format ou le payload est invalide.
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
