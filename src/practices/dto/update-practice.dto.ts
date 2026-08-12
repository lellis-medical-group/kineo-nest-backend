import { createZodDto } from 'nestjs-zod';
import { CreatePracticeSchema } from './create-practice.dto';

export const UpdatePracticeSchema = CreatePracticeSchema.partial();

export class UpdatePracticeDto extends createZodDto(UpdatePracticeSchema) {}