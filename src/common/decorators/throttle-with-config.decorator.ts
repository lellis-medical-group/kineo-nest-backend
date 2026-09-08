import { applyDecorators } from "@nestjs/common";
import { SkipThrottle, Throttle } from "@nestjs/throttler";
import configuration from "../../config/configuration";

const config = configuration();

/**
 * Custom decorator that applies throttling based on the application configuration.
 * Uses the throttle settings defined in config/configuration.ts which reads from environment variables.
 *
 * The ThrottlerGuard applies ALL configured throttlers (short, medium, long) to every
 * request. To test a single tier in isolation, this decorator skips the other two
 * throttlers for the target route and only applies the requested one.
 *
 * @param throttleName - The name of the throttle tier to apply ("short", "medium", or "long")
 */
export function ThrottleWithConfig(
  throttleName: "short" | "medium" | "long",
) {
  const throttleConfig = config.throttle[throttleName];

  const skipOthers: Record<"short" | "medium" | "long", boolean> = {
    short: throttleName !== "short",
    medium: throttleName !== "medium",
    long: throttleName !== "long",
  };

  return applyDecorators(
    SkipThrottle(skipOthers),
    Throttle({
      [throttleName]: {
        limit: throttleConfig.limit,
        ttl: throttleConfig.ttl,
      },
    }),
  );
}
