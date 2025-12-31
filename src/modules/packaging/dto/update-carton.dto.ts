import { PartialType } from '@nestjs/mapped-types';
import { CreateCartonDto } from './create-carton.dto';

export class UpdateCartonDto extends PartialType(CreateCartonDto) {}
