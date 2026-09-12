import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { tokenSchema } from "../../lib/auth/schemas";

export const ConfirmAccountDeletionSchema = z
  .object({
    token: tokenSchema.describe(
      "Single-use deletion confirmation token from the email link",
    ),
  })
  .strict();

export class ConfirmAccountDeletionDto extends createZodDto(
  ConfirmAccountDeletionSchema,
) {}
