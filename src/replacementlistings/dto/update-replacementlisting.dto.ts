import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { Specialty } from "../../generated/prisma/enums";

export const UpdateReplacementListingSchema = z
  .object({
    startDate: z.iso
      .datetime()
      .optional()
      .describe("Start date of the replacement period (ISO 8601)"),
    endDate: z.iso
      .datetime()
      .optional()
      .describe("End date of the replacement period (ISO 8601)"),
    specialty: z
      .enum(Specialty)
      .optional()
      .describe("Medical specialty required for this replacement"),
    urgent: z
      .boolean()
      .optional()
      .describe("Marks the listing as a last-minute urgent replacement"),
    description: z
      .string()
      .max(2000)
      .optional()
      .describe("Free text details about the replacement"),
    maxApplications: z
      .number()
      .int()
      .positive()
      .max(100)
      .optional()
      .describe("Optional cap on the number of active applications"),
  })
  .superRefine((data, ctx) => {
    if (
      data.startDate &&
      data.endDate &&
      new Date(data.startDate) >= new Date(data.endDate)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "startDate must be before endDate",
        path: ["endDate"],
      });
    }
  });

export class UpdateReplacementListingDto extends createZodDto(
  UpdateReplacementListingSchema,
) {}
