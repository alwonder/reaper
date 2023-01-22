import { AfterViewInit, ChangeDetectionStrategy, Component } from '@angular/core';
import { length, lineSliceAlong, lineString, LineString } from '@turf/turf';
import * as turf from '@turf/turf';
import { GeoJSONSource, Map as GLMap } from 'mapbox-gl';
import { testField } from '../../constants/harvest-field';
import { mapStyle } from '../../constants/map-config.constants';
import { CombineProcessingService, CombineSensorsData } from '../../services/combine-processing.service';
import { HarvestFieldService } from '../../services/harvest-field.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent implements AfterViewInit {
  private readonly FIELD_SOURCE = 'field'

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

    const data: CombineSensorsData = {
      velocity: 6.5,
      bunkerFullness: 10,
      harvest: 1.45,
    }

    console.log(this.combineProcessingService.calculateData(data))
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
      this.onMapLoad();
    })
  }

  private onMapLoad(): void {
    this.drawField();
    const route = this.drawRoute();
    // this.testAlong(route);
  }

  private drawField(): void {
    this.map.addSource(this.FIELD_SOURCE, {
      'type': 'geojson',
      'data': {
        properties: null,
        'type': 'Feature',
        'geometry': {
          'type': 'Polygon',
          'coordinates': [testField]
        }
      }
    });

    this.map.addLayer({
      'id': 'field-fill',
      'type': 'fill',
      'source': this.FIELD_SOURCE,
      'layout': {},
      'paint': {
        'fill-color': '#0080ff', // blue color fill
        'fill-opacity': 0.2
      }
    });
    this.map.addLayer({
      'id': 'field-outline',
      'type': 'line',
      'source': this.FIELD_SOURCE,
      'layout': {},
      'paint': {
        'line-color': '#000',
        'line-width': 3
      }
    });
  }

  private drawRoute(): turf.Feature<LineString> {
    this.harvestFieldService.startLine = [
      this.harvestFieldService.field[4],
      this.harvestFieldService.field[5],
    ]
    const fieldRoute = this.harvestFieldService.calculateFieldRoute();
    const calculatedData = this.combineProcessingService.calculateData({
      velocity: 6.5,
      bunkerFullness: 10,
      harvest: 1.45,
    });

    const overallDistance = length(fieldRoute);

    const perimeter = lineString(testField);
    const completed = lineSliceAlong(fieldRoute, 0, 20)
    const tillFill = lineSliceAlong(fieldRoute, 20, 20 + calculatedData.performance)
    const restDistance = lineSliceAlong(fieldRoute, 20 + calculatedData.performance, overallDistance);

    this.map.addSource('perimeter', {
      'type': 'geojson',
      'data': perimeter
    });

    this.map.addLayer({
      'id': 'perimeter',
      'type': 'line',
      'source': 'perimeter',
      'layout': {},
      'paint': {
        'line-color': '#ff0',
        'line-width': 3
      }
    });

    this.map.addSource('scaled1', {
      'type': 'geojson',
      'data': completed
    });

    this.map.addLayer({
      'id': 'sddsds1',
      'type': 'line',
      'source': 'scaled1',
      'layout': {},
      'paint': {
        'line-color': '#96d711',
        'line-width': 8
      }
    });

    this.map.addSource('scaled2', {
      'type': 'geojson',
      'data': tillFill
    });

    this.map.addLayer({
      'id': 'sddsds2',
      'type': 'line',
      'source': 'scaled2',
      'layout': {},
      'paint': {
        'line-color': '#ee9824',
        'line-width': 8
      }
    });

    this.map.addSource('scaled3', {
      'type': 'geojson',
      'data': restDistance
    });

    this.map.addLayer({
      'id': 'sddsds3',
      'type': 'line',
      'source': 'scaled3',
      'layout': {},
      'paint': {
        'line-color': 'rgba(36,184,238,0.3)',
        'line-width': 8
      }
    });

    return fieldRoute;
  }

  private testAlong(lineString: turf.Feature<LineString>): void {
    this.map.addSource('somePoint', {
      'type': 'geojson',
      'data': {
        properties: null,
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': lineString.geometry.coordinates[0],
        }
      }
    });
    const source = this.map.getSource('somePoint') as GeoJSONSource


    const fieldPerimeter = turf.length(lineString);

    this.map.addLayer({
      'id': 'population',
      'type': 'circle',
      'source': 'somePoint',
      'paint': {
      'circle-radius': 5,
      'circle-color': 'blue'
      }
    });


    const step = 0.005;
    for (let i = 0; i < fieldPerimeter; i += step) {
      const somePoint = turf.along(lineString, i);
      source.setData(somePoint);
    }
    this.animate(lineString.geometry, source, fieldPerimeter, step)
  }

  private animate(lineString: turf.LineString, source: GeoJSONSource, perimeter: number, step: number, current = 0): void {
    const somePoint = turf.along(lineString, current);
    source.setData(somePoint);
    if (step < perimeter) {
      requestAnimationFrame(() => this.animate(lineString, source, perimeter, step, current + step));
    }
  }
}
