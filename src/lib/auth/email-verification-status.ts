import type { BetterAuthPlugin } from "better-auth";
import { APIError, createAuthEndpoint } from "better-auth/api";
import { z } from "zod";
import { decodeVerificationToken } from "./verification-token";

/**
 * Better Auth plugin exposing `GET /api/auth/check-email-verification`.
 *
 * Reports whether the account behind an email verification token (even an
 * expired or already-used one) is already verified, so the frontend
 * `/verify-email` page can show success instead of an error in that case.
 * Security: the signature is verified with `BETTER_AUTH_SECRET` (only
 * expiration is ignored), so the status is only revealed to holders of a
 * token this server issued.
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
