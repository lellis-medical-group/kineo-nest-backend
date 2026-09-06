import { z } from "zod";

/**
 * Zod schemas for user-controlled better-auth fields, enforced by the
 * `before` hook in `src/lib/auth.ts` (`/sign-up/email`, `/update-user`).
 */

/** Display name: Unicode letters, spaces, apostrophes, hyphens only; trimmed. */
export const nameSchema = z
  .string()
  .trim()
  .min(1)
  .max(50)
  .regex(/^[\p{L}\s'-]+$/u);

/** Profile image URL. HTTPS only: blocks `http:`, `data:`, `javascript:` and relative URLs. */
export const httpsImageUrlSchema = z.url({ protocol: /^https$/ });

/** Plaintext password. Keep in sync with `emailAndPassword.min/maxPasswordLength` in `src/lib/auth.ts`. */
export const passwordSchema = z.string().min(8).max(128);
