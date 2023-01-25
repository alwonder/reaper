import { Feature, LineString } from '@turf/helpers';
import { length, lineSliceAlong } from '@turf/turf';
import { AnySourceData, GeoJSONSource, Map as GLMap } from 'mapbox-gl';
import { MapPoint } from '../../types/map.types';

const mapLayers = {
  FIELD: 'field',
  FIELD_OUTLINE: 'fieldOutline',
  COMPLETED: 'completed',
  TILL_FILLING: 'tillFilling',
  REMAINING: 'remaining',
} as const;

const mapLayerColors: Record<keyof typeof mapLayers, string> = {
  FIELD: 'rgba(0,128,255,0.11)',
  FIELD_OUTLINE: '#6faae5',
  COMPLETED: 'rgba(159,215,17,0.55)',
  TILL_FILLING: 'rgba(238,152,36,0.62)',
  REMAINING: 'rgba(71,154,231,0.36)',
}

export class MapRenderer {
  constructor(private map: GLMap) {
    this.prepareMap();
  }

  /** Подготовка слоёв карты, создание базовых слоёв */
  private prepareMap(): void {
    this.createFieldLayer();
    this.createCompletedRouteLayer();
    this.createRouteTillFillingLayer();
    this.createRemainingRouteLayer();
  }

  /** Отрисовка обрабатываемой площади */
  public updateField(data: MapPoint[]): void {
    (this.map.getSource(mapLayers.FIELD) as GeoJSONSource).setData({
      properties: null,
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [data]
      }
    });
  }

  public updateCompleted(data: Feature<LineString>): void {
    (this.map.getSource(mapLayers.COMPLETED) as GeoJSONSource).setData(data);
  }

  public updateTillFilling(data: Feature<LineString>): void {
    (this.map.getSource(mapLayers.TILL_FILLING) as GeoJSONSource).setData(data);
  }

  public updateRemaining(data: Feature<LineString>): void {
    (this.map.getSource(mapLayers.REMAINING) as GeoJSONSource).setData(data);
  }

  public updateRoute(route: Feature<LineString>, completed: number, remaining: number): void {
    const overallDistance = length(route);

    if (completed) {
      this.updateCompleted(lineSliceAlong(route, 0, completed))
    } else {
      this.updateCompleted(this.getEmptyFeature())
    }

    if ((completed + remaining) > 0) {
      this.updateTillFilling(lineSliceAlong(route, completed, completed + remaining));
    } else {
      this.updateTillFilling(this.getEmptyFeature());
    }

    this.updateRemaining(lineSliceAlong(route, completed + remaining, overallDistance));
  }

  /** Полигон обрабатываемого поля */
  private createFieldLayer(): void {
    this.map.addSource(mapLayers.FIELD, {
      'type': 'geojson',
      'data': {
        properties: null,
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: []
        }
      }
    });

    this.map.addLayer({
      'id': mapLayers.FIELD,
      'type': 'fill',
      'source': mapLayers.FIELD,
      'layout': {},
      'paint': {
        'fill-color': mapLayerColors.FIELD,
      }
    });

    this.map.addLayer({
      'id': mapLayers.FIELD_OUTLINE,
      'type': 'line',
      'source': mapLayers.FIELD,
      'layout': {},
      'paint': {
        'line-color': mapLayerColors.FIELD_OUTLINE,
        'line-width': 3
      }
    });
  }

  private createCompletedRouteLayer(): void {
    // Маршрут пройденного расстояния
    this.map.addSource(mapLayers.COMPLETED, this.getEmptySourceData());

    this.map.addLayer({
      id: mapLayers.COMPLETED,
      type: 'line',
      source: mapLayers.COMPLETED,
      layout: {},
      paint: {
        'line-color': mapLayerColors.COMPLETED,
        'line-width': 8
      }
    });
  }

  // Маршрут пройденного расстояния
  private createRouteTillFillingLayer(): void {
    this.map.addSource(mapLayers.TILL_FILLING, this.getEmptySourceData());

    this.map.addLayer({
      id: mapLayers.TILL_FILLING,
      type: 'line',
      source: mapLayers.TILL_FILLING,
      layout: {},
      paint: {
        'line-color': mapLayerColors.TILL_FILLING,
        'line-width': 8
      }
    });
  }

  private createRemainingRouteLayer(): void {
    // Маршрут пройденного расстояния
    this.map.addSource(mapLayers.REMAINING, this.getEmptySourceData());

    this.map.addLayer({
      id: mapLayers.REMAINING,
      type: 'line',
      source: mapLayers.REMAINING,
      layout: {},
      paint: {
        'line-color': mapLayerColors.REMAINING,
        'line-width': 8
      }
    });
  }

  private getEmptySourceData(): AnySourceData {
    return {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    }
  }

  private getEmptyFeature(): Feature<LineString> {
    return {
      'type': 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: []
      }
    }
  }
}
