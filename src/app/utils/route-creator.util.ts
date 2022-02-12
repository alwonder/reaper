import booleanIntersects from '@turf/boolean-intersects';
import {
  bearing,
  destination,
  Feature, featureCollection,
  FeatureCollection,
  lineString,
  LineString,
  polygon,
  Position,
  transformScale
} from '@turf/turf';
import { MapPoint } from '../types/map.types';

export const getFieldParallels = (field: MapPoint[], line: [MapPoint, MapPoint], distance: number): FeatureCollection => {
  const polyFeature = polygon([field]);
  const direction = getDirection(field, [field[0], field[1]]);
  const firstLine = getParallelLine(line, distance, direction)
  const lines: Feature<LineString>[] = [transformScale(firstLine, 2)];
  let someLine = firstLine.geometry.coordinates

  while (true) {
    const nextLine = getParallelLine(someLine, distance, direction)
    if (booleanIntersects(polyFeature, nextLine)) {
      lines.push(transformScale(nextLine, 2));
      someLine = nextLine.geometry.coordinates;
    } else {
      break;
    }
  }

  return featureCollection(lines);
}

export const getDirection = (field: MapPoint[], line: [MapPoint, MapPoint]): 'left' | 'right' => {
  const polyFeature = polygon([field]);
  const rightLine = getParallelLine(line, 0.01, 'right');
  if (booleanIntersects(rightLine, polyFeature)) return 'right'
  return 'left'
}

export const getParallelLine = (line: Position[], distance: number, pos: 'left' | 'right'): Feature<LineString> => {
  const lineBearing = bearing(line[0], line[1]);
  const degrees = pos === 'right' ? 90 : -90;
  const newBearing = lineBearing + degrees;
  const newPoint1 = destination(line[0], distance, newBearing);
  const newPoint2 = destination(line[1], distance, newBearing);
  return lineString([newPoint1.geometry.coordinates, newPoint2.geometry.coordinates]);
}
