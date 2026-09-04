import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { jwt, openAPI } from "better-auth/plugins";
import { emailVerificationStatusPlugin } from "./auth/email-verification-status";
import { sendResetPasswordEmail, sendVerificationEmail } from "./email";
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
});
