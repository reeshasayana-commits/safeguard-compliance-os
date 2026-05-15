import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { RiskSeverity, RiskStatus } from '../../common/enums';
import { IsFutureDate } from '../validators/is-future-date.validator';

export class UpdateRiskDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsEnum(RiskSeverity)
  severity?: RiskSeverity;

  @IsOptional()
  @IsUUID('4')
  locationId?: string;

  @IsOptional()
  @IsString()
  assignedUserId?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  actionPlan?: string;

  @IsOptional()
  @IsDateString()
  @IsFutureDate()
  dueDate?: string;

  @IsOptional()
  @IsString()
  evidenceUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  referenceStandard?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  actionTaken?: string;

  @IsOptional()
  @IsString()
  closureEvidenceUrl?: string;

  @IsOptional()
  activityLogs?: string[];

  @IsOptional()
  @IsEnum(RiskStatus)
  status?: RiskStatus;
}
