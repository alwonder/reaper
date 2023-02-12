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

export const getFieldRoute = (field: MapPoint[], line: [MapPoint, MapPoint], captureWidth: number): Feature<LineString> => {
  const polyFeature = polygon([field]);

  // Направление, в котором будет отрисовываться траектория
  const direction = getDirection(field, [field[0], field[1]]);
  // Первая полоса в траектории
  const firstLine = getParallelLine(line, captureWidth, direction)
  // Направление первой полосы, для выравнивания направления всех остальных полос под неё
  const baseBearing = bearing(firstLine.geometry.coordinates[0], firstLine.geometry.coordinates[1]);
  // Массив полос для построения траектории в дальнейшем
  const lines: Feature<LineString>[] = [normalizeLine(getFieldLine(firstLine, polyFeature, captureWidth), baseBearing)];

  let currentLine = firstLine.geometry.coordinates

  while (true) {
    const nextLine = getParallelLine(currentLine, captureWidth, direction)
    const scaledLine = transformScale(nextLine, 5);
    if (booleanIntersects(polyFeature, scaledLine)) {
      const marginLine = normalizeLine(getFieldLine(nextLine, polyFeature, captureWidth), baseBearing);

      lines.push(marginLine);
      currentLine = nextLine.geometry.coordinates;
    } else {
      break;
    }
  }

  const path = connectLines(featureCollection(lines));

  return path;
  // return bezierSpline(path, {
  //   resolution: 400000,
  //   sharpness: 0.03
  // })
}

/** Получить направление распространения полос траектории */
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

/**
 * Возвращает обрезанную по краям поля линию
 * @param nextLine
 * @param polyFeature
 * @param distance
 */
function getFieldLine(nextLine: Feature<LineString>, polyFeature: Feature<Polygon>, distance: number): Feature<LineString> {
  const scaledLine = transformScale(nextLine, 5);
  const intersect = lineIntersect(scaledLine, polyFeature);
  const edgeLine = lineString([intersect.features[0]!.geometry.coordinates, intersect.features[1]!.geometry.coordinates])
  return getMarginLine(edgeLine, distance);
}

/** Получить полосу с учётом ширины захвата уборочного комбайна */
export const getMarginLine = (line: Feature<LineString>, captureWidth: number): Feature<LineString> => {
  const point1 = along(line, captureWidth);
  const point2 = along(lineString([line.geometry.coordinates[1], line.geometry.coordinates[0]]), captureWidth);
  return lineString([point1.geometry.coordinates, point2.geometry.coordinates]);
}

/** Выровнять направление линии по первой линии в коллекции */
export const normalizeLine = (feature: Feature<LineString>, baseBearing: number): Feature<LineString> => {
  const [p0, p1] = feature.geometry.coordinates
  const featureBearing = bearing(p0, p1);
  if (Math.floor(baseBearing) === Math.floor(featureBearing)) {
    return lineString([p0, p1])
  } else {
    return lineString([p1, p0])
  }
}

/** Соединить все линии в зигзагообразную траекторию по всей площади поля */
export const connectLines = (lines: FeatureCollection<LineString>): Feature<LineString> => {
  const points: Position[] = [];
  lines.features.forEach((feature, index) => {
    if (index % 2 === 0) {
      points.push(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
    } else {
      points.push(feature.geometry.coordinates[0], feature.geometry.coordinates[1]);
    }
  })

  return lineString(points)
}
