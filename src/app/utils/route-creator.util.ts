import booleanIntersects from '@turf/boolean-intersects';
import {
  along,
  bearing,
  destination,
  Feature,
  featureCollection,
  FeatureCollection,
  lineIntersect,
  lineString,
  LineString,
  Polygon,
  polygon,
  Position,
  transformScale
} from '@turf/turf';
import { MapPoint } from '../types/map.types';

/**
 * Возвращает обрезанную по краям поля линию
 * @param nextLine
 * @param polyFeature
 * @param distance
 */
function getFieldLine(nextLine: Feature<LineString>, polyFeature: Feature<Polygon>, distance: number): Feature<LineString> {
  const scaledLine = transformScale(nextLine, 10);
  const intersect = lineIntersect(scaledLine, polyFeature);
  const edgeLine = lineString([intersect.features[0]!.geometry.coordinates, intersect.features[1]!.geometry.coordinates])
  return getMarginLine(edgeLine, distance);
}

export const getFieldParallels = (field: MapPoint[], line: [MapPoint, MapPoint], distance: number): FeatureCollection => {
  const polyFeature = polygon([field]);
  const direction = getDirection(field, [field[0], field[1]]);
  const firstLine = getParallelLine(line, distance, direction)
  const lines: Feature<LineString>[] = [getFieldLine(firstLine, polyFeature, distance)];
  let someLine = firstLine.geometry.coordinates

  while (true) {
    const nextLine = getParallelLine(someLine, distance, direction)
    if (booleanIntersects(polyFeature, nextLine)) {
      const marginLine = getFieldLine(nextLine, polyFeature, distance);

      lines.push(marginLine);
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

export const getMarginLine = (line: Feature<LineString>, distance: number): Feature<LineString> => {
  const point1 = along(line, distance);
  const point2 = along(lineString([line.geometry.coordinates[1], line.geometry.coordinates[0]]), distance);
  return lineString([point1.geometry.coordinates, point2.geometry.coordinates]);
}
