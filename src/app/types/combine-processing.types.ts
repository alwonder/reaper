export interface CombineSensorsData {
  /** Урожайность, Га */
  harvest: number;
  /** Заполненность бункера, м^3 */
  bunkerFullness: number;
  /** Рабочая скорость, км/ч */
  velocity: number;
}

export interface CombineProcessedResult {
  /** Производительность уборочной машины за один час основного времени, т/ч */
  performance: number;
  bunkerDelta: number;
  /** Время заполнения бункера комбайна, ч */
  bunkerFillTime: number;
  bunkerVolFullness: number;
  /** Расстояние до расчетной точки, км */
  bunkerFillDistance: number;
  /** Пройденное расстояние, км */
  distanceTraveled: number;
}

export type CombineProcessingOverallData = CombineSensorsData & CombineProcessedResult
