import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Method, fetchServer } from 'client/src/app/scripts/fetch-server';
import { SlotData } from 'client/src/app/services/multiplayer.service';
import { SlotType } from 'server/multiplayer/slot-state/slot-state';

@Component({
  selector: 'app-slot',
  templateUrl: './slot.component.html',
  styleUrls: ['./slot.component.scss']
})
export class SlotComponent {
  @Input() slot!: SlotData;
  @Output() onRegisterAI = new EventEmitter<void>();
  @Output() onRegisterMyself = new EventEmitter<void>();
  @Output() onDeleteSlot = new EventEmitter<void>();

  isVacant() {
    return this.slot.type === SlotType.VACANT;
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
    const accessCode = content['accessCode'] as number;
    console.log('accessCode', accessCode);

  }

}
