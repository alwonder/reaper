import { Feature, LineString } from '@turf/helpers';
import { along, distance, length, lineSliceAlong, lineString } from '@turf/turf';
import { AnySourceData, GeoJSONSource, LngLat, Map as GLMap } from 'mapbox-gl';
import { Subject } from 'rxjs';
import { MapPoint } from '../../types/map.types';

const mapLayers = {
  FIELD: 'field',
  FIELD_OUTLINE: 'fieldOutline',
  FIELD_DRAW: 'fieldDraw',
  COMPLETED: 'completed',
  TILL_FILLING: 'tillFilling',
  REMAINING: 'remaining',
  REPLACE_DISTANCE: 'replaceDistance',
  REPLACE_DISTANCE_SYMBOL: 'replaceDistanceSymbol',
} as const;

const mapLayerColors: Record<keyof typeof mapLayers, string> = {
  FIELD: 'rgba(0,128,255,0.11)',
  FIELD_OUTLINE: '#6faae5',
  FIELD_DRAW: 'rgba(238,152,36,0.62)',
  COMPLETED: 'rgba(159,215,17,0.55)',
  TILL_FILLING: 'rgba(238,152,36,0.62)',
  REMAINING: 'rgba(71,154,231,0.36)',
  REPLACE_DISTANCE: 'rgb(238,60,36)',
  REPLACE_DISTANCE_SYMBOL: 'rgb(255,255,255)',
}

export class MapRenderer {
  public mapClick$ = new Subject<LngLat>();

  constructor(private map: GLMap) {
    this.prepareMap();
  }

  /** Подготовка слоёв карты, создание базовых слоёв */
  private prepareMap(): void {
    this.createFieldLayer();
    this.createCompletedRouteLayer();
    this.createRouteTillFillingLayer();
    this.createRemainingRouteLayer();
    this.createReplaceDistanceLayer();

    this.map.on('click', (event) => {
      this.mapClick$.next(event.lngLat)
    })
  }

  public setDrawMode(isOn: boolean): void {
    if (isOn) {
      this.map.setLayoutProperty(mapLayers.FIELD, 'visibility', 'none');
      this.map.setLayoutProperty(mapLayers.FIELD_OUTLINE, 'visibility', 'none');
      this.map.setLayoutProperty(mapLayers.COMPLETED, 'visibility', 'none');
      this.map.setLayoutProperty(mapLayers.TILL_FILLING, 'visibility', 'none');
      this.map.setLayoutProperty(mapLayers.REMAINING, 'visibility', 'none');
      this.map.setLayoutProperty(mapLayers.REPLACE_DISTANCE, 'visibility', 'none');
      this.map.setLayoutProperty(mapLayers.REPLACE_DISTANCE_SYMBOL, 'visibility', 'none');
    } else {
      this.map.setLayoutProperty(mapLayers.FIELD, 'visibility', 'visible');
      this.map.setLayoutProperty(mapLayers.FIELD_OUTLINE, 'visibility', 'visible');
      this.map.setLayoutProperty(mapLayers.COMPLETED, 'visibility', 'visible');
      this.map.setLayoutProperty(mapLayers.TILL_FILLING, 'visibility', 'visible');
      this.map.setLayoutProperty(mapLayers.REMAINING, 'visibility', 'visible');
      this.map.setLayoutProperty(mapLayers.REPLACE_DISTANCE, 'visibility', 'visible');
      this.map.setLayoutProperty(mapLayers.REPLACE_DISTANCE_SYMBOL, 'visibility', 'visible');
    }
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

  /** Отрисовка площади в режиме построения обрабатываемого участка */
  public updateFieldDraw(data: MapPoint[]): void {
    (this.map.getSource(mapLayers.FIELD_DRAW) as GeoJSONSource).setData({
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

  public updateReplaceDistance(data: Feature<LineString>): void {
    (this.map.getSource(mapLayers.REPLACE_DISTANCE) as GeoJSONSource).setData(data);
  }

  public updateRoute(route: Feature<LineString>, completed: number, remaining: number, replacePos: MapPoint): void {
    const overallDistance = length(route);

    if (completed) {
      this.updateCompleted(lineSliceAlong(route, 0, completed))
    } else {
      this.updateCompleted(this.getEmptyFeature())
    }

    if ((completed + remaining) > 0) {
      this.updateTillFilling(lineSliceAlong(route, completed, completed + remaining));

      const endPoint = along(route, completed + remaining);

      this.updateReplaceDistance(lineString([replacePos, endPoint.geometry.coordinates]));
      this.map.setLayoutProperty(
        mapLayers.REPLACE_DISTANCE_SYMBOL,
        "text-field",
        `${distance(replacePos, endPoint.geometry.coordinates).toFixed(2)} км`
      )
    } else {
      this.updateTillFilling(this.getEmptyFeature());
      this.updateReplaceDistance(this.getEmptyFeature());
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

    this.map.addSource(mapLayers.FIELD_DRAW, {
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
        'line-width': 2
      }
    });

    this.map.addLayer({
      'id': mapLayers.FIELD_DRAW,
      'type': 'fill',
      'source': mapLayers.FIELD_DRAW,
      'layout': {},
      'paint': {
        'fill-color': mapLayerColors.FIELD_DRAW,
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

  private createReplaceDistanceLayer(): void {
    // Расстояние до места заполнения
    this.map.addSource(mapLayers.REPLACE_DISTANCE, this.getEmptySourceData());

    this.map.addLayer({
      id: mapLayers.REPLACE_DISTANCE,
      type: 'line',
      source: mapLayers.REPLACE_DISTANCE,
      layout: {},
      paint: {
        'line-color': mapLayerColors.REPLACE_DISTANCE,
        'line-width': 4,
        'line-dasharray': [2, 2],
      },
    });

    this.map.addLayer({
      id: mapLayers.REPLACE_DISTANCE_SYMBOL,
      type: 'symbol',
      source: mapLayers.REPLACE_DISTANCE,
      layout: {
        "symbol-placement": "point",
        "text-font": ["Open Sans Regular"],
        "text-field": 'this is a test',
        "text-size": 16,
        'text-anchor': 'bottom',
        'text-offset': [0, -0.3]
      },
      paint: {
        'text-color': mapLayerColors.REPLACE_DISTANCE_SYMBOL,
      },
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
