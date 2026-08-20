import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const RejectApplicationSchema = z.object({
  rejectionReason: z
    .string()
    .max(500)
    .optional()
    .describe("Optional reason shared with the applicant"),
});

export class RejectApplicationDto extends createZodDto(
  RejectApplicationSchema,
) {}
