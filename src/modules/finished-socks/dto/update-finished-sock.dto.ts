import { PartialType } from '@nestjs/mapped-types';
import { CreateFinishedSockDto } from './create-finished-sock.dto';

export class UpdateFinishedSockDto extends PartialType(CreateFinishedSockDto) {}
