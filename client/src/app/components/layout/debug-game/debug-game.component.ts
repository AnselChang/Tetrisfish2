import { Component } from '@angular/core';
import DebugFrame from 'client/src/app/models/capture-models/debug-frame';
import { GameDebugService } from 'client/src/app/services/game-debug.service';

@Component({
  selector: 'app-debug-game',
  templateUrl: './debug-game.component.html',
  styleUrls: ['./debug-game.component.scss']
})
export class DebugGameComponent {

  private index = 0;

  constructor(
    private gameDebugService: GameDebugService
  ) {}

  get current(): DebugFrame {
    return this.gameDebugService.getFrame(this.index);
  }

  previous(increment: number = 1) {
    this.index = Math.max(0, this.index - increment);
  }

  hasPrevious(): boolean {
    return this.index > 0;
  }

  next(increment: number = 1) {
    this.index = Math.min(this.gameDebugService.numFrames() - 1, this.index + increment);
  }

  hasNext(): boolean {
    return this.index < this.gameDebugService.numFrames() - 1;
  }

  previousPlacement() {

    if (!this.hasPrevious()) {
      return;
    }

    let index = this.index - 1;
    while (this.gameDebugService.getFrame(index).placement === undefined) {
      index--;
      if (index < 0) {
        return;
      }
    }
    this.index = index;
  }

  nextPlacement() {

    if (!this.hasNext()) {
      return;
    }

    let index = this.index + 1;
    while (this.gameDebugService.getFrame(index).placement === undefined) {
      index++;
      if (index >= this.gameDebugService.numFrames()) {
        return;
      }
    }
    this.index = index;
  }

  start() {
    this.index = 0;
  }
  
  end() {
    this.index = this.gameDebugService.numFrames() - 1;
  }

}
