import { Injectable } from '@nestjs/common';
import { CreateReplacementlistingDto } from './dto/create-replacementlisting.dto';
import { UpdateReplacementlistingDto } from './dto/update-replacementlisting.dto';

@Injectable()
export class ReplacementlistingsService {
  create(createReplacementlistingDto: CreateReplacementlistingDto) {
    return 'This action adds a new replacementlisting';
  }

  findAll() {
    return `This action returns all replacementlistings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} replacementlisting`;
  }

  update(id: number, updateReplacementlistingDto: UpdateReplacementlistingDto) {
    return `This action updates a #${id} replacementlisting`;
  }

  remove(id: number) {
    return `This action removes a #${id} replacementlisting`;
  }
}
