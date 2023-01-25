import { Directive, OnDestroy } from '@angular/core';
import { MonoTypeOperatorFunction, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
  selector: 'base-component',
})
export class BaseComponent implements OnDestroy {
  private destroy: Subject<void> | undefined;
  protected takeUntilDestroy = <T>(): MonoTypeOperatorFunction<T> => {
    if (!this.destroy) this.destroy = new Subject<void>();
    return takeUntil<T>(this.destroy);
  };

  public ngOnDestroy(): void {
    if (this.destroy) {
      this.destroy.next();
      this.destroy.complete();
    }
  }
}
