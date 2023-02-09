import { Injectable } from '@angular/core';
import { Feature, LineString } from '@turf/turf';
import { BehaviorSubject, Subject } from 'rxjs';
import { testField } from '../constants/harvest-field';
import { MapPoint } from '../types/map.types';
import { getFieldRoute } from '../utils/route-creator.util';
import { CombineProcessingService } from './combine-processing.service';

@Injectable({
  providedIn: 'root'
})
export class HarvestFieldService {
  public drawMode$ = new BehaviorSubject<boolean>(false);
  public drawModeApply$ = new Subject();
  public drawModeCancel$ = new Subject();

  public field$ = new BehaviorSubject<MapPoint[]>(testField);
  public activeCorner$ = new BehaviorSubject<number>(0);
  public routeDirection$ = new BehaviorSubject<boolean>(true);

  private fieldRoute: Feature<LineString> | null = null;

  constructor(
    private combineProcessingService: CombineProcessingService
  ) { }

  public applyField(field: MapPoint[]): void {
    this.activeCorner$.next(0);
    this.field$.next(field);
  }

  public getFieldRoute(): Feature<LineString> {
    if (!this.fieldRoute) {
      throw new Error('Маршрут движения по полю не просчитан');
    }
    return this.fieldRoute;
  }

  public calculateFieldRoute(): void {
    this.fieldRoute = getFieldRoute(
      this.field$.value,
      this.getStartLine(),
      this.combineProcessingService.getCaptureWorkingWidth() * 0.001
    );
  }

  private getStartLine(): [MapPoint, MapPoint] {
    const field = this.field$.value;
    const activeCorner = this.activeCorner$.value;
    const routeDirection = this.routeDirection$.value;

    let secondPoint = routeDirection ? activeCorner + 1 : activeCorner - 1;
    if (secondPoint > field.length - 1) {
      secondPoint = 0;
    } else if (secondPoint < 0) {
      secondPoint = field.length - 1;
    }

    return [field[activeCorner], field[secondPoint]];
  }
}
