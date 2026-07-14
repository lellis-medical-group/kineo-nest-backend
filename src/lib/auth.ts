import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createPrismaClient } from "./prisma";
import { jwt } from "better-auth/plugins"

const prisma = createPrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  plugins: [jwt()],
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