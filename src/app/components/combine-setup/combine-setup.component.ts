import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { CombineProcessingService } from '../../services/combine-processing.service';
import { BaseComponent } from '../base.directive';

@Component({
  selector: 'app-combine-setup',
  templateUrl: './combine-setup.component.html',
  styleUrls: ['./combine-setup.component.scss']
})
export class CombineSetupComponent extends BaseComponent {
  public form = this.formBuilder.group({
    /** Конструктивная ширина захвата уборочной машины */
    captureConstructionWidth: [0],
    /** Коэффициент использования конструктивной ширины захвата */
    captureUsageCoefficient: [0],
    /** Объёмная масса, т/м^3 */
    volumeMass: [0],
    /** Коэффициент использования объёма бункера */
    bunkerUsageCoefficient: [0],
  })

  constructor(
    private formBuilder: FormBuilder,
    private combineProcessingService: CombineProcessingService
  ) {
    super();

    this.combineProcessingService.predefinedData$
      .pipe(this.takeUntilDestroy())
      .subscribe((data) => {
        this.form.patchValue(data);
      })
  }

  public onSubmit(): void {
    if (!this.form.valid) {
      this.form.markAsDirty();
      return;
    }

    this.combineProcessingService.setPredefinedData(this.form.value);
    this.form.markAsPristine();
  }

  public reset(): void {
    this.form.patchValue(this.combineProcessingService.getPredefinedData());
  }
}
