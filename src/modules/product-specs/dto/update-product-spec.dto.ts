import { PartialType } from '@nestjs/mapped-types';
import { CreateProductSpecDto } from './create-product-spec.dto';

export class UpdateProductSpecDto extends PartialType(CreateProductSpecDto) {}
