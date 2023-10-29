import { Component } from '@angular/core';
import GameStatus from 'client/src/app/models/immutable-tetris-models/game-status';
import BinaryGrid, { BlockType } from 'client/src/app/models/mutable-tetris-models/binary-grid';
import { TetrominoType } from 'client/src/app/models/immutable-tetris-models/tetromino';
import { CaptureDataService } from 'client/src/app/services/capture/capture-data.service';

enum PanelMode {
  PLAY = "PLAY",
  CALIBRATE = "CALIBRATE"
}

export class LogMessage {
  constructor(
    public message: string,
    public good: boolean
  ) {}
}

@Component({
  selector: 'app-play-page',
  templateUrl: './play-page.component.html',
  styleUrls: ['./play-page.component.scss']
})
export class PlayPageComponent {
  
  public panelMode: PanelMode = PanelMode.PLAY;
  public showBoundingBoxes: boolean = true;
  public showMinoIndicators: boolean = true;

  public logStatus: LogMessage = new LogMessage("Not recording", false);
  public logs: LogMessage[];

  constructor(public captureDataService: CaptureDataService) {
    this.logs = [
      new LogMessage("Messagasfdsfsda fsdfasdfasdfe 1", true),
      new LogMessage("Messaasdf sdffge 2", false),
      new LogMessage("Mesasdfasdfa sdfafdasfs dfaffdfasfdafssage 3", true),
      new LogMessage("Messagasfdsfsda fsdfasdfasdfe 1", true),
      new LogMessage("Messaasdf sdffge 2", false),
      new LogMessage("Mesasdfasdfa sdfafdasfs dfaffdfasfdafssage 3", true),
      new LogMessage("Messagasfdsfsda fsdfasdfasdfe 1", true),
      new LogMessage("Messaasdf sdffge 2", false),
      new LogMessage("Mesasdfasdfa sdfafdasfs dfaffdfasfdafssage 3", true),
    ];
  }

  public get panelCalibrateMode(): boolean {
    return this.panelMode === PanelMode.CALIBRATE;
  }

  public get capture() {
    return this.captureDataService.get();
  }

  public goToCalibratePanel() {
    this.panelMode = PanelMode.CALIBRATE;
  }

  public startRecording() {

  }

}
