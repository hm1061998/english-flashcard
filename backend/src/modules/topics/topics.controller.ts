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
} from '@nestjs/common';
import { TopicsService } from './topics.service';
import { CreateTopicDto, UpdateTopicDto } from './dto/topic.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('topics')
@Controller('topics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all topics for the current user' })
  findAll(@Req() req) {
    return this.topicsService.findAll(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new topic' })
  create(@Body() createTopicDto: CreateTopicDto, @Req() req) {
    return this.topicsService.create(createTopicDto, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a topic' })
  update(
    @Param('id') id: string,
    @Body() updateTopicDto: UpdateTopicDto,
    @Req() req,
  ) {
    return this.topicsService.update(id, updateTopicDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a topic' })
  remove(@Param('id') id: string, @Req() req) {
    return this.topicsService.remove(id, req.user.id);
  }
}
