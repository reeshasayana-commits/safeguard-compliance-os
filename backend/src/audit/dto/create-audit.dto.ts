import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { AuditStatus } from '../../common/enums';

export class CreateAuditDto {
  @IsString()
  @IsNotEmpty()
  unitName: string;

  @IsString()
  @IsNotEmpty()
  auditorName: string;

  @IsDateString()
  @IsNotEmpty()
  auditDate: string;

  @IsUUID()
  @IsNotEmpty()
  locationId: string;

  @IsOptional()
  @IsEnum(AuditStatus)
  status?: AuditStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  score?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
