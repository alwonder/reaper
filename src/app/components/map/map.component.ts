import { AfterViewInit, ChangeDetectionStrategy, Component } from '@angular/core';
import { LineString } from '@turf/turf';
import * as turf from '@turf/turf';
import { GeoJSONSource, Map as GLMap } from 'mapbox-gl';
import { testField } from '../../constants/harvest-field';
import { mapStyle } from '../../constants/map-config.constants';
import { getFieldRoute } from '../../utils/route-creator.util';

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

  constructor() {
  }

  ngAfterViewInit(): void {
    this.initMap();

    console.log(turf.bearing([10, 10], [10, 20]))
  }

  private initMap(): void {
    this.map = new GLMap({
      container: 'map',
      style: mapStyle,
      center: [
        128.03140640258792,
        49.893768726936756,
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
    this.testAlong(route);
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
    const distance = 0.01; // 10m
    const route = getFieldRoute(testField, [testField[0], testField[1]], distance)

    this.map.addSource('scaled', {
      'type': 'geojson',
      'data': route
    });

    this.map.addLayer({
      'id': 'sddsds',
      'type': 'line',
      'source': 'scaled',
      'layout': {},
      'paint': {
        'line-color': '#0f0',
        'line-width': 3
      }
    });

    return route;
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
