import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { latLongsPaired } from "../../common/validation/lat-long";

export const CreatePracticeObjectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1)
      .max(200)
      .describe("Name of the practice or clinic"),
    address: z
      .string()
      .trim()
      .min(1)
      .max(300)
      .describe("Street address of the practice"),
    city: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .describe("City where the practice is located"),
    latitude: z
      .number()
      .min(-90)
      .max(90)
      .optional()
      .describe("Latitude of the practice location"),
    longitude: z
      .number()
      .min(-180)
      .max(180)
      .optional()
      .describe("Longitude of the practice location"),
    isPublic: z
      .boolean()
      .optional()
      .describe("Whether the practice is visible in the public directory"),
  })
  .strict();

export const CreatePracticeSchema = CreatePracticeObjectSchema.refine(
  latLongsPaired,
  {
    message: "latitude and longitude must be provided together",
    path: ["latitude"],
  },
);

export class CreatePracticeDto extends createZodDto(CreatePracticeSchema) {}
