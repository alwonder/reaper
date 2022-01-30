import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER } from '@angular/core';

import { AppComponent } from './app.component';
import { AppService } from './app.service';
import { MapComponent } from './components/map/map.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent
  ],
  imports: [
    BrowserModule
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
