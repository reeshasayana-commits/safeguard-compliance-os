// ============================================================================
// SeederService — Idempotent database seeder for development/demo
// ============================================================================
//
// Implements OnModuleInit to run once at startup.
// Checks if the database is empty before inserting seed data.
// Restarting the server will NOT create duplicate records.
// ============================================================================

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { Location } from '../location/entities/location.entity';
import { Risk } from '../risk/entities/risk.entity';
import { Audit } from '../audit/entities/audit.entity';
import {
  LocationType,
  RiskSeverity,
  RiskStatus,
  AuditStatus,
} from '../common/enums';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(Location)
    private readonly locationRepo: TreeRepository<Location>,

    @InjectRepository(Risk)
    private readonly riskRepo: Repository<Risk>,

    @InjectRepository(Audit)
    private readonly auditRepo: Repository<Audit>,
  ) {}

  async onModuleInit(): Promise<void> {
    const locationCount = await this.locationRepo.count();

    if (locationCount > 0) {
      this.logger.log('Database already seeded — skipping. (' + locationCount + ' locations found)');
      return;
    }

    this.logger.log('Empty database detected — seeding...');

    try {
      await this.seedLocations();
      await this.seedAudits();
      await this.seedRisks();
      this.logger.log('✅ Database seeded successfully');
    } catch (err) {
      this.logger.error('❌ Seeding failed:', err);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Locations — 3-level hierarchy using closure table
  // ─────────────────────────────────────────────────────────────────────────

  private async seedLocations(): Promise<void> {
    // ── Level 1: Root Site ───────────────────────────────────
    const root = this.locationRepo.create({
      name: 'Karnataka Operations',
      type: LocationType.LOCATION,
      address: 'Karnataka, India',
      parent: null,
    });
    await this.locationRepo.save(root);

    // ── Level 2: Sub-Locations ──────────────────────────────
    const bengaluruHQ = this.locationRepo.create({
      name: 'Bengaluru HQ',
      type: LocationType.SUB_LOCATION,
      address: 'Electronic City, Bengaluru 560100',
      latitude: 12.8399,
      longitude: 77.6770,
      parent: root,
    });

    const mysoreFacility = this.locationRepo.create({
      name: 'Mysore Facility',
      type: LocationType.SUB_LOCATION,
      address: 'Hebbal Industrial Area, Mysuru 570016',
      latitude: 12.3375,
      longitude: 76.6122,
      parent: root,
    });

    const hubballiPlant = this.locationRepo.create({
      name: 'Hubballi Plant',
      type: LocationType.SUB_LOCATION,
      address: 'KIADB Industrial Area, Hubballi 580025',
      latitude: 15.3647,
      longitude: 75.1240,
      parent: root,
    });

    await this.locationRepo.save([bengaluruHQ, mysoreFacility, hubballiPlant]);

    // ── Level 3: Areas / Floors ─────────────────────────────
    const areas = [
      // Bengaluru HQ areas
      { name: 'Server Room A', type: LocationType.AREA, parent: bengaluruHQ },
      { name: 'Executive Floor (3F)', type: LocationType.AREA, parent: bengaluruHQ },
      { name: 'Cafeteria Block', type: LocationType.AREA, parent: bengaluruHQ },
      { name: 'Parking Basement B1', type: LocationType.AREA, parent: bengaluruHQ },

      // Mysore Facility areas
      { name: 'Assembly Floor', type: LocationType.AREA, parent: mysoreFacility },
      { name: 'Chemical Storage Wing', type: LocationType.AREA, parent: mysoreFacility },
      { name: 'Quality Lab', type: LocationType.AREA, parent: mysoreFacility },

      // Hubballi Plant areas
      { name: 'Welding Bay 1', type: LocationType.AREA, parent: hubballiPlant },
      { name: 'Loading Dock C', type: LocationType.AREA, parent: hubballiPlant },
      { name: 'Electrical Panel Room', type: LocationType.AREA, parent: hubballiPlant },
    ];

    const areaEntities = areas.map((a) => this.locationRepo.create(a));
    await this.locationRepo.save(areaEntities);

    this.logger.log(`  → Seeded ${1 + 3 + areas.length} locations (3-level tree)`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Audits
  // ─────────────────────────────────────────────────────────────────────────

  private async seedAudits(): Promise<void> {
    // Fetch some locations for FK references
    const locations = await this.locationRepo.find({ where: { type: LocationType.SUB_LOCATION } });

    const audits = [
      {
        auditId: 'AUD-2025-0001',
        unitName: 'Bengaluru HQ — Safety Compliance',
        auditorName: 'Ravi Shankar',
        auditDate: new Date('2025-04-15'),
        completedDate: new Date('2025-04-16'),
        status: AuditStatus.COMPLETED,
        score: 87,
        notes: 'Minor findings in electrical panel labeling. Server room fire suppression system passed.',
        locationId: locations[0]?.id,
      },
      {
        auditId: 'AUD-2025-0002',
        unitName: 'Mysore Facility — Chemical Safety',
        auditorName: 'Priya Nair',
        auditDate: new Date('2025-05-01'),
        status: AuditStatus.SCHEDULED,
        score: null,
        notes: null,
        locationId: locations[1]?.id,
      },
    ];

    for (const a of audits) {
      const audit = this.auditRepo.create(a);
      await this.auditRepo.save(audit);
    }

    this.logger.log(`  → Seeded ${audits.length} audits`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Risks — 5 diverse entries with varying statuses and severities
  // ─────────────────────────────────────────────────────────────────────────

  private async seedRisks(): Promise<void> {
    // Fetch leaf-level areas for FK references
    const areas = await this.locationRepo.find({ where: { type: LocationType.AREA } });
    const audits = await this.auditRepo.find();

    const risks = [
      {
        riskId: 'RSK-2025-0100',
        title: 'Exposed electrical conduit in server room',
        description: 'Multiple electrical conduits near rack 7B are exposed without proper insulation. Risk of arc flash during maintenance. Identified during routine walkthrough by facilities team.',
        severity: RiskSeverity.CRITICAL,
        status: RiskStatus.OPEN,
        assignedUserId: 'usr-ananya-sharma',
        actionPlan: 'Immediate shutdown of rack 7B power feed. Engage licensed electrician for conduit replacement. Install arc flash warning labels. Schedule follow-up thermal imaging scan within 2 weeks.',
        dueDate: new Date('2025-05-15'),
        evidenceUrl: null,
        locationId: areas.find((a) => a.name === 'Server Room A')?.id ?? areas[0].id,
        auditId: audits[0]?.id ?? null,
      },
      {
        riskId: 'RSK-2025-0101',
        title: 'Chemical storage ventilation below OSHA threshold',
        description: 'Air exchange rate in the chemical wing measured at 4 ACH — below the required 6 ACH minimum for Class B chemical storage. Acetone and isopropanol concentrations detected at 60% of PEL.',
        severity: RiskSeverity.HIGH,
        status: RiskStatus.ASSIGNED,
        assignedUserId: 'usr-raj-patel',
        actionPlan: 'Install two additional exhaust fans (600 CFM each). Relocate acetone drums to outdoor storage cage. Commission HVAC engineer for duct reconfiguration. Target completion: 10 business days.',
        dueDate: new Date('2025-05-20'),
        evidenceUrl: null,
        locationId: areas.find((a) => a.name === 'Chemical Storage Wing')?.id ?? areas[1].id,
        auditId: null,
      },
      {
        riskId: 'RSK-2025-0102',
        title: 'Fire exit path blocked by pallets — North wing',
        description: 'Emergency exit corridor B in the assembly floor is partially obstructed by staging pallets. Egress width reduced to 0.6m — below the 1.2m code requirement. Flagged by shift supervisor.',
        severity: RiskSeverity.HIGH,
        status: RiskStatus.IN_PROGRESS,
        assignedUserId: 'usr-priya-nair',
        actionPlan: 'Relocate all pallets to designated staging zone by end of shift. Install permanent bollards to prevent future encroachment. Add floor marking tape for 1.2m egress boundary. Conduct monthly walkthrough audit.',
        dueDate: new Date('2025-05-10'),
        evidenceUrl: null,
        locationId: areas.find((a) => a.name === 'Assembly Floor')?.id ?? areas[2].id,
        auditId: null,
      },
      {
        riskId: 'RSK-2025-0103',
        title: 'PPE non-compliance observed in welding bay',
        description: 'Three operators observed working without face shields during MIG welding operations. Auto-darkening helmets available but not used. Near-miss incident reported on April 28.',
        severity: RiskSeverity.MEDIUM,
        status: RiskStatus.RESOLVED,
        assignedUserId: 'usr-raj-patel',
        actionPlan: 'Mandatory PPE refresher training for all welding bay personnel. Install PPE checkpoint mirror at bay entrance. Implement buddy-check system. Progressive disciplinary policy communicated to union rep.',
        dueDate: new Date('2025-05-08'),
        evidenceUrl: null,
        locationId: areas.find((a) => a.name === 'Welding Bay 1')?.id ?? areas[3].id,
        auditId: null,
      },
      {
        riskId: 'RSK-2025-0104',
        title: 'Slip hazard from condensation at loading dock',
        description: 'Persistent condensation on polished concrete floor near Loading Dock C during monsoon season. Two slip incidents reported in last 30 days (no injuries). Anti-slip mats deteriorated.',
        severity: RiskSeverity.LOW,
        status: RiskStatus.CLOSED,
        assignedUserId: 'usr-ananya-sharma',
        actionPlan: 'Replaced all anti-slip mats with industrial-grade diamond-plate runners. Applied epoxy grit coating to approach ramp. Installed dehumidifier unit at dock entrance. Monthly mat inspection added to maintenance schedule.',
        dueDate: null,
        evidenceUrl: null,
        locationId: areas.find((a) => a.name === 'Loading Dock C')?.id ?? areas[4].id,
        auditId: audits[0]?.id ?? null,
      },
    ];

    for (const r of risks) {
      const risk = this.riskRepo.create(r);
      await this.riskRepo.save(risk);
    }

    this.logger.log(`  → Seeded ${risks.length} risks`);
  }
}
