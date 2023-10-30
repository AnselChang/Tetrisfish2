import { Component } from '@angular/core';
import GameStatus from 'client/src/app/models/immutable-tetris-models/game-status';
import BinaryGrid, { BlockType } from 'client/src/app/models/mutable-tetris-models/binary-grid';
import { TetrominoType } from 'client/src/app/models/immutable-tetris-models/tetromino';
import { CaptureSettingsService } from 'client/src/app/services/capture/capture-settings.service';
import { CaptureFrameService, CaptureMode } from 'client/src/app/services/capture/capture-frame.service';
import { ExtractedState } from 'client/src/app/models/game-models/extracted-state';
import { ExtractedStateService } from 'client/src/app/services/capture/extracted-state.service';

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

  constructor(
    public extractedStateService: ExtractedStateService,
    private captureFrameService: CaptureFrameService
    ) {
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

  public get extractedState() {
    return this.extractedStateService.get();
  }

  public goToCalibratePanel() {
    this.panelMode = PanelMode.CALIBRATE;
  }

  public exitCalibratePanel() {
    this.panelMode = PanelMode.PLAY;
  }

  public determineBoundingBoxes(event: MouseEvent) {
    if (this.captureFrameService.hasFrame()) {
      event.stopPropagation();
      this.captureFrameService.mode$.next(CaptureMode.CLICK_ON_BOARD);
    }
  }

  public startRecording() {

  }

}
