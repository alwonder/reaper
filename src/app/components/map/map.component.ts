import { AfterViewInit, ChangeDetectionStrategy, Component } from '@angular/core';
import { LineString } from '@turf/turf';
import * as turf from '@turf/turf';
import { Map as GLMap } from 'mapbox-gl';
import { mapStyle } from '../../constants/map-config.constants';
import { CombineProcessingService, CombineSensorsData } from '../../services/combine-processing.service';
import { HarvestFieldService } from '../../services/harvest-field.service';
import { MapRenderer } from './map.renderer';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent implements AfterViewInit {

  /** ID контейнера карты */
  public mapId = 'map';

  public map!: GLMap;
  private mapRenderer: MapRenderer | null = null

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
      this.mapRenderer = new MapRenderer(this.map);
      this.mapRenderer.prepareMap();
      this.mapRenderer.updateField(this.harvestFieldService.field);

      this.harvestFieldService.startLine = [
        this.harvestFieldService.field[4],
        this.harvestFieldService.field[5],
      ]
      this.harvestFieldService.calculateFieldRoute();

      this.updateRoute({
        distanceTraveled: 0,
        velocity: 6.5,
        bunkerFullness: 10,
        harvest: 1.45,
      });
    })
  }

  private updateRoute(data: CombineSensorsData): turf.Feature<LineString> {
    if (!this.mapRenderer) {
      throw new Error('Карта не готова');
    }

    const fieldRoute = this.harvestFieldService.getFieldRoute();
    const calculatedData = this.combineProcessingService.calculateData(data);

    const distanceCompleted = data.distanceTraveled ?? 0;

    this.mapRenderer.updateRoute(fieldRoute, distanceCompleted, calculatedData.bunkerFillDistance)
    return fieldRoute;
  }
}
