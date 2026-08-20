function positiveInteger(
  value: string | undefined,
  fallback: number,
  name: string,
): number {
  const parsed = Number(value ?? fallback);

  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }

  return parsed;
}

function optionalPositiveInteger(
  value: string | undefined,
  name: string,
): number | undefined {
  if (!value) {
    return undefined;
  }

  return positiveInteger(value, 1, name);
}

export default () => ({
  port: positiveInteger(process.env.PORT, 3000, "PORT"),

  cors: {
    origins: (process.env.TRUSTED_ORIGINS ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
    credentials: true,
  },

  trustProxy: process.env.TRUST_PROXY === "true",

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

  limits: {
    practicesPerProfile: optionalPositiveInteger(
      process.env.MAX_PRACTICES_PER_PROFILE,
      "MAX_PRACTICES_PER_PROFILE",
    ),
    activeListingsPerProfile: optionalPositiveInteger(
      process.env.MAX_ACTIVE_LISTINGS_PER_PROFILE,
      "MAX_ACTIVE_LISTINGS_PER_PROFILE",
    ),
    activeApplicationsPerProfile: optionalPositiveInteger(
      process.env.MAX_ACTIVE_APPLICATIONS_PER_PROFILE,
      "MAX_ACTIVE_APPLICATIONS_PER_PROFILE",
    ),
  },

  swagger: {
    title: "Kineo API",
    description: "Kineo API documentation",
    version: "1.0",
    tag: "Kineo",
  },
});
