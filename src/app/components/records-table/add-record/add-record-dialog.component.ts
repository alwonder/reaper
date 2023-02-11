import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-record-dialog',
  templateUrl: './add-record-dialog.component.html',
  styleUrls: ['./add-record-dialog.component.scss']
})
export class AddRecordDialogComponent {
  public form = this.formBuilder.group({
    harvest: [],
    bunkerFullness: [],
    velocity: [],
  });

  constructor(
    public formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<void>,
  ) { }

  public onSubmit(): void {
    this.dialogRef.close(this.form.value);
  }
}
