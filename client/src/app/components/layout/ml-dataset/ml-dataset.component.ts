import { Component, OnInit } from '@angular/core';
import { MLDataPoint, MLPlacement } from 'client/src/app/machine-learning/ml-placement';
import BinaryGrid from 'client/src/app/models/tetronimo-models/binary-grid';
import { TetrominoType } from 'client/src/app/models/tetronimo-models/tetromino';
import { Method, fetchServer } from 'client/src/app/scripts/fetch-server';
import { Serialized18Placements } from 'server/database/game/game-service';
import { GlobalStats } from 'server/database/global-stats/global-stats-schema';
import { SerializedPlacement } from 'shared/models/serialized-game';
import { exportToCSV } from './csv';

@Component({
  selector: 'app-ml-dataset',
  templateUrl: './ml-dataset.component.html',
  styleUrls: ['./ml-dataset.component.scss']
})
export class MlDatasetComponent implements OnInit {

  public numPlacements: number = 0;
  public numGames: number = 0;

  public serializedPlacements?: Serialized18Placements;
  public extractingData: boolean = false;
  public finishedExtractingData: boolean = false;

  public mlPlacements?: MLPlacement[];
  public filteringPlacements: boolean = false;
  public finishedFilteringPlacements: boolean = false;

  public annotationProgress?: number;
  public annotatingPlacements: boolean = false;
  public finishedAnnotatingPlacements: boolean = false;

  public numAnnotated: number = 0;

  constructor() { }

  ngOnInit(): void {

    fetchServer(Method.GET, "/api/get-global-stats").then(({ status, content}) => {
      if (status === 200) {
        const globalStats = content as GlobalStats;
        console.log(globalStats);

        this.numPlacements = globalStats.placementCount;
        this.numGames = globalStats.gameCount;

      } else {
        console.log("error");
      }
    });

  }

  async extractData() {
    console.log("extracting data");

    this.extractingData = true;

    setTimeout(async () => {

      const { status, content } = await fetchServer(Method.GET, "api/get-all-18-placements");

      if (status !== 200) {
        console.log("error in server api call api/get-all-18-placements");
        return;
      }

      this.serializedPlacements = content as Serialized18Placements;
      this.finishedExtractingData = true;
    }, 0);
  }

  private getMLPlacements(placements: SerializedPlacement[]): MLPlacement[] {

    return placements.map(placement => {
      
      const grid = BinaryGrid.fromCompressedString(placement.b);
      const currentPieceType = placement.c as TetrominoType;
      const nextPieceType = placement.n as TetrominoType;

      return new MLPlacement(grid, currentPieceType, nextPieceType);
    });
  }

  async filterPlacements() {

    // first, convert serialized placements to MLPlacements
    if (!this.serializedPlacements) return;

    this.filteringPlacements = true;
    setTimeout(() => {

      this.mlPlacements = this.getMLPlacements(this.serializedPlacements!.placements);

      // filter invalid placements
      this.mlPlacements = this.mlPlacements.filter(placement => placement.isBoardValidForML());
      this.finishedFilteringPlacements = true;
    }, 0);

  }

  async annotatePlacements() {

    if (!this.mlPlacements) return;

    this.annotatingPlacements = true;

    this.numAnnotated = 0;

    const dataPoints: MLDataPoint[] = [];

    setTimeout(async () => {

      const BATCH_SIZE = 20;
      for (let i = 0; i < this.mlPlacements!.length; i += BATCH_SIZE) {
        const batch = this.mlPlacements!.slice(i, i + BATCH_SIZE);
        const urls = batch.map(placement => placement.runSRRawEval());
        const responses = await Promise.all(urls);

        for (let j = 0; j < batch.length; j++) {
          const placement = batch[j];
          
          if (placement.getDataPoint()) dataPoints.push(placement.getDataPoint()!);
        }

        this.numAnnotated += responses.length;
      }

      // now we have all the data points, export as csv
      exportToCSV(dataPoints, "labelled_placements.csv");

    });
  }

}
