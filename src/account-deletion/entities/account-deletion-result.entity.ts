import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const AccountDeletionResultSchema = z
  .object({
    success: z.literal(true).describe("Account and data hard-deleted"),
    message: z
      .literal("Account deleted")
      .describe("Confirmation message of the deletion"),
  })
  .strict();

export class AccountDeletionResult extends createZodDto(
  AccountDeletionResultSchema,
) {}
