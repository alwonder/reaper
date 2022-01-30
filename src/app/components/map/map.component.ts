import { AfterViewInit, Component } from '@angular/core';
import { Map as GLMap } from 'mapbox-gl';
import { mapStyle } from '../../constants/map-config.constants';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {

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

  }
}
