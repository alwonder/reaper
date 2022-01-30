import { AfterViewInit, Component } from '@angular/core';
import { Map as GLMap } from 'mapbox-gl';
import { testField } from '../../constants/harvest-field';
import { mapStyle } from '../../constants/map-config.constants';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
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
}
