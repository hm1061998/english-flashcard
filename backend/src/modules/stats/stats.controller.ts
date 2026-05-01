import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { FlashcardsService } from '../flashcards/flashcards.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('stats')
@Controller('stats')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StatsController {
  constructor(private readonly flashcardsService: FlashcardsService) {}

  @Get()
  @ApiOperation({ summary: 'Get personal learning statistics' })
  getStats(@Req() req) {
    return this.flashcardsService.getStats(req.user.id);
  }
}
