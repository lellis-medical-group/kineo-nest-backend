import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateApplicationSchema = z.object({
    listingId: z.string().describe('Id of the replacement listing to apply to'),
    message: z.string().optional().describe('Optional message to the practice owner'),
});

export class CreateApplicationDto extends createZodDto(CreateApplicationSchema) { }