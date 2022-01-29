import { CoordinatesLatLng } from '../types/map.types';

/**
 * Меняет местами координаты
 * @param coordinates координаты точки
 * @returns координаты точки, поменянные местами
 */
export function swapCoordinates(coordinates: CoordinatesLatLng): CoordinatesLatLng {
  return { lat: coordinates.lng, lng: coordinates.lat };
}

/**
 * Высчитывает расстояние между координатами с учётом искривления Земли
 * @param coordinate1 координаты первой точки
 * @param coordinate2 координаты второй точки
 * @returns расстояние в километрах между точками
 */
export function getEarthPointsDistanceInKm(coordinate1: CoordinatesLatLng, coordinate2: CoordinatesLatLng): number {
  const earthRadiusKm = 6367;

  const dLat = degreesToRadians(coordinate1.lat - coordinate2.lat);
  const dLng = degreesToRadians(coordinate1.lng - coordinate2.lng);

  const newLat1 = degreesToRadians(coordinate1.lat);
  const newLat2 = degreesToRadians(coordinate2.lat);

  const a1 = (Math.sin(dLat / 2) ** 2) + (Math.cos(newLat1) * Math.cos(newLat2) * (Math.sin(dLng / 2) ** 2));
  const c1 = 2 * Math.atan2(Math.sqrt(a1), Math.sqrt(1 - a1));
  return earthRadiusKm * c1;
}

/**
 * Получить расстояние между списком из нескольких координат с учётом искривления Земли
 */
export function getMultipleEarthPointsDistance(coordinates: CoordinatesLatLng[]): number {
  return coordinates.reduce((acc, current, index) => {
    if (index === 0) return acc;

    return acc + getEarthPointsDistanceInKm(coordinates[index - 1]!, coordinates[index]!);
  }, 0);
}

/**
 * Получение угла в радианах из градусов
 * @param degrees угол в градусах
 * @returns угол в радианах
 */
export function degreesToRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}
