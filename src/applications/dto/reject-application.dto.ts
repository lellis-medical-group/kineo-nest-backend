import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const RejectApplicationSchema = z
  .object({
    rejectionReason: z
      .string()
      .trim()
      .min(1)
      .max(500)
      .optional()
      .describe("Optional reason shared with the applicant"),
  })
  .strict();

export class RejectApplicationDto extends createZodDto(
  RejectApplicationSchema,
) {}
