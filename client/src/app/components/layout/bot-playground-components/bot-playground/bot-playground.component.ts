import { Component } from '@angular/core';
import { AbstractAIAdapter } from 'client/src/app/ai/abstract-ai-adapter/abstract-ai-adapter';
import { ALL_ADAPTERS } from 'client/src/app/ai/ai-adapters/all-adapters';
import { TetrominoType } from 'client/src/app/models/tetronimo-models/tetromino';

@Component({
  selector: 'app-bot-playground',
  templateUrl: './bot-playground.component.html',
  styleUrls: ['./bot-playground.component.scss']
})
export class BotPlaygroundComponent {

  public selectedAI: AbstractAIAdapter = ALL_ADAPTERS[0];

  public nextPieceType: TetrominoType = TetrominoType.I_TYPE;

  startGame() {
    console.log("Starting game with", this.selectedAI.getName());
  }

}
