// ============================================================================
// LocationController — REST endpoints for the location hierarchy
// ============================================================================

import { Controller, Get, Param } from '@nestjs/common';
import { LocationService } from './location.service';
import { Location } from './entities/location.entity';

@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  /**
   * GET /locations/tree
   * Returns the full hierarchical location tree (all sites, buildings, areas).
   * Single query via closure table JOIN.
   */
  @Get('tree')
  async getTree(): Promise<Location[]> {
    return this.locationService.findTrees();
  }

  /**
   * GET /locations/:id/descendants
   * Returns a location with all its descendants as a nested tree.
   */
  @Get(':id/descendants')
  async getDescendants(@Param('id') id: string): Promise<Location | null> {
    return this.locationService.findDescendantsTree(id);
  }

  /**
   * GET /locations/:id/ancestors
   * Returns a location with the full path back to the root.
   */
  @Get(':id/ancestors')
  async getAncestors(@Param('id') id: string): Promise<Location | null> {
    return this.locationService.findAncestorsTree(id);
  }
}
