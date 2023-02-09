import { AfterViewInit, ChangeDetectionStrategy, Component } from '@angular/core';
import { Feature, LineString } from '@turf/turf';
import { Map as GLMap } from 'mapbox-gl';
import { combineLatest, fromEvent, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { mapStyle } from '../../constants/map-config.constants';
import { CombineProcessingService } from '../../services/combine-processing.service';
import { HarvestFieldService } from '../../services/harvest-field.service';
import { RecordsRepositoryService } from '../../services/records-repository.service';
import { CombineProcessingOverallData } from '../../types/combine-processing.types';
import { MapPoint } from '../../types/map.types';
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

    this.harvestFieldService.drawMode$.pipe(
      filter((enabled) => enabled),
      this.takeUntilDestroy(),
    )
      .subscribe(() => this.enableDrawMode())

    this.harvestFieldService.field$
      .pipe(this.takeUntilDestroy())
      .subscribe((field) => this.mapRenderer?.updateField(field))

    combineLatest([
      this.harvestFieldService.fieldRoute$,
      this.recordsRepositoryService.activeRecord$,
    ])
      .pipe(this.takeUntilDestroy())
      .subscribe(([route, record]) => this.updateActiveRoute(route, record))
  }

  /** Отрисовать маршрут с активной записью с сенсоров */
  private updateActiveRoute(route: Feature<LineString>, record: CombineProcessingOverallData | null): void {
    if (!this.mapRenderer) {
      throw new Error('Карта не готова');
    }

    if (!record) {
      this.mapRenderer.updateRoute(route, 0, 0);
      return;
    }

    this.mapRenderer.updateRoute(route, record.distanceTraveled ?? 0, record.bunkerFillDistance)
  }

  public enableDrawMode(): void {
    if (!this.mapRenderer) {
      throw new Error('mapRenderer is not defined');
    }

    const unsubscriber = new Subject();
    const drawnField: MapPoint[] = [];

    this.mapRenderer?.setDrawMode(true);

    this.mapRenderer?.mapClick$.pipe(
      takeUntil(unsubscriber),
      this.takeUntilDestroy(),
    )
      .subscribe((lngLat) => {
        drawnField.push([lngLat.lng, lngLat.lat]);
        this.mapRenderer!.updateFieldDraw(drawnField);
      })

    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(
        filter((event) => event.key === 'Escape'),
        takeUntil(unsubscriber),
        this.takeUntilDestroy()
      )
      .subscribe(() => {
        drawnField.pop();
        this.mapRenderer!.updateFieldDraw(drawnField);

        if (drawnField.length < 2) {
          this.harvestFieldService.drawMode$.next(false);
          this.mapRenderer?.setDrawMode(false);
          unsubscriber.next();
          unsubscriber.complete();
        }
      })

    this.harvestFieldService.drawModeCancel$
      .pipe(this.takeUntilDestroy())
      .subscribe(() => {
        this.mapRenderer?.setDrawMode(false);
        this.mapRenderer?.updateFieldDraw([]);
        unsubscriber.next();
        unsubscriber.complete();
      })

    this.harvestFieldService.drawModeApply$
      .pipe(this.takeUntilDestroy())
      .subscribe(() => {
        this.mapRenderer?.setDrawMode(false);
        this.mapRenderer?.updateFieldDraw([]);
        drawnField.push(drawnField[0]);
        this.harvestFieldService.applyField(drawnField);

        unsubscriber.next();
        unsubscriber.complete();
      })
  }
}
