import { CoordinatesKm } from '../types/map.types';
import { kmToLatLng } from './coordinates-convertor.util';
import { getEarthPointsDistanceInKm } from './lat-lng.utils';

export const getDistanceInKm = (coord1: CoordinatesKm, coord2: CoordinatesKm): number => {
  const latLng1 = kmToLatLng(coord1);
  const latLng2 = kmToLatLng(coord2);

  return getEarthPointsDistanceInKm(latLng1, latLng2);
}

export const getMultiplePointsDistance = (coordinates: CoordinatesKm[]): number => {
  return coordinates.reduce((acc, current, index) => {
    if (index === 0) return acc;

    return acc + getDistanceInKm(coordinates[index - 1]!, coordinates[index]!);
  }, 0);
}
