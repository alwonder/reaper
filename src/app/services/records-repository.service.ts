import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { sensorsLogData } from '../mock/sensors-log.data';
import { CombineProcessingOverallData, CombineSensorsData } from '../types/combine-processing.types';
import { CombineProcessingService } from './combine-processing.service';

@Injectable({
  providedIn: 'root'
})
export class RecordsRepositoryService {
  private combineRecordsSource = new BehaviorSubject<CombineProcessingOverallData[]>([]);
  private activeRecordSource = new BehaviorSubject<CombineProcessingOverallData | null>(null);

  public combineRecords$ = this.combineRecordsSource.asObservable();

  public activeRecord$ = this.activeRecordSource.asObservable();

  constructor(
    private combineProcessingService: CombineProcessingService
  ) {
    // Добавление тестовых данных, удалить в будущем
    sensorsLogData.forEach((data) => {
      this.addRecord(data);
    })
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

  public setActiveRecord(record: CombineProcessingOverallData | null): void;
  public setActiveRecord(index: number | null): void;
  public setActiveRecord(record: number | CombineProcessingOverallData | null): void {
    if (record === null) {
      this.activeRecordSource.next(null);
    } else if (typeof record === 'number') {
      this.activeRecordSource.next(this.combineRecordsSource.value[record] ?? null);
    } else {
      this.activeRecordSource.next(record);
    }
  }
}
