import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { Specialty } from "../../generated/prisma/enums";

export const FindReplacementListingsSchema = z
  .object({
    specialty: z
      .enum(Specialty)
      .optional()
      .describe("Filter by medical specialty"),
    city: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .optional()
      .describe("Filter by practice city"),
    urgent: z.coerce
      .boolean()
      .optional()
      .describe("Filter urgent listings only"),
    startDateFrom: z.iso
      .datetime()
      .optional()
      .describe("Only listings starting on or after this date (ISO 8601)"),
    startDateTo: z.iso
      .datetime()
      .optional()
      .describe("Only listings starting on or before this date (ISO 8601)"),
    page: z.coerce
      .number()
      .int()
      .min(1)
      .max(10000)
      .default(1)
      .describe("Page number, starting at 1"),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(20)
      .describe("Number of results per page, max 100"),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (
      data.startDateFrom &&
      data.startDateTo &&
      new Date(data.startDateFrom) > new Date(data.startDateTo)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "startDateFrom must be on or before startDateTo",
        path: ["startDateTo"],
      });
    }
  });

export class FindReplacementListingsDto extends createZodDto(
  FindReplacementListingsSchema,
) {}
