import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const WithdrawApplicationSchema = z
  .object({
    withdrawnReason: z
      .string()
      .trim()
      .min(1)
      .max(500)
      .optional()
      .describe("Optional reason for withdrawing"),
  })
  .strict();

export class WithdrawApplicationDto extends createZodDto(
  WithdrawApplicationSchema,
) {}
