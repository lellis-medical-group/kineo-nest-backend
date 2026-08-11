import { PartialType } from '@nestjs/swagger';
import { CreatePracticeDto } from './create-practice.dto';

export class UpdatePracticeDto extends PartialType(CreatePracticeDto) {}
