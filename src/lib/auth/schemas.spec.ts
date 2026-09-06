import { describe, expect, it } from "bun:test";
import {
  callbackUrlSchema,
  emailSchema,
  httpsImageUrlSchema,
  nameSchema,
  passwordInputSchema,
  passwordSchema,
  tokenSchema,
} from "./schemas";

describe("nameSchema", () => {
  it("accepts and trims a valid name", () => {
    expect(nameSchema.parse("  Jean Dupont  ")).toBe("Jean Dupont");
  });

  it("accepts accented letters, apostrophes, hyphens and spaces", () => {
    expect(nameSchema.parse("Marie-Hélène O'Néill")).toBe(
      "Marie-Hélène O'Néill",
    );
  });

  it("rejects empty or whitespace-only names", () => {
    expect(nameSchema.safeParse("").success).toBe(false);
    expect(nameSchema.safeParse("   ").success).toBe(false);
  });

  it("rejects digits, emoji and control characters", () => {
    expect(nameSchema.safeParse("Jean123").success).toBe(false);
    expect(nameSchema.safeParse("Jean\u0000").success).toBe(false);
    expect(nameSchema.safeParse("👋").success).toBe(false);
  });

  it("rejects names longer than 50 characters", () => {
    expect(nameSchema.safeParse("a".repeat(50)).success).toBe(true);
    expect(nameSchema.safeParse("a".repeat(51)).success).toBe(false);
  });
});

describe("httpsImageUrlSchema", () => {
  it("accepts https URLs", () => {
    expect(httpsImageUrlSchema.parse("https://example.com/avatar.png")).toBe(
      "https://example.com/avatar.png",
    );
  });

  it("rejects http, other protocols, relative paths and plain text", () => {
    expect(
      httpsImageUrlSchema.safeParse("http://example.com/a.png").success,
    ).toBe(false);
    expect(httpsImageUrlSchema.safeParse("javascript:alert(1)").success).toBe(
      false,
    );
    expect(httpsImageUrlSchema.safeParse("/relative/path.png").success).toBe(
      false,
    );
    expect(httpsImageUrlSchema.safeParse("not a url").success).toBe(false);
  });
});

describe("passwordSchema", () => {
  it("accepts passwords between 8 and 128 characters", () => {
    expect(passwordSchema.safeParse("passw0rd!").success).toBe(true);
    expect(passwordSchema.safeParse("a".repeat(128)).success).toBe(true);
  });

  it("rejects passwords shorter than 8 or longer than 128 characters", () => {
    expect(passwordSchema.safeParse("a".repeat(7)).success).toBe(false);
    expect(passwordSchema.safeParse("a".repeat(129)).success).toBe(false);
  });
});

describe("passwordInputSchema", () => {
  it("accepts short input: no strength rule on verification paths", () => {
    expect(passwordInputSchema.safeParse("a").success).toBe(true);
    expect(passwordInputSchema.safeParse("a".repeat(128)).success).toBe(true);
  });

  it("rejects input longer than 128 characters", () => {
    expect(passwordInputSchema.safeParse("a".repeat(129)).success).toBe(false);
  });
});

describe("emailSchema", () => {
  it("trims and lowercases email input", () => {
    expect(emailSchema.parse("  Jean@Example.COM ")).toBe("jean@example.com");
  });

  it("accepts any string shape: format is better-auth's responsibility", () => {
    expect(emailSchema.safeParse("not-an-email").success).toBe(true);
  });

  it("rejects emails longer than 254 characters", () => {
    expect(emailSchema.safeParse("a".repeat(254)).success).toBe(true);
    expect(emailSchema.safeParse("a".repeat(255)).success).toBe(false);
  });
});

describe("tokenSchema", () => {
  it("trims and accepts normal tokens", () => {
    expect(tokenSchema.parse("  tok_abc123  ")).toBe("tok_abc123");
  });

  it("rejects empty, whitespace-only and oversized tokens", () => {
    expect(tokenSchema.safeParse("").success).toBe(false);
    expect(tokenSchema.safeParse("   ").success).toBe(false);
    expect(tokenSchema.safeParse("a".repeat(512)).success).toBe(true);
    expect(tokenSchema.safeParse("a".repeat(513)).success).toBe(false);
  });
});

describe("callbackUrlSchema", () => {
  it("accepts absolute https URLs and relative paths, trimmed", () => {
    expect(
      callbackUrlSchema.parse(" https://app.example.com/auth/callback "),
    ).toBe("https://app.example.com/auth/callback");
    expect(callbackUrlSchema.parse("/reset-password?token=abc")).toBe(
      "/reset-password?token=abc",
    );
  });

  it("rejects control characters including CRLF", () => {
    expect(callbackUrlSchema.safeParse("/x\r\nEvil: 1").success).toBe(false);
    expect(callbackUrlSchema.safeParse("/x\ny").success).toBe(false);
    expect(callbackUrlSchema.safeParse("https://a.com/\u0000").success).toBe(
      false,
    );
  });

  it("rejects URLs longer than 2048 characters", () => {
    expect(callbackUrlSchema.safeParse(`/${"a".repeat(2047)}`).success).toBe(
      true,
    );
    expect(callbackUrlSchema.safeParse(`/${"a".repeat(2048)}`).success).toBe(
      false,
    );
  });
});
