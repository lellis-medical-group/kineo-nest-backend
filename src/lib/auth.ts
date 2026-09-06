import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { jwt, openAPI } from "better-auth/plugins";
import { z } from "zod";
import { emailVerificationStatusPlugin } from "./auth/email-verification-status";
import {
  httpsImageUrlSchema,
  nameSchema,
  passwordSchema,
} from "./auth/schemas";
import { sendResetPasswordEmail, sendVerificationEmail } from "./email";
import { buildFrontendAuthUrl } from "./email/links";
import { createPrismaClient } from "./prisma";

const prisma = createPrismaClient();

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET is not set");
}

const jwtEnabled = process.env.JWT_ENABLED === "true";

/** Endpoints better-auth acceptant une entrée utilisateur soumise aux schémas de `./auth/schemas`. */
const USER_INPUT_PATHS = new Set(["/sign-up/email", "/update-user"]);

/**
 * Valide un champ du body avec le schéma donné et renvoie la valeur parsée
 * (normalisation `trim` incluse) ; lève une `APIError` 400 avec un message
 * clair si la valeur est invalide.
 */
function parseBodyField<S extends z.ZodType>(
  schema: S,
  value: unknown,
  errorMessage: string,
): z.output<S> {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new APIError("BAD_REQUEST", {
      message: errorMessage,
    });
  }
  return result.data;
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  plugins: [
    openAPI(),
    nextCookies(),
    emailVerificationStatusPlugin(),
    ...(jwtEnabled
      ? [
          jwt({
            jwt: {
              expirationTime: process.env.JWT_EXPIRATION_TIME || "15m",
              issuer: process.env.BETTER_AUTH_URL || "http://localhost:3000",
              audience: process.env.BETTER_AUTH_URL || "http://localhost:3000",
            },
            jwks: {
              rotationInterval: process.env.JWT_ROTATION_INTERVAL
                ? Number(process.env.JWT_ROTATION_INTERVAL)
                : undefined,
            },
          }),
        ]
      : []),
  ],

  secret: process.env.BETTER_AUTH_SECRET,

  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  trustedOrigins: (process.env.TRUSTED_ORIGINS || "")
    .split(",")
    .filter(Boolean),

  rateLimit: {
    enabled: true,
    window: Number(process.env.RATE_LIMIT_WINDOW) || 60,
    max: Number(process.env.RATE_LIMIT_MAX) || 20,
  },

  session: {
    expiresIn: Number(process.env.SESSION_EXPIRES_IN) || 60 * 60 * 24 * 7,
    updateAge: Number(process.env.SESSION_UPDATE_AGE) || 60 * 60 * 24,
    cookieCache: {
      enabled: process.env.COOKIE_CACHE_ENABLED !== "false",
      maxAge: Number(process.env.COOKIE_CACHE_MAX_AGE) || 60 * 5,
    },
  },

  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },

  emailAndPassword: {
    enabled: true,

    requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION === "true",
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,

    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail({
        email: user.email,
        name: user.name,
        url: buildFrontendAuthUrl(url, "/reset-password"),
      });
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail({
        email: user.email,
        name: user.name,
        url: buildFrontendAuthUrl(url, "/verify-email", { email: user.email }),
      });
    },

    autoSignInAfterVerification: true,
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (USER_INPUT_PATHS.has(ctx.path)) {
        if (ctx.body?.name !== undefined) {
          ctx.body.name = parseBodyField(
            nameSchema,
            ctx.body.name,
            "Le nom contient des caractères non autorisés.",
          );
        }

        if (ctx.body?.image !== undefined && ctx.body.image !== null) {
          parseBodyField(
            httpsImageUrlSchema,
            ctx.body.image,
            "URL d'image invalide.",
          );
        }
      }

      if (ctx.path === "/sign-up/email") {
        if (ctx.body?.email) {
          ctx.body.email = ctx.body.email.toLowerCase().trim();
        }

        if (ctx.body?.password !== undefined) {
          parseBodyField(
            passwordSchema,
            ctx.body.password,
            "Le mot de passe doit contenir entre 8 et 128 caractères.",
          );
        }
      }
    }),
  },
});
