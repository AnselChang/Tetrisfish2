import { Injectable } from '@angular/core';
import { ExtractedState } from '../../models/capture-models/extracted-state';

@Injectable({
  providedIn: 'root'
})
export class ExtractedStateService {

  private state: ExtractedState = new ExtractedState();

  constructor() { }

  public get(): ExtractedState {
    return this.state;
  }
}
