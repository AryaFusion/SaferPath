import type { RouteOption, TimeOfDay, HelpPoint, PhysicalReport } from '../lib/types';
import { FIXTURE_ROUTES_BY_TIME } from '../test-fixtures/routes';
import { FIXTURE_HELP_POINTS } from '../test-fixtures/helpPoints';
import { FIXTURE_REPORTS } from '../test-fixtures/reports';
import { mapTimeToFixtureKey } from '../lib/timeUtils';

export class FixtureApiClient {
  static async getRoutesForTime(time: TimeOfDay): Promise<RouteOption[]> {
    // Simulate lightweight deterministic latency
    await new Promise((resolve) => setTimeout(resolve, 150));
    const key = mapTimeToFixtureKey(time);
    return FIXTURE_ROUTES_BY_TIME[key] || FIXTURE_ROUTES_BY_TIME['21:00'];
  }

  static async getHelpPoints(): Promise<HelpPoint[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return FIXTURE_HELP_POINTS;
  }

  static async getPhysicalReports(): Promise<PhysicalReport[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return FIXTURE_REPORTS;
  }
}
