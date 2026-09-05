import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { ApplicationStatus } from "../../generated/prisma/enums";

export const FindApplicationsSchema = z
  .object({
    listingId: z
      .cuid()
      .optional()
      .describe("Filter by listing id (Prisma cuid)"),
    status: z
      .enum(ApplicationStatus)
      .optional()
      .describe("Filter by application status"),
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

export class FindApplicationsDto extends createZodDto(FindApplicationsSchema) {}
