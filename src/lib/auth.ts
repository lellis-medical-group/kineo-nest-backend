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

      // Confirmation email before the hard delete: required for OAuth users
      // (no password) and safer for everyone. The generated `url` targets the
      // better-auth callback (`/api/auth/delete-user/callback`) which performs
      // the deletion when opened by the authenticated user.
      sendDeleteAccountVerification: async ({ user, url }) => {
        // Accountability trail (art. 5(2) GDPR): record the request before
        // any execution. Never blocks the deletion flow on a bookkeeping
        // failure — the sweep keeps the process resilient.
        try {
          await prisma.dataDeletionRequest.create({
            data: { userId: user.id, email: user.email },
          });
        } catch (error) {
          console.error("Failed to record data deletion request:", error);
        }

        await sendDeleteAccountEmail({
          email: user.email,
          name: user.name,
          url,
        });
      },

      // `verification` rows have no foreign key to `user`: without this
      // cleanup, tokens tied to the deleted identity (pending email
      // verification, password reset keyed by email, and unredeemed
      // delete-account tokens keyed by user id) would outlive the account.
      beforeDelete: async (user) => {
        // The partial unique index guarantees at most one pending row per
        // user, but updateMany keeps this idempotent.
        try {
          await prisma.dataDeletionRequest.updateMany({
            where: { userId: user.id, status: "PENDING" },
            data: { status: "EXECUTED", executedAt: new Date() },
          });
        } catch (error) {
          console.error("Failed to mark data deletion request executed:", error);
        }

        // `verification` rows have no foreign key to `user`: without this
        // cleanup, tokens tied to the deleted identity (pending email
        // verification, password reset keyed by email, and unredeemed
        // delete-account tokens keyed by user id) would outlive the account.
        await prisma.verification.deleteMany({
          where: {
            OR: [
              { identifier: user.email },
              {
                identifier: { startsWith: "delete-account-" },
                value: user.id,
              },
            ],
          },
        });
      },

      afterDelete: async (user) => {
        console.log(`User account permanently deleted: ${user.id}`);
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
