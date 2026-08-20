import { createZodDto } from "nestjs-zod";
import { CreateProfileSchema } from "./create-profile.dto";

export const UpdateProfileSchema = CreateProfileSchema.partial();

export class UpdateProfileDto extends createZodDto(UpdateProfileSchema) {}
