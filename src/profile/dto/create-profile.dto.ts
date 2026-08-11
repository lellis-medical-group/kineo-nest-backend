import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ProfileType, Specialty } from '../../generated/prisma/enums';

export const CreateProfileSchema = z.object({
  specialty: z.enum(Specialty),
  profileType: z.enum(ProfileType),
  rppsNumber: z.string().optional(),
  city: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export class CreateProfileDto extends createZodDto(CreateProfileSchema) { }