import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import DebugFrame from 'client/src/app/models/capture-models/debug-frame';
import { GamePlacement } from 'client/src/app/models/game-models/game-placement';
import { Method, fetchServer } from 'client/src/app/scripts/fetch-server';
import { GameDebugService } from 'client/src/app/services/game-debug.service';
import { UserService } from 'client/src/app/services/user.service';

@Component({
  selector: 'app-debug-game',
  templateUrl: './debug-game.component.html',
  styleUrls: ['./debug-game.component.scss']
})
export class DebugGameComponent implements OnInit {

  private index = 0;

  constructor(
    public gameDebugService: GameDebugService,
    private route: ActivatedRoute,
  ) {}

  // if there is a route parameters for a specific game, load it
  ngOnInit() {
    // Subscribe to paramMap to get the route parameters
    this.route.paramMap.subscribe(params => {
      // Get a specific parameter by name
      const gameID = params.get('game');
      console.log("GameID:", gameID);

      if (gameID) this.gameDebugService.loadAndDeserialize(gameID);      
    });
  }
  get current(): DebugFrame {
    return this.gameDebugService.getFrame(this.index);
  }

  exists(): boolean {
    return this.gameDebugService.exists();
  }

  get currentPlacement():  GamePlacement | undefined {
    return this.current?.placement;
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

  get status() {
    return this.current.status;
  }

}
