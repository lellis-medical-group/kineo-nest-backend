import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateApplicationSchema = z.object({
  message: z.string().max(2000).describe('Updated message, only editable while the application is pending'),
});

export class UpdateApplicationDto extends createZodDto(UpdateApplicationSchema) {}