import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER } from '@angular/core';

import { AppComponent } from './app.component';
import { AppService } from './app.service';
import { MapComponent } from './components/map/map.component';
import { BaseComponent } from './components/base.directive';
import { RecordsTableComponent } from './components/records-table/records-table.component';
import { CombineSetupComponent } from './components/combine-setup/combine-setup.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AddRecordDialogComponent } from './components/records-table/add-record/add-record-dialog.component';

@NgModule({
  declarations: [
    AddRecordDialogComponent,
    AppComponent,
    BaseComponent,
    CombineSetupComponent,
    MapComponent,
    RecordsTableComponent,
  ],
  imports: [
    BrowserModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatTabsModule,
    NoopAnimationsModule,
    ReactiveFormsModule,
  ],
  providers: [
    AppService,
    {
      provide: APP_INITIALIZER,
      useFactory: (appService: AppService) => () => appService.load(),
      deps: [AppService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
