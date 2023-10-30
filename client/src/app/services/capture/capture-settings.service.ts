import { Injectable } from '@angular/core';
import { CaptureSettings } from '../../models/game-models/capture-settings';

/*
Stores the board data as it is captured and send to server
*/

@Injectable({
  providedIn: 'root'
})
export class CaptureSettingsService {

  private captureState: CaptureSettings = new CaptureSettings();

  constructor() { }

  public get(): CaptureSettings {
    return this.captureState;
  }

}
