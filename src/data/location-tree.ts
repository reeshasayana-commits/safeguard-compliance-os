// ============================================================================
// Hierarchical Location Mock Data — 3-level cascade
// Location → Sub-Location → Area/Floor
// ============================================================================

export interface LocationNode {
  id: string;
  name: string;
  children?: LocationNode[];
}

export const LOCATION_TREE: LocationNode[] = [
  {
    id: 'loc-main-plant',
    name: 'Main Plant',
    children: [
      {
        id: 'loc-mp-bldg-a',
        name: 'Building A',
        children: [
          { id: 'loc-mp-a-f1', name: 'Floor 1 — Assembly' },
          { id: 'loc-mp-a-f2', name: 'Floor 2 — Packaging' },
          { id: 'loc-mp-a-f3', name: 'Floor 3 — QA Lab' },
        ],
      },
      {
        id: 'loc-mp-bldg-b',
        name: 'Building B',
        children: [
          { id: 'loc-mp-b-f1', name: 'Floor 1 — Welding Bay' },
          { id: 'loc-mp-b-f2', name: 'Floor 2 — Paint Shop' },
        ],
      },
      {
        id: 'loc-mp-bldg-c',
        name: 'Building C',
        children: [
          { id: 'loc-mp-c-f1', name: 'Ground Floor — Cafeteria' },
          { id: 'loc-mp-c-f2', name: 'Floor 1 — Admin Offices' },
        ],
      },
    ],
  },
  {
    id: 'loc-warehouse',
    name: 'Warehouse Complex',
    children: [
      {
        id: 'loc-wh-zone-a',
        name: 'Zone A — Raw Materials',
        children: [
          { id: 'loc-wh-a-dock', name: 'Loading Dock' },
          { id: 'loc-wh-a-storage', name: 'Bulk Storage' },
        ],
      },
      {
        id: 'loc-wh-zone-b',
        name: 'Zone B — Finished Goods',
        children: [
          { id: 'loc-wh-b-staging', name: 'Staging Area' },
          { id: 'loc-wh-b-dispatch', name: 'Dispatch Bay' },
        ],
      },
    ],
  },
  {
    id: 'loc-lab',
    name: 'Lab Building',
    children: [
      {
        id: 'loc-lab-wing-n',
        name: 'North Wing',
        children: [
          { id: 'loc-lab-n-chem', name: 'Chemistry Lab' },
          { id: 'loc-lab-n-bio', name: 'Biology Lab' },
        ],
      },
      {
        id: 'loc-lab-wing-s',
        name: 'South Wing',
        children: [
          { id: 'loc-lab-s-physics', name: 'Physics Lab' },
          { id: 'loc-lab-s-calibration', name: 'Calibration Room' },
        ],
      },
    ],
  },
  {
    id: 'loc-construction',
    name: 'Construction Site D',
    children: [
      {
        id: 'loc-con-sector-1',
        name: 'Sector 1 — Foundation',
        children: [
          { id: 'loc-con-1-excavation', name: 'Excavation Zone' },
          { id: 'loc-con-1-rebar', name: 'Rebar Assembly' },
        ],
      },
      {
        id: 'loc-con-sector-2',
        name: 'Sector 2 — Scaffolding',
        children: [
          { id: 'loc-con-2-north', name: 'North Scaffold' },
          { id: 'loc-con-2-south', name: 'South Scaffold' },
        ],
      },
    ],
  },
];

/** Flat list of mock users for assignment */
export const ASSIGNABLE_USERS = [
  { id: 'u-ananya', name: 'Ananya Sharma' },
  { id: 'u-raj', name: 'Raj Patel' },
  { id: 'u-priya', name: 'Priya Nair' },
  { id: 'u-arjun', name: 'Arjun Mehta' },
  { id: 'u-reeshu', name: 'Reeshu S.' },
];
