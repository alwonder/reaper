import { Component, OnInit } from '@angular/core';
import { HarvestFieldService } from '../../services/harvest-field.service';

@Component({
  selector: 'app-field-setup',
  templateUrl: './field-setup.component.html',
  styleUrls: ['./field-setup.component.scss']
})
export class FieldSetupComponent implements OnInit {
  public drawMode$ = this.harvestFieldService.drawMode$;
  constructor(
    private harvestFieldService: HarvestFieldService,
  ) { }

  ngOnInit(): void {
  }

  public enableDrawMode(): void {
    this.harvestFieldService.drawMode$.next(true);
  }

  public applyDrawnField(): void {
    this.harvestFieldService.drawModeApply$.next();
    this.harvestFieldService.drawMode$.next(false);
  }

  public cancelDrawnField(): void {
    this.harvestFieldService.drawModeCancel$.next();
    this.harvestFieldService.drawMode$.next(false);
  }
}
