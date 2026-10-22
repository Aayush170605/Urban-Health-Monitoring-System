// ──────────────────────────────────────────────
// Urban Health Monitoring System – Location Data
// ──────────────────────────────────────────────

import { Location, LocationId } from '../types';

/**
 * The four monitoring stations deployed around north Bengaluru.
 * Ordered from highest environmental stress to cleanest:
 * 1) Bagalur Cross (Rank #1 Worst)
 * 2) Near Galleria Mall (Rank #2 Worst)
 * 3) Phoenix Mall of Asia (Rank #3)
 * 4) Hebbal Flyover entry (Rank #4 Cleanest)
 */
export const LOCATIONS: Location[] = [
  {
    id: 'bagalur-cross',
    name: 'Bagalur Cross',
    stationLabel: 'UHMS-01',
    type: 'Major Junction Corridor',
    position: { x: 240, y: 180 },
    context:
      'High-traffic convergence point with freight, transit, and commuter flow. Experiences peak emissions, severe particulate spikes, and persistent acoustic noise.',
  },
  {
    id: 'galleria-mall',
    name: 'Near Galleria Mall',
    stationLabel: 'UHMS-03',
    type: 'Mall Surroundings & Arterial',
    position: { x: 240, y: 460 },
    context:
      'Commercial perimeter with sustained vehicle idling, pedestrian crossing bottlenecks, and elevated stop-and-go exhaust exposure.',
  },
  {
    id: 'phoenix-mall',
    name: 'Phoenix Mall of Asia entry/exit gate, service road',
    stationLabel: 'UHMS-02',
    type: 'Mall Access / Service Road',
    position: { x: 720, y: 180 },
    context:
      'Service road feeder with periodic ride-share queues, visitor turnover, and moderate acoustic variations.',
  },
  {
    id: 'hebbal-flyover',
    name: 'Hebbal Flyover entry',
    stationLabel: 'UHMS-04',
    type: 'Flyover Approach Corridor',
    position: { x: 720, y: 460 },
    context:
      'Elevated transit approach with continuous ventilation, steady vehicular velocity, and the lowest ambient exposure in the network.',
  },
];

/** Quick lookup map keyed by LocationId. */
export const LOCATION_MAP: Record<LocationId, Location> = Object.fromEntries(
  LOCATIONS.map((loc) => [loc.id, loc]),
) as Record<LocationId, Location>;

/** Ordered list of location IDs matching LOCATIONS array order. */
export const LOCATION_IDS: LocationId[] = LOCATIONS.map((l) => l.id);
