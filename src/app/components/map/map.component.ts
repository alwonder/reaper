import { AfterViewInit, ChangeDetectionStrategy, Component } from '@angular/core';
import { Map as GLMap } from 'mapbox-gl';
import { fromEvent, Subject } from 'rxjs';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

import { mapStyle } from '../../constants/map-config.constants';
import { CombineProcessingService } from '../../services/combine-processing.service';
import { HarvestFieldService } from '../../services/harvest-field.service';
import { RecordsRepositoryService } from '../../services/records-repository.service';
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
    this.mapRenderer.updateField(this.harvestFieldService.field);
    // TODO del
    this.mapRenderer.updateFieldDraw(this.harvestFieldService.field);

    this.harvestFieldService.startLine = [
      this.harvestFieldService.field[4],
      this.harvestFieldService.field[5],
    ]

    this.harvestFieldService.drawMode$.pipe(
      filter((enabled) => enabled),
      this.takeUntilDestroy(),
    )
      .subscribe(() => {
        this.enableDrawMode();
      })

    // Отслеживание изменения рабочей ширины захвата машины для переотрисовки маршрута
    this.combineProcessingService.captureWorkingWidth$
      .pipe(distinctUntilChanged(), this.takeUntilDestroy())
      .subscribe(() => {
        this.harvestFieldService.calculateFieldRoute();
        this.updateActiveRoute()
      })

    this.recordsRepositoryService.activeRecord$
      .pipe(this.takeUntilDestroy())
      .subscribe(() => this.updateActiveRoute());
  }

  /** Отрисовать маршрут с активной записью с сенсоров */
  private updateActiveRoute(): void {
    if (!this.mapRenderer) {
      throw new Error('Карта не готова');
    }

    const activeRecord = this.recordsRepositoryService.getActiveRecord()
    const fieldRoute = this.harvestFieldService.getFieldRoute();

    if (!activeRecord) {
      this.mapRenderer.updateRoute(fieldRoute, 0, 0);
      return;
    }

    this.mapRenderer.updateRoute(fieldRoute, activeRecord.distanceTraveled ?? 0, activeRecord.bunkerFillDistance)
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
        this.harvestFieldService.field = drawnField;

        this.harvestFieldService.startLine = [
          drawnField[0],
          drawnField[1],
        ]

        this.harvestFieldService.calculateFieldRoute();
        this.mapRenderer?.updateField(this.harvestFieldService.field)
        this.updateActiveRoute();

        unsubscriber.next();
        unsubscriber.complete();
      })
  }
}
