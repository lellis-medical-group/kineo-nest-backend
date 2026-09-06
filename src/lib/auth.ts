import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { jwt, openAPI } from "better-auth/plugins";
import { z } from "zod";
import { emailVerificationStatusPlugin } from "./auth/email-verification-status";
import {
  callbackUrlSchema,
  emailSchema,
  httpsImageUrlSchema,
  nameSchema,
  passwordInputSchema,
  passwordSchema,
  tokenSchema,
} from "./auth/schemas";
import { sendResetPasswordEmail, sendVerificationEmail } from "./email";
import { buildFrontendAuthUrl } from "./email/links";
import { createPrismaClient } from "./prisma";

const prisma = createPrismaClient();

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET is not set");
}

const jwtEnabled = process.env.JWT_ENABLED === "true";

/** Schema plus the 400 message thrown when a body field fails validation. */
type FieldValidator = { schema: z.ZodType; message: string };

const nameField: FieldValidator = {
  schema: nameSchema,
  message: "Le nom contient des caractères non autorisés.",
};
const imageField: FieldValidator = {
  schema: httpsImageUrlSchema,
  message: "URL d'image invalide.",
};
const emailField: FieldValidator = {
  schema: emailSchema,
  message: "Adresse e-mail invalide.",
};
const passwordField: FieldValidator = {
  schema: passwordSchema,
  message: "Le mot de passe doit contenir entre 8 et 128 caractères.",
};
const passwordVerifyField: FieldValidator = {
  schema: passwordInputSchema,
  message: "Mot de passe invalide.",
};
const tokenField: FieldValidator = {
  schema: tokenSchema,
  message: "Jeton invalide.",
};
const idField: FieldValidator = {
  schema: tokenSchema,
  message: "Identifiant invalide.",
};

/** better-auth endpoints whose body fields are validated with `./auth/schemas`. */
const PATH_FIELD_VALIDATORS: Record<string, Record<string, FieldValidator>> = {
  "/sign-up/email": {
    name: nameField,
    email: emailField,
    password: passwordField,
    image: imageField,
  },
  "/update-user": { name: nameField, image: imageField },
  "/sign-in/email": { email: emailField, password: passwordVerifyField },
  "/verify-password": { password: passwordVerifyField },
  "/change-password": { currentPassword: passwordVerifyField },
  "/delete-user": { password: passwordVerifyField, token: tokenField },
  "/reset-password": { token: tokenField },
  "/revoke-session": { token: tokenField },
  "/change-email": { newEmail: emailField },
  "/send-verification-email": { email: emailField },
  "/request-password-reset": { email: emailField },
  "/unlink-account": { providerId: idField, accountId: idField },
  "/refresh-token": {
    providerId: idField,
    accountId: idField,
    userId: idField,
  },
  "/get-access-token": {
    providerId: idField,
    accountId: idField,
    userId: idField,
  },
};

/** Redirect fields validated on every endpoint, on top of better-auth's own trustedOrigins check. */
const ANY_PATH_FIELD_VALIDATORS: Record<string, FieldValidator> = {
  callbackURL: {
    schema: callbackUrlSchema,
    message: "URL de redirection invalide.",
  },
  newUserCallbackURL: {
    schema: callbackUrlSchema,
    message: "URL de redirection invalide.",
  },
  errorCallbackURL: {
    schema: callbackUrlSchema,
    message: "URL de redirection invalide.",
  },
  redirectTo: {
    schema: callbackUrlSchema,
    message: "URL de redirection invalide.",
  },
};

/**
 * Validates a body field with the given schema and returns the parsed value
 * (including `trim` normalization); throws a 400 `APIError` on failure.
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
      const body = ctx.body as Record<string, unknown> | undefined;
      if (!body || typeof body !== "object") return;

      const fieldValidators = {
        ...ANY_PATH_FIELD_VALIDATORS,
        ...PATH_FIELD_VALIDATORS[ctx.path],
      };

      for (const [field, { schema, message }] of Object.entries(
        fieldValidators,
      )) {
        const value = body[field];
        if (value === undefined || value === null) continue;
        body[field] = parseBodyField(schema, value, message);
      }
    }),
  },
});
