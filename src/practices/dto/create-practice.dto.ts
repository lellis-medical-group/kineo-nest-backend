import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreatePracticeSchema = z.object({
  name: z.string().describe('Name of the practice or clinic'),
  address: z.string().describe('Street address of the practice'),
  city: z.string().describe('City where the practice is located'),
  latitude: z.number().optional().describe('Latitude of the practice location'),
  longitude: z.number().optional().describe('Longitude of the practice location'),
  isPublic: z.boolean().optional().describe('Whether the practice is visible in the public directory'),
});

export class CreatePracticeDto extends createZodDto(CreatePracticeSchema) {}