import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Game } from 'client/src/app/models/game-models/game';
import { GameSpeed, getSpeedFromLevel } from 'client/src/app/models/evaluation-models/rating';
import { COLOR_FIRST_COLORS, COLOR_SECOND_COLORS, TetrominoType } from 'client/src/app/models/tetronimo-models/tetromino';

class DroughtLocation {
  public readonly length: number;
  public readonly tooltip: string;
  constructor(public startIndex: number, public endIndex: number, numBurns: number) {
    this.length = endIndex - startIndex + 1;
    this.tooltip = `Drought (${this.length} placements): ${numBurns} burns`;
  }
}

class TetrisReadyLocation {
  public readonly length: number;
  public readonly tooltip: string;
  constructor(public startIndex: number, public endIndex: number, numTetrises: number, numBurns: number) {
    this.length = endIndex - startIndex + 1;
    this.tooltip = `Tetris ready (${this.length} placements): ${numTetrises} tetrises, ${numBurns} burns`;
  }
}

class NotTetrisReadyLocation {
  public readonly length: number;
  public readonly tooltip: string;
  constructor(public startIndex: number, public endIndex: number, numBars: number, numTetrises: number, numBurns: number) {
    this.length = endIndex - startIndex + 1;
    this.tooltip = `Not tetris ready (${this.length} placements): ${numBars} I-pieces, ${numTetrises} tetrises, ${numBurns} burns`;
  }
}

class RightWellLocation {
  public readonly length: number;
  public readonly tooltip: string;
  constructor(public startIndex: number, public endIndex: number, numBars: number, numTetrises: number, numBurns: number) {
    this.length = endIndex - startIndex + 1;
    this.tooltip = `Right well open (${this.length} placements): ${numBars} I-pieces, ${numTetrises} tetrises, ${numBurns} burns`;
  }
}

class NotRightWellLocation {
  public readonly length: number;
  public readonly tooltip: string;
  constructor(public startIndex: number, public endIndex: number, numBars: number, numTetrises: number, numBurns: number) {
    this.length = endIndex - startIndex + 1;
    this.tooltip = `Right well closed (${this.length} placements): ${numBars} I-pieces, ${numTetrises} tetrises, ${numBurns} burns`;
  }
}

class SpeedPlacementPair {
  public numPlacements: number = 0;
  constructor(public speed: GameSpeed, public placementIndex: number) {}
}

// the placement index and accuracy for a point to be displayed on the graph
class PlacementAccuracyIndex {
  public readonly color;
  constructor(public placementIndex: number, public accuracy: number) {
    this.color = 0;
  }
}

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit, OnChanges {
  @ViewChild('svgElement') svgElement!: ElementRef<SVGElement>;
  @Input() game!: Game;
  @Input() currentPlacement!: number;
  @Output() setHoveredPlacement = new EventEmitter<number>();
  @Output() isTemporaryPlacement = new EventEmitter<boolean>();
  

  hoveredPlacement: number | null = null; // Column currently being hovered
  lastPermanentPlacement: number = 0;
  speedPlacementPairs!: SpeedPlacementPair[];
  displayPlacementAccuracies: PlacementAccuracyIndex[] = [];
  droughts: DroughtLocation[] = [];
  tetrisReady: TetrisReadyLocation[] = [];
  notTetrisReady: NotTetrisReadyLocation[] = [];
  rightWell: RightWellLocation[] = [];
  notRightWell: NotRightWellLocation[] = [];


  private afterClickPlacement = false;

  constructor() {
  }

  get numPlacements(): number {
    return this.game.numPlacements;
  }

  ngOnInit(): void {
      this.onGameChange();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['game']) {
      this.onGameChange();
    }
  }

  // run when a new game is set. calculate things like intervals for speeds for graph, etc.
  onGameChange() {

    this.updateSpeedPlacementPairs();
    this.updateDisplayPlacementAccuracies();
    this.updateDroughts();
    this.updateTetrisReady();
    this.updateNotTetrisReady();
    this.updateRightWell();
    this.updateNotRightWell();
  }

  private updateSpeedPlacementPairs() {
    // create a list of [speed, placementIndex] pairs for graph
    this.speedPlacementPairs = [];
    let currentSpeed: GameSpeed | undefined = undefined;
    this.game.getAllPlacements().forEach((placement, index) => {
      const speed = getSpeedFromLevel(placement.statusBeforePlacement.level);

      // new speed detected
      if (speed !== currentSpeed) {
        if (currentSpeed !== undefined) {
          const prevPair = this.speedPlacementPairs![this.speedPlacementPairs!.length-1];
          prevPair.numPlacements = index - prevPair.placementIndex;
        }

        this.speedPlacementPairs!.push(new SpeedPlacementPair(speed, index));
        currentSpeed = speed;
      }
    });

    // set last pair
    const lastPair = this.speedPlacementPairs![this.speedPlacementPairs!.length-1];
    lastPair.numPlacements = this.game.numPlacements - lastPair.placementIndex;
  }

  private updateDisplayPlacementAccuracies() {

    // only consider inaccuracies, mistakes, and blunders
    this.displayPlacementAccuracies = [];
    // this.game.getAllPlacements().forEach((placement, index) => {
    //   placement.analysis.getRateMoveDeep()!.
    // });

  }

  // a drought is defined as 14 more placements without a longbar. Identify all such moments
  private updateDroughts() {
    this.droughts = [];

    let startIndex = 0;
    let droughtLength = 0;
    const MIN_DROUGHT_LENGTH = 14;

    let numBurns = 0;

    this.game.getAllPlacements().forEach((placement, index) => {
      const piece = placement.currentPieceType;


      if (piece === TetrominoType.I_TYPE) {
        if (droughtLength >= MIN_DROUGHT_LENGTH) {
          this.droughts.push(new DroughtLocation(startIndex, index - 1, numBurns));
        }
        startIndex = index + 1;
        droughtLength = 0;
        numBurns = 0;
      } else {
        if (placement.placementLineClears) numBurns += placement.placementLineClears;
        droughtLength++;
      }
    });
    if (droughtLength >= MIN_DROUGHT_LENGTH) {
      this.droughts.push(new DroughtLocation(startIndex, this.game.numPlacements - 1, numBurns));
    }
  }

  // Identify all intervals where board was tetris ready
  private updateTetrisReady() {
    this.tetrisReady = [];

    let startIndex = 0;
    let numTetrises = 0;
    let numBurns = 0;

    this.game.getAllPlacements().forEach((placement, index) => {

      if (!placement.getGridWithPlacement().isTetrisReady()) {
        if (startIndex !== index) {
          this.tetrisReady.push(new TetrisReadyLocation(startIndex, index - 1, numTetrises, numBurns));
          numTetrises = 0;
          numBurns = 0;
        }
        startIndex = index + 1;
      } else {
        if (placement.placementLineClears) {
          if (placement.placementLineClears === 4) {
            numTetrises++;
          } else {
            numBurns += placement.placementLineClears;
          }
        }
      }
    });
    if (startIndex !== this.game.numPlacements) {
      this.tetrisReady.push(new TetrisReadyLocation(startIndex, this.game.numPlacements-1, numTetrises, numBurns));
    }
  }

  // Identify all intervals where board was tetris ready
  private updateNotTetrisReady() {
    this.notTetrisReady = [];

    let startIndex = 0;
    let numTetrises = 0;
    let numBurns = 0;
    let numBars = 0;

    this.game.getAllPlacements().forEach((placement, index) => {

      if (placement.grid.isTetrisReady()) { // ends the interval
        if (startIndex !== index) {
          this.notTetrisReady.push(new NotTetrisReadyLocation(startIndex, index - 1, numBars, numTetrises, numBurns));
          numTetrises = 0;
          numBurns = 0;
          numBars = 0;
        }
        startIndex = index + 1;
      } else {
        if (placement.placementLineClears) {
          if (placement.placementLineClears === 4) {
            numTetrises++;
          } else {
            numBurns += placement.placementLineClears;
          }
        }
        if (placement.currentPieceType === TetrominoType.I_TYPE) {
          numBars++;
        }
      }
    });
    if (startIndex !== this.game.numPlacements) {
      this.notTetrisReady.push(new NotTetrisReadyLocation(startIndex, this.game.numPlacements-1, numBars, numTetrises, numBurns));
    }
  }

  // Identify all intervals where board had open right well
  private updateRightWell() {
    this.rightWell = [];

    let startIndex = 0;
    let numTetrises = 0;
    let numBurns = 0;
    let numBars = 0;

    this.game.getAllPlacements().forEach((placement, index) => {

      if (!placement.grid.isRightWellOpen()) { // ends the interval
        if (startIndex !== index) {
          this.rightWell.push(new RightWellLocation(startIndex, index - 1, numBars, numTetrises, numBurns));
          numTetrises = 0;
          numBurns = 0;
          numBars = 0;
        }
        startIndex = index + 1;
      } else {
        if (placement.placementLineClears) {
          if (placement.placementLineClears === 4) {
            numTetrises++;
          } else {
            numBurns += placement.placementLineClears;
          }
        }
        if (placement.currentPieceType === TetrominoType.I_TYPE) {
          numBars++;
        }
      }
    });
    if (startIndex !== this.game.numPlacements) {
      this.rightWell.push(new RightWellLocation(startIndex, this.game.numPlacements-1, numBars, numTetrises, numBurns));
    }
  }

  // Identify all intervals where board had closed right well
  private updateNotRightWell() {
    this.notRightWell = [];

    let startIndex = 0;
    let numTetrises = 0;
    let numBurns = 0;
    let numBars = 0;

    this.game.getAllPlacements().forEach((placement, index) => {

      if (placement.grid.isRightWellOpen()) { // ends the interval
        if (startIndex !== index) {
          this.notRightWell.push(new NotRightWellLocation(startIndex, index - 1, numBars, numTetrises, numBurns));
          numTetrises = 0;
          numBurns = 0;
          numBars = 0;
        }
        startIndex = index + 1;
      } else {
        if (placement.placementLineClears) {
          if (placement.placementLineClears === 4) {
            numTetrises++;
          } else {
            numBurns += placement.placementLineClears;
          }
        }
        if (placement.currentPieceType === TetrominoType.I_TYPE) {
          numBars++;
        }
      }
    });
    if (startIndex !== this.game.numPlacements) {
      this.notRightWell.push(new NotRightWellLocation(startIndex, this.game.numPlacements-1, numBars, numTetrises, numBurns));
    }
  }


  onMouseMove(event: MouseEvent): void {
    const svgRect = this.svgElement.nativeElement.getBoundingClientRect();
    const x = event.clientX - svgRect.left; // x position within the element.
    this.hoveredPlacement = Math.floor(x / svgRect.width * this.numPlacements);

    if (this.hoveredPlacement && !this.afterClickPlacement) this.setHoveredPlacement.emit(this.hoveredPlacement);
  }

  onMouseEnter(): void {
    this.afterClickPlacement = false;
    this.lastPermanentPlacement = this.currentPlacement;
    this.isTemporaryPlacement.emit(true);
  }

  onMouseLeave(): void {
    this.hoveredPlacement = null;
    this.setHoveredPlacement.emit(this.lastPermanentPlacement);
    this.isTemporaryPlacement.emit(false);
  }

  onClickPlacement() {
    if (this.hoveredPlacement) {
      this.afterClickPlacement = true;
      this.setHoveredPlacement.emit(this.hoveredPlacement);
      this.isTemporaryPlacement.emit(false);
      this.lastPermanentPlacement = this.hoveredPlacement;
    }
  }

  getSVGDisplayPlacementWidth(): number {
    return Math.ceil(this.numPlacements / 200);
  }

  getColorForSpeed(speed: GameSpeed): string {
    switch (speed) {
      case GameSpeed.SPEED_UNDER_18: return COLOR_FIRST_COLORS[5];
      case GameSpeed.SPEED_18: return COLOR_FIRST_COLORS[8];
      case GameSpeed.SPEED_19: return COLOR_SECOND_COLORS[9];
      default: return COLOR_FIRST_COLORS[9];
    }
  }
}
