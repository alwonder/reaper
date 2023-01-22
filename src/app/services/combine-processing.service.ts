import { Injectable } from '@angular/core';

export interface CombineSensorsData {
  /** Урожайность, Га */
  harvest: number;
  /** Заполненность бункера, м^3 */
  bunkerFullness: number;
  /** Рабочая скорость, км/ч */
  velocity: number;
  /** Пройденное расстояние, км */
  distanceTraveled?: number;
}

export interface CombineProcessingResult {
  /** Производительность уборочной машины за один час основного времени, т/ч */
  performance: number;
  /** Время заполнения бункера комбайна, ч */
  bunkerFillTime: number;
  /** Расстояние до расчетной точки, км */
  bunkerFillDistance: number;
}

@Injectable({
  providedIn: 'root'
})
export class CombineProcessingService {
  // Исходные данные
  /** Конструктивная ширина захвата уборочной машины */
  public captureConstructionWidth = 9.3
  /** Коэффициент использования конструктивной ширины захвата */
  public captureUsageCoefficient = 0.9;
  /** Объёмная масса, т/м^3 */
  public volumeMass = 0.75
  /** Коэффициент использования объёма бункера */
  public bunkerUsageCoefficient = 0.9

  constructor() { }

  /** Вычислить рабочую ширину захвата уборочной машины */
  private getCaptureWorkingWidth(): number {
    return this.captureConstructionWidth * this.captureUsageCoefficient;
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
   * @param data Данные с датчиков уборочной машины
   * @param performance Производительность уборочной машины за один час рабочего времени
   */
  private getBunkerFillTime(data: CombineSensorsData, performance: number): number {
    return (data.bunkerFullness * this.volumeMass * this.bunkerUsageCoefficient) / performance;
  }

  /**
   * Вычислить расстояние до расчётной точки заполнения бункера
   * @param data Данные с датчиков уборочной машины
   * @param bunkerFillTime Время заполнения бункера комбайна, час (4)
   */
  private getBunkerFillDistance(data: CombineSensorsData, bunkerFillTime: number): number {
    return data.velocity / bunkerFillTime;
  }

  public calculateData(data: CombineSensorsData): CombineProcessingResult {
    const performance = this.getMachinePerformance(data);
    const bunkerFillTime = this.getBunkerFillTime(data, performance)
    const bunkerFillDistance = this.getBunkerFillDistance(data, bunkerFillTime)

    return {
      performance,
      bunkerFillTime,
      bunkerFillDistance,
    };
  }
}
