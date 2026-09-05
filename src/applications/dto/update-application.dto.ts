import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const UpdateApplicationSchema = z
  .object({
    message: z
      .string()
      .trim()
      .min(1)
      .max(2000)
      .describe(
        "Updated message, only editable while the application is pending",
      ),
  })
  .strict();

export class UpdateApplicationDto extends createZodDto(
  UpdateApplicationSchema,
) {}
