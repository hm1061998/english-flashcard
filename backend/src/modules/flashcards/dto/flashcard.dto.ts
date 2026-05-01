import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFlashcardDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  word: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phonetic?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  meaning: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  example?: string;

  @ApiProperty({ required: false })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}

export class UpdateFlashcardDto extends CreateFlashcardDto {}
