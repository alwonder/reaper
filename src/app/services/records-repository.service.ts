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
    const calculatedData = this.combineProcessingService.calculateData(data);
    this.combineRecordsSource.next([
      ...this.combineRecordsSource.value,
      { ...data, ...calculatedData }
    ]);
  }

  public getRecord(index: number): CombineProcessingOverallData | null {
    return this.combineRecordsSource.value[index] ?? null;
  }

  public setActiveRecord(index: number | null): void {
    if (index === null) {
      this.activeRecordIndexSource.next(null);
    }
    this.activeRecordIndexSource.next(index);
  }

  private recalculateData(): void {
    this.combineRecordsSource.next(
      this.combineRecordsSource.value.map((record) => ({
        ...record,
        ...this.combineProcessingService.calculateData(record)
      }))
    )
  }
}
