import { z } from "zod";

function positiveInteger(
  value: string | undefined,
  fallback: number,
  name: string,
): number {
  if (value === undefined) {
    return fallback;
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer, got: ${value}`);
  }
  return parsed;
}

function positiveIntegerOrUndefined(
  value: string | undefined,
  fallback: number,
  name: string,
): number | undefined {
  if (value === undefined || value === "") {
    return undefined;
  }
  return positiveInteger(value, fallback, name);
}

/** Duration in seconds for a suffix like "15m", "1h", "7d". */
function durationSeconds(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const match = /^(\d+)\s*(ms|s|m|h|d|w)$/i.exec(raw.trim());
  if (!match) return fallback;
  const value = Number(match[1]);
  const unit = match[2].toLowerCase() as keyof {
    ms: number;
    s: number;
    m: number;
    h: number;
    d: number;
    w: number;
  };
  const multipliers: Record<string, number> = {
    ms: 1,
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
    w: 604800,
  };
  if (!Number.isSafeInteger(value) || value <= 0) return fallback;
  return value * multipliers[unit];
}

export default () => ({
  // ---- Server ----
  port: positiveInteger(process.env.PORT, 3000, "PORT"),

  // ---- CORS ----
  cors: {
    origins: (process.env.TRUSTED_ORIGINS ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
    credentials: true,
  },

  trustProxy: process.env.TRUST_PROXY === "true",

  // ---- Throttler (NestJS ThrottlerModule) ----
  throttle: {
    short: {
      ttl: 1_000,
      limit: positiveInteger(
        process.env.THROTTLE_SHORT_LIMIT,
        5,
        "THROTTLE_SHORT_LIMIT",
      ),
    },
    medium: {
      ttl: 10_000,
      limit: positiveInteger(
        process.env.THROTTLE_MEDIUM_LIMIT,
        30,
        "THROTTLE_MEDIUM_LIMIT",
      ),
    },
    long: {
      ttl: 60_000,
      limit: positiveInteger(
        process.env.THROTTLE_LONG_LIMIT,
        150,
        "THROTTLE_LONG_LIMIT",
      ),
    },
  },

  // ---- Rate limiting (better-auth internal, separate from ThrottlerModule) ----
  rateLimit: {
    window: positiveInteger(
      process.env.RATE_LIMIT_WINDOW,
      60,
      "RATE_LIMIT_WINDOW",
    ),
    max: positiveInteger(process.env.RATE_LIMIT_MAX, 20, "RATE_LIMIT_MAX"),
  },

  // ---- Session (better-auth) ----
  session: {
    expiresIn: durationSeconds(
      process.env.SESSION_EXPIRES_IN,
      60 * 60 * 24 * 7, // 7 days
    ),
    updateAge: durationSeconds(
      process.env.SESSION_UPDATE_AGE,
      60 * 60 * 24, // 1 day
    ),
    cookieCache: {
      enabled: process.env.COOKIE_CACHE_ENABLED !== "false",
      maxAge: positiveInteger(
        process.env.COOKIE_CACHE_MAX_AGE,
        300,
        "COOKIE_CACHE_MAX_AGE",
      ),
    },
  },

  // ---- JWT (better-auth, optional) ----
  jwt: {
    enabled: process.env.JWT_ENABLED === "true",
    expirationTime: process.env.JWT_EXPIRATION_TIME || "15m",
    rotationIntervalSeconds: process.env.JWT_ROTATION_INTERVAL
      ? Number(process.env.JWT_ROTATION_INTERVAL)
      : undefined,
  },

  // ---- Email (SMTP / nodemailer) ----
  smtp: {
    host: process.env.SMTP_HOST || "localhost",
    port: positiveInteger(process.env.SMTP_PORT, 1025, "SMTP_PORT"),
    secure: process.env.SMTP_SECURE === "true",
    from: process.env.SMTP_FROM || "noreply@localhost",
    user: process.env.SMTP_USER || undefined,
    pass: process.env.SMTP_PASS || undefined,
  },

  // ---- Auth ----
  requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION === "true",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3001",

  // ---- Data lifecycle ----
  dataDeletionRequestRetentionDays: (() => {
    const raw = process.env.DATA_DELETION_REQUEST_RETENTION_DAYS;
    if (!raw) return 365;
    const parsed = Number(raw);
    if (!Number.isSafeInteger(parsed) || parsed <= 0) {
      throw new Error(
        "DATA_DELETION_REQUEST_RETENTION_DAYS must be a positive integer",
      );
    }
    return parsed;
  })(),

  // ---- Swagger (peuvent être surchargés par env si nécessaire) ----
  swagger: {
    title: "Kineo API",
    description: "Kineo API documentation",
    version: "1.0",
    tag: "Kineo",
  },
});

// ============================================================
// Schéma de validation des variables d'environnement (Zod)
// ============================================================
// Utilisé par ConfigModule.withForRoot({ validationSchema }) pour valider
// que toutes les variables requises sont présentes et correctement
// typées au démarrage de l'application.
//
// Les variables marquées comme "required" (sans .default()) font
// échouer le bootstrap si elles sont manquantes ou invalides.
// ============================================================

// Environment variable validation schema (Zod).
// Used by ConfigModule.forRoot({ validationSchema }) to validate that all
// required environment variables are present and correctly typed at startup.
//
// Required variables (no .default()) cause bootstrap to fail if missing or invalid.

const BoolEnum = z.enum(["true", "false"]);
const NodeEnvEnum = z.enum(["development", "production", "test", "provision"]);

export const envValidationSchema = z
  .object({
    // ---- Critical (required, no fallback) ----
    BETTER_AUTH_SECRET: z.string().min(1),
    DATABASE_URL: z.string().min(1),

    // ---- Server ----
    PORT: z.coerce.number().int().positive().max(65535).default(3000),
    NODE_ENV: NodeEnvEnum.default("development"),

    // ---- CORS / Frontend ----
    TRUSTED_ORIGINS: z.string().default(""),
    FRONTEND_URL: z.string().url().default("http://localhost:3001"),

    // ---- Proxy ----
    TRUST_PROXY: BoolEnum.default("false"),

    // ---- Throttler (NestJS ThrottlerModule) ----
    THROTTLE_SHORT_LIMIT: z.coerce.number().int().positive().default(5),
    THROTTLE_MEDIUM_LIMIT: z.coerce.number().int().positive().default(30),
    THROTTLE_LONG_LIMIT: z.coerce.number().int().positive().default(150),

    // ---- Rate limiting (better-auth) ----
    RATE_LIMIT_WINDOW: z.coerce.number().int().positive().default(60),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),

    // ---- Session (better-auth) ----
    SESSION_EXPIRES_IN: z.string().default("604800"),
    SESSION_UPDATE_AGE: z.string().default("86400"),
    COOKIE_CACHE_ENABLED: BoolEnum.default("true"),
    COOKIE_CACHE_MAX_AGE: z.coerce.number().int().positive().default(300),

    // ---- JWT (better-auth, optional) ----
    JWT_ENABLED: BoolEnum.default("false"),
    JWT_EXPIRATION_TIME: z.string().default("15m"),
    JWT_ROTATION_INTERVAL: z.coerce.number().int().positive().optional(),

    // ---- Email SMTP ----
    SMTP_HOST: z.string().default("localhost"),
    SMTP_PORT: z.coerce.number().int().positive().max(65535).default(1025),
    SMTP_SECURE: BoolEnum.default("false"),
    SMTP_FROM: z.string().default("noreply@localhost"),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),

    // ---- OAuth providers (reserved for future use) ----
    // @todo Remove or implement when OAuth auth is enabled
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),

    // ---- External email provider (reserved for future use) ----
    // @todo Remove or implement when Resend is enabled
    RESEND_API_KEY: z.string().optional(),

    // ---- Business constraints ----
    MAX_PRACTICES_PER_PROFILE: z.coerce.number().int().positive().optional(),
    MAX_ACTIVE_LISTINGS_PER_PROFILE: z.coerce
      .number()
      .int()
      .positive()
      .optional(),
    MAX_ACTIVE_APPLICATIONS_PER_PROFILE: z.coerce
      .number()
      .int()
      .positive()
      .optional(),

    // ---- Data lifecycle ----
    DATA_DELETION_REQUEST_RETENTION_DAYS: z.coerce
      .number()
      .int()
      .positive()
      .optional(),

    // ---- Auth ----
    REQUIRE_EMAIL_VERIFICATION: BoolEnum.default("false"),
  })
  .passthrough(); // ignores unexpected process.env variables (PATH, HOME, etc.)
