import { afterEach, describe, expect, it } from "bun:test";

import { buildFrontendAuthUrl } from "./links";

const originalFrontendUrl = process.env.FRONTEND_URL;

afterEach(() => {
  if (originalFrontendUrl === undefined) {
    delete process.env.FRONTEND_URL;
  } else {
    process.env.FRONTEND_URL = originalFrontendUrl;
  }
});

describe("buildFrontendAuthUrl", () => {
  it("rewrites a verification URL to the frontend /verify-email page", () => {
    process.env.FRONTEND_URL = "http://localhost:3001";

    const url = buildFrontendAuthUrl(
      "http://localhost:3000/api/auth/verify-email?token=jwt-token&callbackURL=%2F",
      "/verify-email",
    );

    expect(url).toBe(
      "http://localhost:3001/verify-email?token=jwt-token&callbackURL=%2F",
    );
  });

  it("rewrites a reset-password URL whose token is in the path", () => {
    process.env.FRONTEND_URL = "http://localhost:3001";

    const url = buildFrontendAuthUrl(
      "http://localhost:3000/api/auth/reset-password/jwt-token?callbackURL=%2Freset-password",
      "/reset-password",
    );

    expect(url).toBe(
      "http://localhost:3001/reset-password?token=jwt-token&callbackURL=%2Freset-password",
    );
  });

  it("supports an unencoded callbackURL parameter", () => {
    process.env.FRONTEND_URL = "http://localhost:3001";

    const url = buildFrontendAuthUrl(
      "http://localhost:3000/api/auth/verify-email?token=jwt-token&callbackURL=/",
      "/verify-email",
    );

    expect(url).toBe(
      "http://localhost:3001/verify-email?token=jwt-token&callbackURL=%2F",
    );
  });

  it("normalizes a trailing slash on FRONTEND_URL", () => {
    process.env.FRONTEND_URL = "http://localhost:3001/";

    const url = buildFrontendAuthUrl(
      "http://localhost:3000/api/auth/verify-email?token=jwt-token",
      "/verify-email",
    );

    expect(url).toBe("http://localhost:3001/verify-email?token=jwt-token");
  });

  it("falls back to the default frontend origin when FRONTEND_URL is unset", () => {
    delete process.env.FRONTEND_URL;

    const url = buildFrontendAuthUrl(
      "http://localhost:3000/api/auth/verify-email?token=jwt-token",
      "/verify-email",
    );

    expect(url).toBe("http://localhost:3001/verify-email?token=jwt-token");
  });

  it("falls back to the frontend page when the server URL is invalid", () => {
    process.env.FRONTEND_URL = "http://localhost:3001";

    const url = buildFrontendAuthUrl("not-a-url", "/verify-email");

    expect(url).toBe("http://localhost:3001/verify-email");
  });

  it("appends extra params such as the account email", () => {
    process.env.FRONTEND_URL = "http://localhost:3001";

    const url = buildFrontendAuthUrl(
      "http://localhost:3000/api/auth/verify-email?token=jwt-token&callbackURL=%2F",
      "/verify-email",
      { email: "user@example.com" },
    );

    expect(url).toBe(
      "http://localhost:3001/verify-email?token=jwt-token&callbackURL=%2F&email=user%40example.com",
    );
  });
});
