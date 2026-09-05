import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const CreateApplicationSchema = z
  .object({
    listingId: z.cuid().describe("Id of the replacement listing (Prisma cuid)"),
    message: z
      .string()
      .trim()
      .min(1)
      .max(2000)
      .optional()
      .describe("Optional message to the practice owner"),
  })
  .strict();

export class CreateApplicationDto extends createZodDto(
  CreateApplicationSchema,
) {}
