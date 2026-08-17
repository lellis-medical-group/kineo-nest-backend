import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const FindPracticesSchema = z.object({
  name: z.string().max(200).optional().describe('Filter by practice name'),
  city: z.string().max(100).optional().describe('Filter by city'),
  lat: z.coerce.number().min(-90).max(90).optional().describe('Latitude for geographic radius search'),
  lng: z.coerce.number().min(-180).max(180).optional().describe('Longitude for geographic radius search'),
  radiusKm: z.coerce.number().positive().max(500).optional().describe('Search radius in kilometers'),
  page: z.coerce.number().min(1).default(1).describe('Page number, starting at 1'),
  limit: z.coerce.number().min(1).max(100).default(20).describe('Number of results per page, max 100'),
});

export class FindPracticesDto extends createZodDto(FindPracticesSchema) {}