import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MapPoint } from '../../../types/map.types';

const COORDINATES_REGEXP = /^([+-]?(?:\d*\.)?\d+)(?:,\s*|\s+)([+-]?(?:\d*\.)?\d+)$/;

@Component({
  selector: 'go-to-field-dialog',
  templateUrl: './go-to-field-dialog.component.html',
  styleUrls: ['./go-to-field-dialog.component.scss']
})
export class GoToFieldDialogComponent {
  public form = this.formBuilder.group({
    coordinates: ['', this.coordinatesValid],
  });

  constructor(
    public formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<void>,
  ) { }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAsDirty();
      return;
    }

    this.dialogRef.close(this.parseCoordinates(this.form.value.coordinates));
  }

  public coordinatesValid(control: AbstractControl): ValidationErrors | null {
    if (control.value === null || control.value === undefined || control.value === '') {
      return null;
    }

    if (GoToFieldDialogComponent.checkCoordinates(control.value)) {
      return null;
    }

    return { coordinatesValid: true };
  }

  private parseCoordinates(coordinatesString: string,): MapPoint {
    const match = COORDINATES_REGEXP.exec(coordinatesString.trim());

    if (!match || match.length !== 3) {
      throw new Error('Внутренняя ошибка при парсинге координат');
    }

    return [parseFloat(match[2]!), parseFloat(match[1]!)]
  }

  private static checkCoordinates(coordinates: string,): boolean {
    if (!coordinates) return true;
    return COORDINATES_REGEXP.test(coordinates.trim());
  }
}
