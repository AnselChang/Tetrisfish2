import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { Game } from 'client/src/app/models/game-models/game';
import MoveableTetromino from 'client/src/app/models/game-models/moveable-tetromino';
import BinaryGrid from 'client/src/app/models/tetronimo-models/binary-grid';
import { TetrominoType } from 'client/src/app/models/tetronimo-models/tetromino';
import { InputSpeed } from 'client/src/app/scripts/evaluation/input-frame-timeline';
import { Method, fetchServer } from 'client/src/app/scripts/fetch-server';
import { GameFromDatabase } from 'shared/models/game-from-database';

@Component({
  selector: 'app-game-analysis-page',
  templateUrl: './game-analysis-page.component.html',
  styleUrls: ['./game-analysis-page.component.scss']
})
export class GameAnalysisPageComponent implements OnInit {

  public game?: Game;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notifier: NotifierService
  ) {}

  // if there is a route parameters for a specific game, load it
  ngOnInit() {
    // Subscribe to paramMap to get the route parameters
    this.route.queryParams.subscribe(params => {
      // Get a specific parameter by name
      const gameID = params['id'];
      console.log("GameID:", gameID);

      // if game ID is not defined, redirect to analysis page
      if (!gameID) {
        this.notifier.notify("error", "Game not found");
        this.router.navigate(['/analysis']);
      } else {
        // Otherwise, load game
        fetchServer(Method.GET, "/api/get-game", {id : gameID}).then(({status, content}) => {
          if (status === 200) {
            this.loadGame(content as GameFromDatabase);
          } else {
            this.notifier.notify("error", "Game not found");
            this.router.navigate(['/analysis']);
          }
        });
      }
    });
  }

  // build a Game object from the database game data 
  loadGame(dbGame: GameFromDatabase) {

    // it might take a second to load the placements. note that analysis will be computed after initial load
    this.notifier.notify("info", "Loading game...");

    // create game object to store placements. will be assigned to this.game after all placements are loaded
    const game = new Game(dbGame.startLevel, dbGame.inputSpeed as InputSpeed);

    // add placements
    dbGame.placements.forEach(placement => {
      const grid = BinaryGrid.fromCompressedString(placement.b);
      game.addNewPosition(grid, placement.c as TetrominoType, placement.n as TetrominoType);
      const mt = new MoveableTetromino(placement.n as TetrominoType, placement.r, placement.x, placement.y);
      game.setPlacementForLastPosition(mt, placement.l);
    });

    // set game object
    this.game = game;

  }

}
