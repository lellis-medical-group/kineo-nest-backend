import { describe, expect, it } from "bun:test";
import { CreateReplacementListingSchema } from "./create-replacementlisting.dto";
import { FindReplacementListingsSchema } from "./find-replacementlistings.dto";
import { UpdateReplacementListingSchema } from "./update-replacementlisting.dto";

const validListing = {
  practiceId: "clh8zq6w70000wqf4vlonix5a",
  startDate: "2026-09-10T08:00:00.000Z",
  endDate: "2026-09-12T08:00:00.000Z",
  specialty: "GENERALIST",
};

describe("ReplacementListing DTO security", () => {
  describe("CreateReplacementListingSchema", () => {
    it("accepts a valid listing", () => {
      expect(
        CreateReplacementListingSchema.safeParse(validListing).success,
      ).toBe(true);
    });

    it("rejects unknown keys (mass-assignment protection)", () => {
      const result = CreateReplacementListingSchema.safeParse({
        ...validListing,
        status: "OPEN",
        createdById: "profile-1",
      });
      expect(result.success).toBe(false);
    });

    it("rejects a practiceId that is not a Prisma cuid", () => {
      expect(
        CreateReplacementListingSchema.safeParse({
          ...validListing,
          practiceId: "not-a-cuid",
        }).success,
      ).toBe(false);
    });

    it("requires startDate to be before endDate", () => {
      expect(
        CreateReplacementListingSchema.safeParse({
          ...validListing,
          startDate: "2026-09-12T08:00:00.000Z",
          endDate: "2026-09-10T08:00:00.000Z",
        }).success,
      ).toBe(false);
    });

    it("trims and bounds the description", () => {
      const result = CreateReplacementListingSchema.safeParse({
        ...validListing,
        description: "  Remplacement du mois de septembre.  ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe(
          "Remplacement du mois de septembre.",
        );
      }

      expect(
        CreateReplacementListingSchema.safeParse({
          ...validListing,
          description: "   ",
        }).success,
      ).toBe(false);
    });

    it("rejects a fractional maxApplications", () => {
      expect(
        CreateReplacementListingSchema.safeParse({
          ...validListing,
          maxApplications: 2.5,
        }).success,
      ).toBe(false);
    });
  });

  describe("UpdateReplacementListingSchema", () => {
    it("rejects unknown keys", () => {
      expect(
        UpdateReplacementListingSchema.safeParse({
          status: "OPEN",
        }).success,
      ).toBe(false);
    });

    it("accepts partial updates", () => {
      expect(
        UpdateReplacementListingSchema.safeParse({ urgent: true }).success,
      ).toBe(true);
      expect(UpdateReplacementListingSchema.safeParse({}).success).toBe(true);
    });

    it("validates date order when both dates are updated", () => {
      expect(
        UpdateReplacementListingSchema.safeParse({
          startDate: "2026-10-01T08:00:00.000Z",
          endDate: "2026-09-01T08:00:00.000Z",
        }).success,
      ).toBe(false);
    });
  });

  describe("FindReplacementListingsSchema", () => {
    it("rejects unknown query parameters", () => {
      expect(
        FindReplacementListingsSchema.safeParse({ status: "OPEN" }).success,
      ).toBe(false);
    });

    it("accepts known filters", () => {
      const result = FindReplacementListingsSchema.safeParse({
        specialty: "DENTIST",
        city: " Lyon ",
        urgent: "true",
        page: "2",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.city).toBe("Lyon");
        expect(result.data.page).toBe(2);
      }
    });

    it("rejects an inverted date range", () => {
      expect(
        FindReplacementListingsSchema.safeParse({
          startDateFrom: "2026-10-01T00:00:00.000Z",
          startDateTo: "2026-09-01T00:00:00.000Z",
        }).success,
      ).toBe(false);
    });
  });
});
