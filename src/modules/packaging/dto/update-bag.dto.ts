import { PartialType } from '@nestjs/mapped-types';
import { CreateBagDto } from './create-bag.dto';

export class UpdateBagDto extends PartialType(CreateBagDto) {}
