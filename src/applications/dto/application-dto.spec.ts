import { describe, expect, it } from "bun:test";
import { CreateApplicationSchema } from "./create-application.dto";
import { FindApplicationsSchema } from "./find-applications.dto";
import { RejectApplicationSchema } from "./reject-application.dto";
import { UpdateApplicationSchema } from "./update-application.dto";
import { WithdrawApplicationSchema } from "./withdraw-application.dto";

const LISTING_CUID = "clh8zq6w70000wqf4vlonix5a";

describe("Application DTO security", () => {
  describe("CreateApplicationSchema", () => {
    it("accepts a valid application", () => {
      expect(
        CreateApplicationSchema.safeParse({ listingId: LISTING_CUID }).success,
      ).toBe(true);
    });

    it("rejects unknown keys (mass-assignment protection)", () => {
      const result = CreateApplicationSchema.safeParse({
        listingId: LISTING_CUID,
        status: "ACCEPTED",
        applicantId: "profile-1",
      });
      expect(result.success).toBe(false);
    });

    it("rejects a listingId that is not a Prisma cuid", () => {
      expect(
        CreateApplicationSchema.safeParse({
          listingId: "not-a-cuid",
        }).success,
      ).toBe(false);
    });

    it("trims and bounds the message", () => {
      const result = CreateApplicationSchema.safeParse({
        listingId: LISTING_CUID,
        message: "  Bonjour, je suis disponible.  ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.message).toBe("Bonjour, je suis disponible.");
      }

      expect(
        CreateApplicationSchema.safeParse({
          listingId: LISTING_CUID,
          message: "   ",
        }).success,
      ).toBe(false);

      expect(
        CreateApplicationSchema.safeParse({
          listingId: LISTING_CUID,
          message: "x".repeat(2001),
        }).success,
      ).toBe(false);
    });
  });

  describe("UpdateApplicationSchema", () => {
    it("rejects unknown keys", () => {
      expect(
        UpdateApplicationSchema.safeParse({
          message: "New message",
          status: "WITHDRAWN",
        }).success,
      ).toBe(false);
    });

    it("requires a non-empty trimmed message", () => {
      expect(
        UpdateApplicationSchema.safeParse({ message: "  Updated  " }).success,
      ).toBe(true);
      expect(
        UpdateApplicationSchema.safeParse({ message: "   " }).success,
      ).toBe(false);
      expect(UpdateApplicationSchema.safeParse({}).success).toBe(false);
    });
  });

  describe("RejectApplicationSchema", () => {
    it("rejects unknown keys and trims the reason", () => {
      expect(
        RejectApplicationSchema.safeParse({
          rejectionReason: "Pas disponible",
          respondedAt: "2026-09-01T00:00:00.000Z",
        }).success,
      ).toBe(false);

      const result = RejectApplicationSchema.safeParse({
        rejectionReason: "  Pas disponible  ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.rejectionReason).toBe("Pas disponible");
      }
    });
  });

  describe("WithdrawApplicationSchema", () => {
    it("rejects unknown keys and trims the reason", () => {
      expect(
        WithdrawApplicationSchema.safeParse({
          withdrawnReason: "Autre opportunité",
          status: "WITHDRAWN",
        }).success,
      ).toBe(false);

      const result = WithdrawApplicationSchema.safeParse({
        withdrawnReason: " Autre opportunité ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.withdrawnReason).toBe("Autre opportunité");
      }
    });
  });

  describe("FindApplicationsSchema", () => {
    it("rejects unknown query parameters", () => {
      expect(
        FindApplicationsSchema.safeParse({ applicantId: "profile-1" }).success,
      ).toBe(false);
    });

    it("accepts known filters and coerces integer pagination", () => {
      const result = FindApplicationsSchema.safeParse({
        listingId: LISTING_CUID,
        status: "PENDING",
        page: "2",
        limit: "25",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(25);
      }
    });

    it("rejects a non-cuid listingId filter", () => {
      expect(
        FindApplicationsSchema.safeParse({ listingId: "nope" }).success,
      ).toBe(false);
    });
  });
});
