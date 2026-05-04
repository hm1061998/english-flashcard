import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from './topic.entity';
import { CreateTopicDto, UpdateTopicDto } from './dto/topic.dto';

@Injectable()
export class TopicsService {
  constructor(
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
  ) {}

  async findAll(userId: string): Promise<Topic[]> {
    return this.topicRepository.find({
      where: { user: { id: userId } },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Topic> {
    const topic = await this.topicRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!topic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }
    return topic;
  }

  async create(createTopicDto: CreateTopicDto, userId: string): Promise<Topic> {
    const existing = await this.topicRepository.findOne({
      where: { name: createTopicDto.name, user: { id: userId } },
    });
    if (existing) {
      return existing; // Or throw ConflictException if you prefer
    }

    const topic = this.topicRepository.create({
      ...createTopicDto,
      user: { id: userId },
    });
    return this.topicRepository.save(topic);
  }

  async update(id: string, updateTopicDto: UpdateTopicDto, userId: string): Promise<Topic> {
    const topic = await this.findOne(id, userId);
    Object.assign(topic, updateTopicDto);
    return this.topicRepository.save(topic);
  }

  async remove(id: string, userId: string): Promise<void> {
    const topic = await this.findOne(id, userId);
    await this.topicRepository.remove(topic);
  }
}
