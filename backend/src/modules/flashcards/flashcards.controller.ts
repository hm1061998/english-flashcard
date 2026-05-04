import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { FlashcardsService } from './flashcards.service';
import { CreateFlashcardDto, UpdateFlashcardDto } from './dto/flashcard.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('flashcards')
@Controller('flashcards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FlashcardsController {
  constructor(private readonly flashcardsService: FlashcardsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all flashcards for the current user with pagination, search and sort' })
  findAll(
    @Req() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('order') order: 'ASC' | 'DESC' = 'DESC',
    @Query('topicId') topicId?: string,
  ) {
    return this.flashcardsService.findAll(req.user.id, +page, +limit, search, sortBy, order, topicId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a flashcard by id for the current user' })
  findOne(@Param('id') id: string, @Req() req) {
    return this.flashcardsService.findOne(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new flashcard' })
  create(@Body() createFlashcardDto: CreateFlashcardDto, @Req() req) {
    return this.flashcardsService.create(createFlashcardDto, req.user.id);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple flashcards at once' })
  bulkCreate(@Body() words: CreateFlashcardDto[], @Req() req) {
    return this.flashcardsService.bulkCreate(words, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a flashcard' })
  update(
    @Param('id') id: string, 
    @Body() updateFlashcardDto: UpdateFlashcardDto,
    @Req() req
  ) {
    return this.flashcardsService.update(id, updateFlashcardDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a flashcard' })
  remove(@Param('id') id: string, @Req() req) {
    return this.flashcardsService.remove(id, req.user.id);
  }
}
