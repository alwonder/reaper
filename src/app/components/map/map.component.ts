import { AfterViewInit, ChangeDetectionStrategy, Component } from '@angular/core';
import { Map as GLMap } from 'mapbox-gl';

import { mapStyle } from '../../constants/map-config.constants';
import { CombineProcessingService } from '../../services/combine-processing.service';
import { HarvestFieldService } from '../../services/harvest-field.service';
import { RecordsRepositoryService } from '../../services/records-repository.service';
import { CombineProcessingOverallData } from '../../types/combine-processing.types';
import { BaseComponent } from '../base.directive';
import { MapRenderer } from './map.renderer';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent extends BaseComponent implements AfterViewInit {

  /** ID контейнера карты */
  public mapId = 'map';

  public map!: GLMap;
  private mapRenderer: MapRenderer | null = null

  constructor(
    private combineProcessingService: CombineProcessingService,
    private harvestFieldService: HarvestFieldService,
    private recordsRepositoryService: RecordsRepositoryService,
  ) {
    super();
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
      this.onMapLoad();
    })
  }

  private onMapLoad(): void {
    this.mapRenderer = new MapRenderer(this.map);
    this.mapRenderer.updateField(this.harvestFieldService.field);

    this.harvestFieldService.startLine = [
      this.harvestFieldService.field[4],
      this.harvestFieldService.field[5],
    ]
    this.harvestFieldService.calculateFieldRoute();

    this.recordsRepositoryService.activeRecord$
      .pipe(this.takeUntilDestroy())
      .subscribe((record) => {
        this.updateRoute(record);
      });
  }

  private updateRoute(data: CombineProcessingOverallData | null): void {
    if (!this.mapRenderer) {
      throw new Error('Карта не готова');
    }

    const fieldRoute = this.harvestFieldService.getFieldRoute();
    if (!data) {
      this.mapRenderer.updateRoute(fieldRoute, 0, 0);
      return;
    }

    this.mapRenderer.updateRoute(fieldRoute, data.distanceTraveled ?? 0, data.bunkerFillDistance)
  }
}
