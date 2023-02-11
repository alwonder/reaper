import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { sensorsLogData } from '../mock/sensors-log.data';
import { CombineProcessingOverallData, CombineSensorsData } from '../types/combine-processing.types';
import { CombineProcessingService } from './combine-processing.service';

@Injectable({
  providedIn: 'root'
})
export class RecordsRepositoryService {
  private sensorsRecordsSource = new BehaviorSubject<CombineSensorsData[]>([]);
  private combineRecordsSource = new BehaviorSubject<CombineProcessingOverallData[]>([]);
  private activeRecordIndexSource = new BehaviorSubject<number | null>(null);

  public combineRecords$ = this.combineRecordsSource.asObservable();

  public activeRecord$ = combineLatest([
    this.combineRecordsSource,
    this.activeRecordIndexSource,
  ])
    .pipe(map(([records, index]) => {
      if (index === null) return null;
      return records[index] ?? null;
    }));

  constructor(
    private combineProcessingService: CombineProcessingService
  ) {
    // Добавление тестовых данных, удалить в будущем
    sensorsLogData.forEach((data) => {
      this.addRecord(data);
    })

    // Пересчитать вычисляемые значения при изменении исходных данных
    this.combineProcessingService.predefinedData$.subscribe(() => {
      this.recalculateData()
    });
  }

  public addRecord(data: CombineSensorsData): void {
    this.sensorsRecordsSource.next([
      ...this.sensorsRecordsSource.value,
      data,
    ]);

    const combineRecords = this.combineRecordsSource.value;

    this.combineRecordsSource.next([
      ...combineRecords,
      this.combineProcessingService.getOverallRecord(data, combineRecords[combineRecords.length - 1])
    ])
  }

  public getRecord(index: number): CombineProcessingOverallData | null {
    return this.combineRecordsSource.value[index] ?? null;
  }

  public getActiveRecord(): CombineProcessingOverallData | null {
    const activeIndex = this.activeRecordIndexSource.value;
    if (activeIndex === null) return null;

    return this.combineRecordsSource.value[activeIndex] ?? null
  }

  public setActiveRecord(index: number | null): void {
    if (index === null) {
      this.activeRecordIndexSource.next(null);
    }
    this.activeRecordIndexSource.next(index);
  }

  private recalculateData(): void {
    const sensorRecords = this.sensorsRecordsSource.value;
    const newData: CombineProcessingOverallData[] = [];

    for (let i = 0; i < sensorRecords.length; i += 1) {
      const previousData = newData[i - 1];
      newData.push(this.combineProcessingService.getOverallRecord(sensorRecords[i], previousData))
    }
    this.combineRecordsSource.next(newData);
  }
}
