import { describe, expect, it } from "bun:test";
import { CreateProfileSchema } from "./create-profile.dto";
import { FindProfilesSchema } from "./find-profiles.dto";
import { UpdateProfileSchema } from "./update-profile.dto";

describe("Profile DTO security", () => {
  describe("CreateProfileSchema", () => {
    it("accepts a minimal valid profile", () => {
      const result = CreateProfileSchema.safeParse({
        specialty: "GENERALIST",
        profileType: "BOTH",
      });
      expect(result.success).toBe(true);
    });

    it("rejects unknown keys (mass-assignment protection)", () => {
      const result = CreateProfileSchema.safeParse({
        specialty: "GENERALIST",
        profileType: "BOTH",
        verified: true,
        userId: "user-1",
      });
      expect(result.success).toBe(false);
    });

    it("trims string fields and validates the RPPS format", () => {
      const result = CreateProfileSchema.safeParse({
        specialty: "GENERALIST",
        profileType: "REPLACEMENT",
        rppsNumber: "  10000000001  ",
        city: "  Paris  ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.rppsNumber).toBe("10000000001");
        expect(result.data.city).toBe("Paris");
      }

      const invalidRpps = CreateProfileSchema.safeParse({
        specialty: "GENERALIST",
        profileType: "REPLACEMENT",
        rppsNumber: "123",
      });
      expect(invalidRpps.success).toBe(false);
    });

    it("rejects an empty or unsafe city value", () => {
      expect(
        CreateProfileSchema.safeParse({
          specialty: "GENERALIST",
          profileType: "BOTH",
          city: "<script>",
        }).success,
      ).toBe(false);
    });

    it("requires latitude and longitude together", () => {
      const single = CreateProfileSchema.safeParse({
        specialty: "GENERALIST",
        profileType: "BOTH",
        latitude: 48.8566,
      });
      expect(single.success).toBe(false);

      const both = CreateProfileSchema.safeParse({
        specialty: "GENERALIST",
        profileType: "BOTH",
        latitude: 48.8566,
        longitude: 2.3522,
      });
      expect(both.success).toBe(true);
    });
  });

  describe("UpdateProfileSchema", () => {
    it("rejects unknown keys", () => {
      const result = UpdateProfileSchema.safeParse({ verified: true });
      expect(result.success).toBe(false);
    });

    it("accepts an empty patch", () => {
      expect(UpdateProfileSchema.safeParse({}).success).toBe(true);
    });

    it("enforces lat/long pairing on partial updates", () => {
      expect(UpdateProfileSchema.safeParse({ longitude: 2.3522 }).success).toBe(
        false,
      );
      expect(UpdateProfileSchema.safeParse({ latitude: 48.8566 }).success).toBe(
        false,
      );
    });
  });

  describe("FindProfilesSchema", () => {
    it("rejects unknown query parameters", () => {
      expect(FindProfilesSchema.safeParse({ verified: "true" }).success).toBe(
        false,
      );
    });

    it("accepts known filters and coerces integer pagination", () => {
      const result = FindProfilesSchema.safeParse({
        specialty: "DENTIST",
        city: " Paris ",
        page: "2",
        limit: "50",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.city).toBe("Paris");
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(50);
      }
    });

    it("rejects non-integer pagination", () => {
      expect(FindProfilesSchema.safeParse({ page: "1.5" }).success).toBe(false);
    });
  });
});
