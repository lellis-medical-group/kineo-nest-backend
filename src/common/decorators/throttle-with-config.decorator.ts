import { applyDecorators, SetMetadata } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import configuration from "../../config/configuration";

const config = configuration();

/**
 * Custom decorator that applies throttling based on the application configuration.
 * Uses the throttle settings defined in config/configuration.ts which reads from environment variables.
 *
 * @param throttleName - The name of the throttle tier to use ("short", "medium", or "long")
 */
export function ThrottleWithConfig(
  throttleName: "short" | "medium" | "long",
) {
  const throttleConfig = config.throttle[throttleName];

  return applyDecorators(
    SetMetadata("throttleName", throttleName),
    Throttle({ [throttleName]: { limit: throttleConfig.limit, ttl: throttleConfig.ttl } }),
  );
}
