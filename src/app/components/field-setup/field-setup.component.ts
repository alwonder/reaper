import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HarvestFieldService } from '../../services/harvest-field.service';

@Component({
  selector: 'app-field-setup',
  templateUrl: './field-setup.component.html',
  styleUrls: ['./field-setup.component.scss']
})
export class FieldSetupComponent implements OnInit {
  public drawMode$ = this.harvestFieldService.drawMode$;
  public replaceChangeMode$ = this.harvestFieldService.replaceChangeMode$;
  public activeCorner$ = this.harvestFieldService.activeCorner$;
  public corners$: Observable<number[]> = this.harvestFieldService.field$
    .pipe(map((field) => Array(field.length - 1)))

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

  public onActiveCornerChange($event: Event): void {
    // @ts-expect-error
    this.activeCorner$.next(parseInt($event.target.value));
  }

  public setActiveCorner(index: number): void {
    this.harvestFieldService.activeCorner$.next(index);
  }

  public changeRouteDirection(): void {
    this.harvestFieldService.routeDirection$.next(!this.harvestFieldService.routeDirection$.value);
  }

  public toggleReplaceMode(): void {
    this.harvestFieldService.replaceChangeMode$.next(
      !this.harvestFieldService.replaceChangeMode$.value
    );
  }
}
