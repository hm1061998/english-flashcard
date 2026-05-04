import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In } from 'typeorm';
import { Flashcard } from './flashcard.entity';
import { CreateFlashcardDto, UpdateFlashcardDto } from './dto/flashcard.dto';

@Injectable()
export class FlashcardsService {
  constructor(
    @InjectRepository(Flashcard)
    private flashcardRepository: Repository<Flashcard>,
  ) {}

  async findAll(
    userId: string, 
    page: number = 1, 
    limit: number = 10, 
    search?: string,
    sortBy: string = 'createdAt',
    order: 'ASC' | 'DESC' = 'DESC',
    topicId?: string
  ): Promise<{ data: Flashcard[], meta: any }> {
    const skip = (page - 1) * limit;
    
    const where: any = search ? [
      { user: { id: userId }, word: ILike(`%${search}%`) },
      { user: { id: userId }, meaning: ILike(`%${search}%`) }
    ] : { user: { id: userId } };

    if (topicId) {
      if (Array.isArray(where)) {
        where.forEach(w => w.topic = { id: topicId });
      } else {
        where.topic = { id: topicId };
      }
    }

    const [data, total] = await this.flashcardRepository.findAndCount({ 
      where,
      order: { [sortBy]: order },
      take: limit,
      skip: skip,
      relations: ['topic']
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string, userId: string): Promise<Flashcard> {
    const flashcard = await this.flashcardRepository.findOne({ 
      where: { id, user: { id: userId } },
      relations: ['topic']
    });
    if (!flashcard) {
      throw new NotFoundException(`Flashcard with ID ${id} not found`);
    }
    return flashcard;
  }

  async create(createFlashcardDto: CreateFlashcardDto, userId: string): Promise<Flashcard> {
    const existing = await this.flashcardRepository.findOne({
      where: { word: createFlashcardDto.word, user: { id: userId } }
    });
    
    if (existing) {
      throw new ConflictException(`Từ '${createFlashcardDto.word}' đã tồn tại trong kho của bạn.`);
    }

    const flashcard = this.flashcardRepository.create({
      ...createFlashcardDto,
      user: { id: userId } as any,
      topic: createFlashcardDto.topicId ? { id: createFlashcardDto.topicId } as any : null
    });
    return this.flashcardRepository.save(flashcard);
  }

  async bulkCreate(words: CreateFlashcardDto[], userId: string): Promise<Flashcard[]> {
    const wordList = words.map(w => w.word);
    
    // Fetch all existing flashcards for these words in one go
    const existingFlashcards = await this.flashcardRepository.find({
      where: { 
        user: { id: userId },
        word: In(wordList)
      }
    });

    const existingMap = new Map(existingFlashcards.map(f => [f.word.toLowerCase(), f]));
    const toSave: Flashcard[] = [];

    for (const dto of words) {
      const existing = existingMap.get(dto.word.toLowerCase());
      if (existing) {
        // Update existing record
        Object.assign(existing, dto);
        toSave.push(existing);
      } else {
        // Create new record
        toSave.push(this.flashcardRepository.create({
          ...dto,
          user: { id: userId } as any
        }));
      }
    }

    return this.flashcardRepository.save(toSave);
  }

  async update(id: string, updateFlashcardDto: UpdateFlashcardDto, userId: string): Promise<Flashcard> {
    const flashcard = await this.findOne(id, userId);
    const { topicId, ...rest } = updateFlashcardDto;
    Object.assign(flashcard, rest);
    if (topicId !== undefined) {
      flashcard.topic = topicId ? { id: topicId } as any : null;
    }
    return this.flashcardRepository.save(flashcard);
  }

  async remove(id: string, userId: string): Promise<void> {
    const flashcard = await this.findOne(id, userId);
    await this.flashcardRepository.remove(flashcard);
  }

  async getStats(userId: string) {
    const total = await this.flashcardRepository.count({ where: { user: { id: userId } } });
    return {
      totalFlashcards: total,
      newThisWeek: 0,
    };
  }
}
