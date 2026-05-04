import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Flashcard } from '../flashcards/flashcard.entity';

@Entity('topics')
@Index(['user', 'name'], { unique: true })
export class Topic {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  color: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.topics, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => Flashcard, (flashcard) => flashcard.topic)
  flashcards: Flashcard[];
}
