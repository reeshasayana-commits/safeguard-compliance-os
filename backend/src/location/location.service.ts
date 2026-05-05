// ============================================================================
// LocationService — Tree operations via TypeORM TreeRepository
// ============================================================================

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import { Location } from './entities/location.entity';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly locationTreeRepo: TreeRepository<Location>,
  ) {}

  /**
   * Fetch the entire location tree in a single query via the closure table.
   * Returns a nested array: each Location has its `children` populated.
   *
   * Under the hood, TypeORM JOINs against `location_closure` to reconstruct
   * the full hierarchy — no recursive queries, no N+1 problem.
   */
  async findTrees(): Promise<Location[]> {
    return this.locationTreeRepo.findTrees();
  }

  /**
   * Fetch a single Location with all its descendants (subtree).
   */
  async findDescendantsTree(parentId: string): Promise<Location | null> {
    const parent = await this.locationTreeRepo.findOne({ where: { id: parentId } });
    if (!parent) return null;
    return this.locationTreeRepo.findDescendantsTree(parent);
  }

  /**
   * Fetch a single Location with all its ancestors (path to root).
   */
  async findAncestorsTree(childId: string): Promise<Location | null> {
    const child = await this.locationTreeRepo.findOne({ where: { id: childId } });
    if (!child) return null;
    return this.locationTreeRepo.findAncestorsTree(child);
  }

  /**
   * Find a single location by ID.
   */
  async findOne(id: string): Promise<Location | null> {
    return this.locationTreeRepo.findOne({ where: { id } });
  }

  /**
   * Create a new location node in the tree.
   */
  async create(data: Partial<Location>): Promise<Location> {
    const location = this.locationTreeRepo.create(data);
    return this.locationTreeRepo.save(location);
  }
}
