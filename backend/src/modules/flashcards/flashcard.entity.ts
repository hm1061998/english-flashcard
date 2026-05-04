import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Topic } from '../topics/topic.entity';

@Entity('flashcards')
@Index(['user', 'createdAt']) // Compound index for efficient user-specific sorted listing
@Index(['user', 'word'])      // Index for searching words
@Index(['user', 'meaning'])   // Index for searching meanings
export class Flashcard {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  word: string;

  @Column()
  phonetic: string;

  @Column('text')
  meaning: string;

  @Column('text', { nullable: true })
  example: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: 0 })
  viewCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.flashcards, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Topic, (topic) => topic.flashcards, { nullable: true, onDelete: 'SET NULL' })
  topic: Topic | null;
}
