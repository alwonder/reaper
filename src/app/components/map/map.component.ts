import { AfterViewInit, ChangeDetectionStrategy, Component } from '@angular/core';
import { length, lineSliceAlong, LineString } from '@turf/turf';
import * as turf from '@turf/turf';
import { GeoJSONSource, Map as GLMap } from 'mapbox-gl';
import { testField } from '../../constants/harvest-field';
import { mapStyle } from '../../constants/map-config.constants';
import { CombineProcessingService, CombineSensorsData } from '../../services/combine-processing.service';
import { HarvestFieldService } from '../../services/harvest-field.service';

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

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent implements AfterViewInit {

  /** ID контейнера карты */
  public id = 'map';

  public map!: GLMap;

  constructor(
    private combineProcessingService: CombineProcessingService,
    private harvestFieldService: HarvestFieldService,
  ) {
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = new GLMap({
      container: 'map',
      style: mapStyle,
      center: [
        128.200617,
        50.092772,
      ],
      zoom: 14
    });

    this.map.on('load', () => {
      this.createLayersAndSources();

      this.harvestFieldService.startLine = [
        this.harvestFieldService.field[4],
        this.harvestFieldService.field[5],
      ]
      this.harvestFieldService.calculateFieldRoute();

      this.updateFieldSource();

      this.updateRoute({
        distanceTraveled: 20,
        velocity: 6.5,
        bunkerFullness: 10,
        harvest: 1.45,
      });
    })
  }

  private createLayersAndSources(): void {
    this.createFieldLayer();
    this.createCompletedRouteLayer();
    this.createRouteTillFillingLayer();
    this.createRemainingRouteLayer();
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
    this.map.addSource(mapLayers.COMPLETED, {
      type: 'geojson',
      data: {type: 'FeatureCollection', features: []}
    });

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
    this.map.addSource(mapLayers.TILL_FILLING, {
      type: 'geojson',
      data: {type: 'FeatureCollection', features: []}
    });

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
    this.map.addSource(mapLayers.REMAINING, {
      type: 'geojson',
      data: {type: 'FeatureCollection', features: []}
    });

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

  private updateFieldSource(): void {
    (this.map.getSource(mapLayers.FIELD) as GeoJSONSource).setData({
      properties: null,
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [testField]
      }
    });
  }

  private updateRoute(data: CombineSensorsData): turf.Feature<LineString> {
    const fieldRoute = this.harvestFieldService.getFieldRoute();
    const calculatedData = this.combineProcessingService.calculateData(data);

    const overallDistance = length(fieldRoute);

    const distanceCompleted = data.distanceTraveled ?? 0;

    if (distanceCompleted) {
      const completed = lineSliceAlong(fieldRoute, 0, distanceCompleted);
      (this.map.getSource(mapLayers.COMPLETED) as GeoJSONSource).setData(completed);
    }
    const routeTillFilling = lineSliceAlong(fieldRoute, distanceCompleted, distanceCompleted + calculatedData.performance)
    const restDistance = lineSliceAlong(fieldRoute, distanceCompleted + calculatedData.performance, overallDistance);

    (this.map.getSource(mapLayers.TILL_FILLING) as GeoJSONSource).setData(routeTillFilling);
    (this.map.getSource(mapLayers.REMAINING) as GeoJSONSource).setData(restDistance);

    return fieldRoute;
  }
}
