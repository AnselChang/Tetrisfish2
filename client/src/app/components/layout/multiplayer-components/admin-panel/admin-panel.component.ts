import { Component } from '@angular/core';
import { MultiplayerService } from 'client/src/app/services/multiplayer/multiplayer.service';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent {

  constructor(public multiplayer: MultiplayerService) {

}

}
