// ============================================================================
// Location Entity — Closure Table Tree for hierarchical site structure
// ============================================================================
//
// TypeORM's @Tree("closure-table") strategy creates an auxiliary
// `location_closure` table that stores ALL ancestor-descendant pairs.
//
// This eliminates the N+1 problem: fetching the entire tree (or any subtree)
// is a single JOIN against the closure table, not a recursive CTE or
// multiple round-trips.
//
// Structure:
//   LOCATION (Site)
//     └── SUB_LOCATION (Building / Zone)
//           └── AREA (Floor / Dock / Room)
// ============================================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Tree,
  TreeParent,
  TreeChildren,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LocationType } from '../../common/enums';

@Entity('locations')
@Tree('closure-table')
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'enum', enum: LocationType })
  type: LocationType;

  @Column({ type: 'varchar', length: 500, nullable: true })
  address: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number | null;

  // ── Tree Relations ───────────────────────────────────────────────────
  // @TreeParent establishes the parent FK.
  // onDelete: 'CASCADE' ensures removing a site removes all sub-locations.

  @TreeParent({ onDelete: 'CASCADE' })
  parent: Location | null;

  @TreeChildren({ cascade: true })
  children: Location[];

  // ── Timestamps ───────────────────────────────────────────────────────

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
