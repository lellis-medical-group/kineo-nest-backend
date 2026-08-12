import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const FindPracticesSchema = z.object({
  name: z.string().optional(),
  city: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radiusKm: z.coerce.number().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export class FindPracticesDto extends createZodDto(FindPracticesSchema) {}