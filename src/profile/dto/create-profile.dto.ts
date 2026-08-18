import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ProfileType, Specialty } from '../../generated/prisma/enums';

export const CreateProfileSchema = z.object({
  specialty: z.enum(Specialty).describe('Medical specialty of the profile'),
  profileType: z.enum(ProfileType).describe('Status: installed doctor, replacement doctor, or both'),
  rppsNumber: z.string().regex(/^\d{11}$/).optional().describe('11-digit RPPS number of the healthcare professional'),
  city: z.string().max(100).optional().describe('Main city of practice'),
  latitude: z.number().min(-90).max(90).optional().describe('Latitude of the main practice location'),
  longitude: z.number().min(-180).max(180).optional().describe('Longitude of the main practice location'),
  isPublic: z.boolean().optional().describe('Whether the profile is visible in the public directory'),
});

export class CreateProfileDto extends createZodDto(CreateProfileSchema) { }