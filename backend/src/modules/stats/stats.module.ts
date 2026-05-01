import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { FlashcardsModule } from '../flashcards/flashcards.module';

@Module({
  imports: [FlashcardsModule],
  controllers: [StatsController],
})
export class StatsModule {}
