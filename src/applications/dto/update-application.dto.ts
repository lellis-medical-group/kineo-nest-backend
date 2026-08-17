import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateApplicationSchema = z.object({
  message: z.string().describe('Updated message, only editable while the application is pending'),
});

export class UpdateApplicationDto extends createZodDto(UpdateApplicationSchema) {}