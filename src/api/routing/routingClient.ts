import type { RouteRequestOptions, RoutingResult } from './types';
import { fetchValhallaWalkingRoutes } from './valhallaClient';
import { getFixtureWalkingRoutes } from './fixtureRoutingClient';

export async function getWalkingRoutes(options: RouteRequestOptions): Promise<RoutingResult> {
  const providerConfig = import.meta.env.VITE_ROUTING_PROVIDER || 'valhalla';

  if (providerConfig === 'valhalla') {
    try {
      const result = await fetchValhallaWalkingRoutes(options);
      return result;
    } catch (err) {
      console.warn('Valhalla routing failed or unavailable. Falling back to fixture provider:', err);
      return getFixtureWalkingRoutes(options);
    }
  }

  return getFixtureWalkingRoutes(options);
}
