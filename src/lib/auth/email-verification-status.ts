import type { BetterAuthPlugin } from "better-auth";
import { APIError, createAuthEndpoint } from "better-auth/api";
import { z } from "zod";
import { decodeVerificationToken } from "./verification-token";

/**
 * Plugin Better Auth exposant `GET /api/auth/check-email-verification`.
 *
 * Reçoit un token de vérification d'email (même expiré ou déjà utilisé) et
 * indique si le compte correspondant est déjà vérifié. La page frontend
 * `/verify-email` l'appelle quand la vérification échoue : si l'adresse est
 * déjà validée, elle affiche l'écran de succès au lieu d'une erreur.
 *
 * Sécurité : la signature du token est vérifiée avec `BETTER_AUTH_SECRET`
 * (seule l'expiration est ignorée) — l'état de vérification n'est donc
 * révélé qu'à qui détient un token émis par ce serveur.
 */
export function emailVerificationStatusPlugin(): BetterAuthPlugin {
  return {
    id: "email-verification-status",
    endpoints: {
      checkEmailVerificationStatus: createAuthEndpoint(
        "/check-email-verification",
        {
          method: "GET",
          query: z.object({
            token: z.string().min(1),
          }),
        },
        async (ctx) => {
          const decoded = await decodeVerificationToken(
            ctx.query.token,
            ctx.context.secret,
          );

          if (!decoded) {
            throw new APIError("UNAUTHORIZED", {
              message: "Invalid token",
            });
          }

          const record = await ctx.context.internalAdapter.findUserByEmail(
            decoded.email,
          );

          return ctx.json({
            verified: record?.user.emailVerified === true,
          });
        },
      ),
    },
  };
}
