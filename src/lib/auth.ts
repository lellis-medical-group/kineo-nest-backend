import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createPrismaClient } from "./prisma";

const prisma = createPrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  secret: process.env.BETTER_AUTH_SECRET,

  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    autoSignIn: true,

    sendResetPassword: async ({ user, url, token }) => {
      console.log(`Reset password URL for ${user.email}: ${url}`);
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }) => {
      console.log(`Verification URL for ${user.email}: ${url}`);
    },
    autoSignInAfterVerification: true,
  },

  experimental: {
    joins: true,
  },
});