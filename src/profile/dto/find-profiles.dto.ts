import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { ProfileType, Specialty } from "../../generated/prisma/enums";

export const FindProfilesSchema = z
  .object({
    specialty: z
      .enum(Specialty)
      .optional()
      .describe("Filter by medical specialty"),
    profileType: z
      .enum(ProfileType)
      .optional()
      .describe("Filter by profile status"),
    city: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .optional()
      .describe("Filter by city"),
    page: z.coerce
      .number()
      .int()
      .min(1)
      .max(10000)
      .default(1)
      .describe("Page number, starting at 1"),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(20)
      .describe("Number of results per page, max 100"),
  })
  .strict()
  .refine((data) => data.page * data.limit <= 10_000, {
    message:
      "page and limit combination is too large (no more than 10,000 results can be requested)",
    path: ["page"],
  });

export class FindProfilesDto extends createZodDto(FindProfilesSchema) {}
