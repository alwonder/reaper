import { AfterViewInit, ChangeDetectionStrategy, Component } from '@angular/core';
import { along, length, LineString } from '@turf/turf';
import { GeoJSONSource, Map as GLMap } from 'mapbox-gl';
import { testField } from '../../constants/harvest-field';
import { mapStyle } from '../../constants/map-config.constants';

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
    this.testAlong();
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

  private testAlong(): void {
    this.map.addSource('somePoint', {
      'type': 'geojson',
      'data': {
        properties: null,
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': testField[0],
        }
      }
    });
    const source = this.map.getSource('somePoint') as GeoJSONSource

    const lineString: LineString = {
      type: 'LineString',
      coordinates: testField,
    }

    const fieldPerimeter = length({'type': 'Feature', properties: null, geometry: lineString });

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
      const somePoint = along(lineString, i);
      source.setData(somePoint);
    }
    this.animate(lineString, source, fieldPerimeter, step)
  }

  private animate(lineString: LineString, source: GeoJSONSource, perimeter: number, step: number, current = 0): void {
    const somePoint = along(lineString, current);
    source.setData(somePoint);
    if (step < perimeter) {
      requestAnimationFrame(() => this.animate(lineString, source, perimeter, step, current + step));
    }
  }
}
