export type CoordinatesLatLng = { lat: number, lng: number };

export type CoordinatesKm = { x: number, y: number };

export type HarvestField = {
  territory: CoordinatesLatLng[];
  trace: CoordinatesLatLng[];
}

export type MapPoint = [number, number];
