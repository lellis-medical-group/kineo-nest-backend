import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const CreatePracticeSchema = z.object({
  name: z.string().max(200).describe("Name of the practice or clinic"),
  address: z.string().max(300).describe("Street address of the practice"),
  city: z.string().max(100).describe("City where the practice is located"),
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
});

export class CreatePracticeDto extends createZodDto(CreatePracticeSchema) {}
