import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SlotData } from 'client/src/app/services/multiplayer.service';
import { SlotType } from 'server/multiplayer/slot-state/slot-state';

@Component({
  selector: 'app-slot',
  templateUrl: './slot.component.html',
  styleUrls: ['./slot.component.scss']
})
export class SlotComponent {
  @Input() slot!: SlotData;
  @Output() onInvitePlayer = new EventEmitter<void>();
  @Output() onRegisterAI = new EventEmitter<void>();
  @Output() onRegisterMyself = new EventEmitter<void>();
  @Output() onDeleteSlot = new EventEmitter<void>();

  isVacant() {
    return this.slot.type === SlotType.VACANT;
  }

}
