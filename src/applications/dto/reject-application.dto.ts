import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { textField } from "../../common/validation/text";

export const RejectApplicationSchema = z
  .object({
    rejectionReason: textField(500, "Rejection reason")
      .optional()
      .describe("Optional reason shared with the applicant"),
  })
  .strict();

export class RejectApplicationDto extends createZodDto(
  RejectApplicationSchema,
) {}
