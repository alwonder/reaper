import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RecordsRepositoryService } from '../../services/records-repository.service';
import { CombineProcessingOverallData, CombineSensorsData } from '../../types/combine-processing.types';
import { BaseComponent } from '../base.directive';
import { AddRecordDialogComponent } from './add-record/add-record-dialog.component';

@Component({
  selector: 'app-records-table',
  templateUrl: './records-table.component.html',
  styleUrls: ['./records-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordsTableComponent extends BaseComponent implements OnInit {

  public records$ = this.recordsRepositoryService.combineRecords$;
  public activeRecord: CombineProcessingOverallData | null = null;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    public dialog: MatDialog,
    private recordsRepositoryService: RecordsRepositoryService
  ) {
    super();

    this.recordsRepositoryService.activeRecord$
      .pipe(this.takeUntilDestroy())
      .subscribe((record) => {
        this.activeRecord = record;
        this.changeDetectorRef.markForCheck();
      })
  }

  ngOnInit(): void {
  }

  public setActiveRecord(index: number | null): void {
    this.recordsRepositoryService.setActiveRecord(index);
  }

  public addRecord(): void {
    this.dialog.open(AddRecordDialogComponent)
      .afterClosed()
      .pipe(this.takeUntilDestroy())
      .subscribe((data?: CombineSensorsData) => {
        if (!data) return;

        this.recordsRepositoryService.addRecord(data);
      })
  }
}
