import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ExtractedState } from 'client/src/app/models/capture-models/extracted-state';
import { Method, fetchServer } from 'client/src/app/scripts/fetch-server';
import { ExtractedStateService } from 'client/src/app/services/capture/extracted-state.service';
import { MultiplayerService, SlotData } from 'client/src/app/services/multiplayer/multiplayer.service';
import { UserService } from 'client/src/app/services/user.service';
import { SlotType } from 'server/multiplayer/slot-state/slot-state';
import { VerticalAlign } from '../../../tetris/interactive-tetris-board/interactive-tetris-board.component';
import { SlotBoardData } from 'client/src/app/services/multiplayer/slot-board-data';
import { IGameState } from 'client/src/app/services/multiplayer/player-game-state';
import { RATING_TO_COLOR, getRatingFromAveragePercent } from 'client/src/app/models/evaluation-models/rating';

@Component({
  selector: 'app-slot',
  templateUrl: './slot.component.html',
  styleUrls: ['./slot.component.scss'],
  animations: [
    trigger('buttonOpacity', [
      state('visible', style({
        opacity: 1
      })),
      state('invisible', style({
        opacity: 0
      })),
      transition('visible => invisible', animate('0.1s')),
      transition('invisible => visible', animate('0.1s')),
    ]),
    trigger('codeAnimation', [
      state('initial', style({
        opacity: 0,
        transform: 'translateY(50px) scale(0.3)'
      })),
      state('final', style({
        opacity: 1,
        transform: 'translateY(0) scale(1)'
      })),
      transition('initial => final', animate('0.3s ease-out'))
    ]),
    trigger('otherOpacity', [
      state('visible', style({
        opacity: 1
      })),
      state('invisible', style({
        opacity: 0
      })),
      transition('visible => invisible', animate('0.5s')),
      transition('invisible => visible', animate('0.5s')),
    ]),
  ]
})
export class SlotComponent implements OnInit {
  @Input() slot!: SlotData;
  @Input() isAdmin!: boolean;
  @Input() canRegisterMyself: boolean = true;
  @Output() onRegisterAI = new EventEmitter<void>();
  @Output() onDeleteSlot = new EventEmitter<void>();

  buttonState = 'visible';
  buttonStyle = { display: 'block' };
  codeAnimationState = 'initial';

  instructionsState = 'invisible';
  instructionsStyle = { display: 'none' };

  backState = 'invisible';
  backStyle = { display: 'none' };

  constructor(
    private user: UserService,
    public extractedStateService: ExtractedStateService,
    public multiplayer: MultiplayerService
    ) {}

  ngOnInit(): void {

    // if slot alreaday has an access code, show it
    if (this.slot.accessCode) {
      this.fadeOutButtons(true);
    }
  }
  

  readonly VerticalAlign = VerticalAlign;
  
  get extractedState(): ExtractedState {
    return this.extractedStateService.get();
  }

  isMyself(): boolean {
    return this.slot.sessionID === this.user.getSessionID();
  }

  isVacant() {
    return this.slot.type === SlotType.VACANT;
  }

  getBoardData(): SlotBoardData {
    return this.multiplayer.getBoardDataForSlotID(this.slot.slotID);
  }

  getPlayerState(): IGameState {
    return this.multiplayer.getPlayerStateForSlotID(this.slot.slotID);
  }

  getScoreDelta(): number {
    return this.multiplayer.getScoreDeltaForSlotID(this.slot.slotID);
  }

  isTopScorePlayer(): boolean {
    return this.slot.slotID === this.multiplayer.getTopScoreSlotID();
  }

  private getRawAccuracy(): number | undefined {
    return this.getPlayerState().game?.overallAccuracy;
  }

  getAccuracyString(): string {
    const accuracy = this.getRawAccuracy();
    if (!accuracy) return '-';
    return (accuracy * 100).toFixed(2) + '%';
  }

  getAccuracyColor(): string {
    const accuracy = this.getRawAccuracy();
    if (accuracy === undefined) return 'white';
    const rating = getRatingFromAveragePercent(accuracy);
    return RATING_TO_COLOR[rating];
  }

  getTRTString(): string {
    const trt = this.getPlayerState().game?.tetrisRate;
    if (trt === undefined) return '-';
    return Math.round(trt * 100) + '%';
  }

  async onClickInvitePlayer() {
    
    const {status, content} = await fetchServer(Method.POST, '/api/multiplayer/generate-slot-access-code', {
      slotID: this.slot.slotID
    });

    // failed to generate access code
    if (status !== 200 || !content['success']) {
      console.error('failed to generate access code', content);
      return
    }

    // succeeded in generating access code
    this.slot.accessCode = content['accessCode'] as number;
    console.log('accessCode', this.slot.accessCode);

    this.fadeOutButtons();
  }

  async exitAccessCode() {

    const {status, content} = await fetchServer(Method.POST, '/api/multiplayer/revoke-slot-access-code', {
      slotID: this.slot.slotID
    });

    // failed to revoke access code
    if (status !== 200 || !content['success']) {
      console.error('failed to revoke access code', content);
    }

    // succeeded in revoking access code
    console.log('revoked access code');
    this.slot.accessCode = undefined;
    

    this.fadeOutCode();
    this.fadeOutBack();
    this.fadeOutInstructions();
  }

  // send POST register-myself request to server
  async onClickRegisterMyself() {

    const {status, content} = await fetchServer(Method.POST, '/api/multiplayer/register-myself', {
      userID: this.user.getUserID(),
      sessionID: this.user.getSessionID(),
      slotID: this.slot.slotID
    });

    const success = status === 200 && content['success'];
    console.log('register-myself', success, content);

  }

  fadeOutButtons(instant: boolean = false) {
    this.buttonState = 'invisible';

    if (instant) {
      this.buttonStyle.display = 'none'
      this.fadeInCode(instant);
    }
    else {
      setTimeout(() => {
        this.buttonStyle.display = 'none'
        this.fadeInCode();
      }, 100);
    }
    
  }

  fadeInButtons() {
    this.buttonState = 'visible';
    this.buttonStyle.display = 'block';
  }

  fadeInCode(instant: boolean = false) {
    this.codeAnimationState = 'final';
    if (instant) this.fadeInInstructions(instant);
    else {
      setTimeout(() => {
        this.fadeInInstructions();
      }, 500);
    }
  }

  fadeOutCode() {
    this.codeAnimationState = 'initial';
    setTimeout(() => {
      this.fadeInButtons();
    }, 300);
  }

  fadeInInstructions(instant: boolean = false) {
    this.instructionsState = 'visible';
    this.instructionsStyle.display = 'block';

    if (instant) this.fadeInBack();
    else {
      setTimeout(() => {
        this.fadeInBack();
      }, 350);
    }
  }

  fadeOutInstructions() {
    this.instructionsState = 'invisible';
    setTimeout(() => {
      this.instructionsStyle.display = 'none';
    }, 350);
  }

  fadeInBack() {
    this.backState = 'visible';
    this.backStyle.display = 'block';
  }

  fadeOutBack() {
    this.backState = 'invisible';
    setTimeout(() => {
      this.backStyle.display = 'none';
    }, 500);
  }

  // if digit is 0, then get left-most digit
  getAccessCodeDigit(digit: number) {
    if (!this.slot.accessCode) return 0;
    const str = this.slot.accessCode.toString();
    if (digit < 0) return 0;
    return parseInt(str[digit]);
  }

}
