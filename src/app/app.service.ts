import { Injectable } from '@angular/core';
import { hackMapboxApi } from './utils/hack-mapbox-api.util';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  public load() {
    hackMapboxApi();
  }
}
