import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ProfileType, Specialty } from '../../generated/prisma/enums';

export const FindProfilesSchema = z.object({
  specialty: z.enum(Specialty).optional().describe('Filter by medical specialty'),
  profileType: z.enum(ProfileType).optional().describe('Filter by profile status'),
  city: z.string().max(100).optional().describe('Filter by city'),
});

export class FindProfilesDto extends createZodDto(FindProfilesSchema) { }