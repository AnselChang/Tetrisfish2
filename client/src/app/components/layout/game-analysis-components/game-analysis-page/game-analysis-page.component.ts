import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { MoveRecommendation } from 'client/src/app/models/analysis-models/engine-movelist';
import { RateMoveDeep } from 'client/src/app/models/analysis-models/rate-move';
import { GameSpeed, getSpeedFromLevel } from 'client/src/app/models/evaluation-models/rating';
import { Game } from 'client/src/app/models/game-models/game';
import { GamePlacement } from 'client/src/app/models/game-models/game-placement';
import MoveableTetromino from 'client/src/app/models/game-models/moveable-tetromino';
import BinaryGrid from 'client/src/app/models/tetronimo-models/binary-grid';
import { ALL_TETROMINO_TYPES, TetrominoType } from 'client/src/app/models/tetronimo-models/tetromino';
import { InputSpeed } from 'client/src/app/scripts/evaluation/input-frame-timeline';
import { Method, fetchServer } from 'client/src/app/scripts/fetch-server';
import { GameCacheService } from 'client/src/app/services/game-cache.service';
import formatDistanceStrict from 'date-fns/formatDistanceStrict';
import { GameFromDatabase } from 'shared/models/game-from-database';

@Component({
  selector: 'app-game-analysis-page',
  templateUrl: './game-analysis-page.component.html',
  styleUrls: ['./game-analysis-page.component.scss']
})
export class GameAnalysisPageComponent implements OnInit, OnDestroy {

  public game?: Game;

  public placementIndex: number = 0;
  public isTemporaryPlacement: boolean = false;

  private currentAnalysingIndex: number = 0;
  private analyzingIntervalID?: any;

  public hoveredRecommendation?: MoveRecommendation;
  public hoveredNNB?: TetrominoType | "default" = this.hoveredNNB;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notifier: NotifierService,
    private gameCacheService: GameCacheService,
  ) {}

  // get all the piece types excluding the current next piece
  getPieceTypes(): TetrominoType[] {
    return ALL_TETROMINO_TYPES;
  }

  // if there is a route parameters for a specific game, load it
  ngOnInit() {


    // Subscribe to paramMap to get the route parameters
    this.route.queryParams.subscribe(params => {
      // Get a specific parameter by name
      const gameID = params['id'];
      console.log("GameID:", gameID);

      // if game ID is not defined, redirect to analysis page
      if (!gameID) {
        this.notifier.hide("game-loading");
        this.notifier.notify("error", "Game not found");
        this.router.navigate(['/analysis']);
      } else if (this.gameCacheService.hasGame(gameID)) {

        // if game is cached, load it
        this.game = this.gameCacheService.getGame(gameID);
        console.log("Loaded cached game", gameID);
        
      
      } else {

        console.log("Game not cached, loading from server", gameID);
        // it might take a second to load the placements. note that analysis will be computed after initial load
        this.notifier.notify("info", "Loading game...", "game-loading");

        // Otherwise, load game
        fetchServer(Method.GET, "/api/get-game", {id : gameID}).then(({status, content}) => {
          if (status === 200) {
            this.loadGame(content as GameFromDatabase);
          } else {
            this.notifier.hide("game-loading");
            this.notifier.notify("error", "Game not found");
            this.router.navigate(['/analysis']);
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    // stop analyzing placements from previous game if any
    if (this.analyzingIntervalID) {
      clearInterval(this.analyzingIntervalID);
    }
  }

  // build a Game object from the database game data 
  loadGame(dbGame: GameFromDatabase) {

    // stop analyzing placements from previous game if any
    if (this.analyzingIntervalID) {
      clearInterval(this.analyzingIntervalID);
    }

    console.log("Loading game", dbGame);

    // create game object to store placements. will be assigned to this.game after all placements are loaded
    const game = new Game(dbGame.startLevel, dbGame.inputSpeed as InputSpeed, dbGame.playerName, dbGame.gameID);
    game.setTimestamp(new Date(dbGame.timestamp));

    // add placements
    dbGame.placements.forEach(placement => {
      const grid = BinaryGrid.fromCompressedString(placement.b);
      game.addNewPosition(grid, placement.c as TetrominoType, placement.n as TetrominoType, false);
      const mt = new MoveableTetromino(placement.c as TetrominoType, placement.r, placement.x, placement.y);
      game.setPlacementForLastPosition(mt, placement.l, false);
    });

    // set game object
    this.game = game;

    // cache game
    this.gameCacheService.cacheGame(game);

    // hide loading notification after 1 second
    setTimeout(() => {
      this.notifier.hide("game-loading");
      this.setPlacement(0);
    }, 1000);

    // analyze one placement a second for rate-limiting. this is to prevent requests from piling up
    this.analyzingIntervalID = setInterval(() => {
      this.analyzePlacementIfNotAnalyzed(this.currentAnalysingIndex);
      this.currentAnalysingIndex++;

      if (this.currentAnalysingIndex >= this.game!.numPlacements) {
        console.log("Finished analyzing placements");
        clearInterval(this.analyzingIntervalID);
      }

    }, 750);


  }

  getPosition(): GamePlacement {
    return this.game!.getPlacementAt(this.placementIndex);
  }

  getPlayerRating(): RateMoveDeep | undefined {
    return this.getPosition().analysis.getRateMoveDeep();
  }

  getRelativeTime(): string {
    if (!this.game) return "";
    if (!this.game.getTimestamp()) return "";
    const result = formatDistanceStrict(this.game!.getTimestamp()!, new Date());
    return result + " ago";
  }

  hasPrevious(): boolean {
    return this.placementIndex > 0;
  }

  previous() {
    if (this.hasPrevious()) {
      this.setPlacement(this.placementIndex - 1);
    }
  }

  hasNext(): boolean {
    return this.placementIndex < this.game!.numPlacements - 1;
  }

  next() {
    if (this.hasNext()) {
      this.setPlacement(this.placementIndex + 1);
    }
  }

  public analyzePlacementIfNotAnalyzed(index: number) {
    console.log("Analyzing placement", index+1);
    const placement = this.game!.getPlacementAt(index);
    if (placement && !placement.analysis.isAnalysisStarted()) {
      this.game!.runFullAnalysis(placement);
    }
  }

  public setPlacement(index: number) {
    this.placementIndex = index;

    // only analyze placement if not while scrubbing through placements with graph
    if (!this.isTemporaryPlacement) {
      this.analyzePlacementIfNotAnalyzed(this.placementIndex);
    } else {
      console.log("Not analyzing placement because it is temporary");
    }
  }

  // toggle whether the current placement is temporary (from graph). // make sure the newly selected placement is analyzed
  public setWhetherTemporaryPlacement(isTemporary: boolean) {
    console.log("Setting temporary placement to", isTemporary);
    this.isTemporaryPlacement = isTemporary;
    if (!isTemporary) this.analyzePlacementIfNotAnalyzed(this.placementIndex);
  }

  public setHoveredRecommendation(rec: MoveRecommendation | undefined) {
    this.hoveredRecommendation = rec;
  }

  // when NNB type is hovered, show the NNB recommendation.
  // if "default", show default recommendation
  // if undefined, disable
  public setHoverNNB(type: TetrominoType | "default" | undefined = undefined) {
    this.hoveredNNB = type;
  }



  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {

    if (event.key === "ArrowLeft" || event.key === ",") {
      this.previous();
    } else if (event.key === "ArrowRight" || event.key === ".") {
      this.next();
    }
  }

  

}
