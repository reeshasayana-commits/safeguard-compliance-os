import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Audit } from './entities/audit.entity';
import { CreateAuditDto } from './dto/create-audit.dto';
import { AuditStatus } from '../common/enums';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(Audit)
    private readonly auditRepo: Repository<Audit>,
  ) {}

  async create(createAuditDto: CreateAuditDto): Promise<Audit> {
    // Generate a sequential-like ID for the audit
    const count = await this.auditRepo.count();
    const year = new Date().getFullYear();
    const sequence = String(count + 1).padStart(4, '0');
    const auditId = `AUD-${year}-${sequence}`;

    const newAudit = this.auditRepo.create({
      ...createAuditDto,
      auditId,
      status: createAuditDto.status || AuditStatus.SCHEDULED,
    });

    return this.auditRepo.save(newAudit);
  }

  async findAll(): Promise<Audit[]> {
    return this.auditRepo.find({
      relations: ['location'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Audit> {
    const audit = await this.auditRepo.findOne({
      where: { id },
      relations: ['location'],
    });

    if (!audit) {
      throw new NotFoundException(`Audit with ID ${id} not found`);
    }

    return audit;
  }

  async update(id: string, updateAuditDto: Partial<CreateAuditDto>): Promise<Audit> {
    const audit = await this.auditRepo.preload({
      id,
      ...updateAuditDto,
    });

    if (!audit) {
      throw new NotFoundException(`Audit with ID ${id} not found`);
    }

    // Automatically set completedDate if status moves to COMPLETED
    if (updateAuditDto.status === AuditStatus.COMPLETED && !audit.completedDate) {
      audit.completedDate = new Date().toISOString();
    }

    return this.auditRepo.save(audit);
  }
}
