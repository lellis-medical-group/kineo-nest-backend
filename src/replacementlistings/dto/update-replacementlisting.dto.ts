import { PartialType } from '@nestjs/swagger';
import { CreateReplacementlistingDto } from './create-replacementlisting.dto';

export class UpdateReplacementlistingDto extends PartialType(CreateReplacementlistingDto) {}
