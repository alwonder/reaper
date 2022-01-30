import * as mapboxgl from 'mapbox-gl';

export const hackMapboxApi = (): void => {
  // @ts-expect-error
  mapboxgl.config.API_URL = null;
  // @ts-expect-error
  Object.defineProperty(mapboxgl.config, 'EVENTS_URL', { get: () => null });
};
