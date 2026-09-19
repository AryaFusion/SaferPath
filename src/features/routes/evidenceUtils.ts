import type { RouteOption, TimeOfDay, HelpPoint, PhysicalReport } from '../../lib/types';

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

  const lighting =
    timeOfDay === '23:30'
      ? `${route.lightingEvidence.split('&')[0].trim()} (Primary late-night illumination)`
      : route.lightingEvidence;

  const activity =
    timeOfDay === '23:30'
      ? 'Reduced commercial activity; transit corridor active'
      : timeOfDay === '21:00'
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

export function getTimeTimeline(activeTime: TimeOfDay): TimeTimelineStep[] {
  return [
    {
      time: '18:00',
      label: '6:00 PM',
      observation: 'High pedestrian traffic and open storefront illumination.',
      isCurrent: activeTime === '18:00',
    },
    {
      time: '21:00',
      label: '9:00 PM',
      observation: 'Commercial activity begins to transition; transit plazas active.',
      isCurrent: activeTime === '21:00',
    },
    {
      time: '23:30',
      label: '11:30 PM',
      observation: 'Fewer recent observations available; primary context relies on municipal streetlamps and 24/7 help points.',
      isCurrent: activeTime === '23:30',
    },
  ];
}
