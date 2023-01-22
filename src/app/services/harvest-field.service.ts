import { Injectable } from '@angular/core';
import { Feature, LineString } from '@turf/turf';
import { testField } from '../constants/harvest-field';
import { MapPoint } from '../types/map.types';
import { getFieldRoute } from '../utils/route-creator.util';
import { CombineProcessingService } from './combine-processing.service';

@Injectable({
  providedIn: 'root'
})
export class HarvestFieldService {

  public field: MapPoint[] = testField;
  public startLine: [MapPoint, MapPoint] | null = null;
  private fieldRoute: Feature<LineString> | null = null;

  constructor(
    private combineProcessingService: CombineProcessingService
  ) { }

  public getFieldRoute(): Feature<LineString> {
    if (!this.fieldRoute) {
      throw new Error('Маршрут движения по полю не просчитан');
    }
    return this.fieldRoute;
  }

  public calculateFieldRoute(): Feature<LineString> {
    if (!this.startLine) {
      throw new Error('Не заданы начальные данные');
    }

    this.fieldRoute = getFieldRoute(
      this.field,
      this.startLine,
      this.combineProcessingService.getCaptureWorkingWidth() * 0.001
    );
    return this.fieldRoute
  }
}
