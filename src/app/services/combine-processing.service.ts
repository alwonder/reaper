import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CombineProcessingOverallData,
  CombineSensorsData
} from '../types/combine-processing.types';

/** Исходные данные */
export interface CombinePredefinedData {
  /** Конструктивная ширина захвата уборочной машины */
  captureConstructionWidth: number;
  /** Коэффициент использования конструктивной ширины захвата */
  captureUsageCoefficient: number;
  /** Объёмная масса, т/м^3 */
  volumeMass: number;
  /** Коэффициент использования объёма бункера */
  bunkerUsageCoefficient: number;
  /** Конструктивный объём бункера */
  bunkerVolume: number;
}

@Injectable({
  providedIn: 'root'
})
export class CombineProcessingService {
  private predefinedDataSource = new BehaviorSubject<CombinePredefinedData>({
    captureConstructionWidth: 9.3,
    captureUsageCoefficient: 0.9,
    volumeMass: 0.73,
    bunkerUsageCoefficient: 0.9,
    bunkerVolume: 10,
  });

  public predefinedData$ = this.predefinedDataSource.asObservable();
  /** Рабочая ширина уборочной машины */
  public captureWorkingWidth$ = this.predefinedData$.pipe(
    map((data) => data.captureConstructionWidth * data.captureUsageCoefficient)
  )

  constructor() { }

  public getPredefinedData(): CombinePredefinedData {
    return this.predefinedDataSource.value;
  }

  public setPredefinedData(data: CombinePredefinedData): void {
    this.predefinedDataSource.next(data);
  }

  /** Вычислить рабочую ширину захвата уборочной машины */
  public getCaptureWorkingWidth(): number {
    const data = this.getPredefinedData();
    return data.captureConstructionWidth * data.captureUsageCoefficient;
  }

  /**
   * Вычислить производительность уборочной машины за один час рабочего времени
   * @param data Данные с датчиков уборочной машины
   */
  private getMachinePerformance(data: CombineSensorsData): number {
    return 0.1 * this.getCaptureWorkingWidth() * data.velocity * data.harvest;
  }

  /**
   * Вычислить время заполнения бункера комбайна
   * @param performance Производительность уборочной машины за один час рабочего времени
   * @param bunkerDelta Дельта бункера
   */
  private getBunkerFillTime(performance: number, bunkerDelta: number): number {
    const predefined = this.getPredefinedData();
    return (bunkerDelta * predefined.volumeMass * predefined.bunkerUsageCoefficient) / performance;
  }

  /**
   * Вычислить расстояние до расчётной точки заполнения бункера
   * @param data Данные с датчиков уборочной машины
   * @param bunkerFillTime Время заполнения бункера комбайна, час (4)
   */
  private getBunkerFillDistance(data: CombineSensorsData, bunkerFillTime: number): number {
    return data.velocity * bunkerFillTime;
  }

  public getOverallRecord(data: CombineSensorsData, previousRecord?: CombineProcessingOverallData): CombineProcessingOverallData {
    const predefined = this.getPredefinedData();
    const performance = this.getMachinePerformance(data);
    const bunkerVolFullness = (previousRecord?.bunkerVolFullness ?? 0) + data.bunkerFullness;
    const bunkerDelta = predefined.bunkerVolume - bunkerVolFullness;
    const bunkerFillTime = this.getBunkerFillTime(performance, bunkerDelta);
    const bunkerFillDistance = this.getBunkerFillDistance(data, bunkerFillTime)
    const distanceTraveled = data.velocity / 60 + (previousRecord?.distanceTraveled ?? 0);

    return {
      ...data,
      distanceTraveled,
      performance,
      bunkerFillTime,
      bunkerDelta,
      bunkerVolFullness,
      bunkerFillDistance,
    };
  }
}
