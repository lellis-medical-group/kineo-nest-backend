import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { jwt, openAPI } from "better-auth/plugins";
import { emailVerificationStatusPlugin } from "./auth/email-verification-status";
import { inputValidationHook } from "./auth/input-validation";
import {
  sendChangeEmailEmail,
  sendDeleteAccountEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
} from "./email";
import { buildFrontendAuthUrl } from "./email/links";
import { logError } from "./log";
import { createPrismaClient } from "./prisma";

const prisma = createPrismaClient();

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET is not set");
}

const jwtEnabled = process.env.JWT_ENABLED === "true";

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

  user: {
    // Email self-service (right to rectification, art. 16 GDPR): the
    // confirmation email goes to the NEW address, so only someone controlling
    // it can apply the change.
    changeEmail: {
      enabled: true,

      sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
        await sendChangeEmailEmail({
          email: newEmail,
          name: user.name,
          url: buildFrontendAuthUrl(url, "/verify-email", {
            email: newEmail,
          }),
        });
      },
    },

    deleteUser: {
      enabled: true,

      // The deletion verification token lives 24h in the `verification` table
      // (identifier: `delete-account-<token>`, value: user id).
      deleteTokenExpiresIn: 60 * 60 * 24,

      // Better-auth is limited to the REQUEST phase: mint the single-use token
      // and email the confirmation link (frontend `/goodbye`). The hard delete
      // itself is done by `POST /account/confirm-deletion`
      // (AccountDeletionService): it consumes the token without requiring a
      // session, performs the audit tracking (DataDeletionRequest -> EXECUTED)
      // and purges `verification` leftovers, all in one transaction. The
      // deletion callbacks (beforeDelete/afterDelete) are intentionally NOT
      // wired here — better-auth never deletes the user in this flow, so they
      // would be dead code.
      sendDeleteAccountVerification: async ({ user, url }) => {
        // Accountability trail (art. 5(2) GDPR): record the request before
        // any execution. Never blocks the deletion flow on a bookkeeping
        // failure — the hourly sweep keeps the process resilient.
        try {
          await prisma.dataDeletionRequest.create({
            data: { userId: user.id, email: user.email },
          });
        } catch (error) {
          logError("account.deletion.request.audit_failed", error, {
            userId: user.id,
          });
        }

        await sendDeleteAccountEmail({
          email: user.email,
          name: user.name,
          url: buildFrontendAuthUrl(url, "/goodbye"),
        });
      },
    },
  },

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
    before: inputValidationHook,
  },
});
