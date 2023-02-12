import { Injectable } from '@angular/core';
import { Feature, LineString } from '@turf/turf';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
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
  public activeCorner$ = new BehaviorSubject<number>(1);
  public routeDirection$ = new BehaviorSubject<boolean>(true);

  public fieldRoute$: Observable<Feature<LineString>> = combineLatest([
    this.field$.pipe(distinctUntilChanged()),
    this.combineProcessingService.captureWorkingWidth$.pipe(distinctUntilChanged()),
    this.activeCorner$.pipe(distinctUntilChanged()),
    this.routeDirection$.pipe(distinctUntilChanged()),
  ])
    .pipe(map(([field, captureWidth]) => {
      return getFieldRoute(
        field,
        this.getStartLine(),
        captureWidth * 0.001
      );
    }))

  constructor(
    private combineProcessingService: CombineProcessingService
  ) { }

  public applyField(field: MapPoint[]): void {
    console.log('New field', field);
    this.activeCorner$.next(0);
    this.field$.next(field);
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
