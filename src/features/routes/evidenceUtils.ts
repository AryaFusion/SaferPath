import type { RouteOption, TimeOfDay, HelpPoint, PhysicalReport } from '../../lib/types';
import { mapTimeToFixtureKey } from '../../lib/timeUtils';

export interface EvidenceSummary {
  lighting: string;
  activity: string;
  helpPointsCount: number;
  reportsCount: number;
  routeContinuity: string;
  freshness: string;
}

export interface TimeTimelineStep {
  time: TimeOfDay;
  label: string;
  observation: string;
  isCurrent: boolean;
}

export function getContextSummary(
  route: RouteOption | null,
  timeOfDay: TimeOfDay,
  helpPoints: HelpPoint[],
  reports: PhysicalReport[]
): EvidenceSummary {
  if (!route) {
    return {
      lighting: 'No recent data',
      activity: 'No recent data',
      helpPointsCount: 0,
      reportsCount: 0,
      routeContinuity: 'No recent data',
      freshness: 'No recent data',
    };
  }

  const effectiveKey = mapTimeToFixtureKey(timeOfDay);

  const lighting =
    effectiveKey === '23:30'
      ? `${route.lightingEvidence.split('&')[0].trim()} (Primary late-night illumination)`
      : route.lightingEvidence;

  const activity =
    effectiveKey === '23:30'
      ? 'Reduced commercial activity; transit corridor active'
      : effectiveKey === '21:00'
      ? 'Moderate pedestrian footfall & open storefronts'
      : 'Active pedestrian traffic & commercial front illumination';

  return {
    lighting,
    activity,
    helpPointsCount: route.helpPointsCount || helpPoints.length,
    reportsCount: reports.length,
    routeContinuity: 'Continuous paved pedestrian pathway',
    freshness: route.freshness,
  };
}

export function getTimeTimeline(_activeTime: TimeOfDay, liveTime: string = '9:00 PM'): TimeTimelineStep[] {
  return [
    {
      time: 'now',
      label: `NOW · ${liveTime}`,
      observation: 'Live current departure time. Refreshes automatically with system clock.',
      isCurrent: true,
    },
  ];
}
