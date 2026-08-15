import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReplacementlistingsService } from './replacementlistings.service';
import { CreateReplacementlistingDto } from './dto/create-replacementlisting.dto';
import { UpdateReplacementlistingDto } from './dto/update-replacementlisting.dto';

@Controller('replacementlistings')
export class ReplacementlistingsController {
  constructor(private readonly replacementlistingsService: ReplacementlistingsService) {}

  @Post()
  create(@Body() createReplacementlistingDto: CreateReplacementlistingDto) {
    return this.replacementlistingsService.create(createReplacementlistingDto);
  }

  @Get()
  findAll() {
    return this.replacementlistingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.replacementlistingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReplacementlistingDto: UpdateReplacementlistingDto) {
    return this.replacementlistingsService.update(+id, updateReplacementlistingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.replacementlistingsService.remove(+id);
  }
}
