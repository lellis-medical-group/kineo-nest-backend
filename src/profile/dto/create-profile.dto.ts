import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ProfileType, Specialty } from '../../generated/prisma/enums';

export const CreateProfileSchema = z.object({
  specialty: z.enum(Specialty).describe('Medical specialty of the profile'),
  profileType: z.enum(ProfileType).describe('Status: installed doctor, replacement doctor, or both'),
  rppsNumber: z.string().optional().describe('RPPS number of the healthcare professional'),
  city: z.string().optional().describe('Main city of practice'),
  latitude: z.number().optional().describe('Latitude of the main practice location'),
  longitude: z.number().optional().describe('Longitude of the main practice location'),
  isPublic: z.boolean().optional().describe('Whether the profile is visible in the public directory'),
});

export class CreateProfileDto extends createZodDto(CreateProfileSchema) {}