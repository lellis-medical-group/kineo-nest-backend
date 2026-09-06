import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { textField } from "../../common/validation/text";

export const CreateApplicationSchema = z
  .object({
    listingId: z.cuid().describe("Id of the replacement listing (Prisma cuid)"),
    message: textField(2000, "Message")
      .optional()
      .describe("Optional message to the practice owner"),
  })
  .strict();

export class CreateApplicationDto extends createZodDto(
  CreateApplicationSchema,
) {}
