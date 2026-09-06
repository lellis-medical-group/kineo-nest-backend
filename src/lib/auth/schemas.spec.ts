import { describe, expect, it } from "bun:test";
import { httpsImageUrlSchema, nameSchema, passwordSchema } from "./schemas";

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
