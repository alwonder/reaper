export interface CombineSensorsData {
  /** Урожайность, Га */
  harvest: number;
  /** Заполненность бункера, м^3 */
  bunkerFullness: number;
  /** TODO что-то новое для дельты */
  bunkerVolFullness: number;
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

export type CombineProcessingOverallData = CombineSensorsData & CombineProcessingResult
