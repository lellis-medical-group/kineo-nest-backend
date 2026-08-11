import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ProfileType, Specialty } from '../../generated/prisma/enums';

export const FindProfilesSchema = z.object({
    specialty: z.enum(Specialty).optional(),
    profileType: z.enum(ProfileType).optional(),
    city: z.string().optional(),
});

export class FindProfilesDto extends createZodDto(FindProfilesSchema) { }