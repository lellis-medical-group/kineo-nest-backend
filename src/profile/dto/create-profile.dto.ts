import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { latLongsPaired } from "../../common/validation/lat-long";
import { ProfileType, Specialty } from "../../generated/prisma/enums";

export const CreateProfileObjectSchema = z
  .object({
    specialty: z.enum(Specialty).describe("Medical specialty of the profile"),
    profileType: z
      .enum(ProfileType)
      .describe("Status: installed doctor, replacement doctor, or both"),
    rppsNumber: z
      .string()
      .trim()
      .regex(/^\d{11}$/)
      .optional()
      .describe("11-digit RPPS number of the healthcare professional"),
    city: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .regex(
        /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/,
        "City must contain only letters, spaces, hyphens or apostrophes",
      )
      .optional()
      .describe("Main city of practice"),
    latitude: z
      .number()
      .min(-90)
      .max(90)
      .optional()
      .describe("Latitude of the main practice location"),
    longitude: z
      .number()
      .min(-180)
      .max(180)
      .optional()
      .describe("Longitude of the main practice location"),
    isPublic: z
      .boolean()
      .optional()
      .describe("Whether the profile is visible in the public directory"),
  })
  .strict();

export const CreateProfileSchema = CreateProfileObjectSchema.refine(
  latLongsPaired,
  {
    message: "latitude and longitude must be provided together",
    path: ["latitude"],
  },
);

export class CreateProfileDto extends createZodDto(CreateProfileSchema) {}
