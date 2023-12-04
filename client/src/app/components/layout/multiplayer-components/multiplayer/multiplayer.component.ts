import { Component } from '@angular/core';
import { MultiplayerService } from 'client/src/app/services/multiplayer.service';

@Component({
  selector: 'app-multiplayer',
  templateUrl: './multiplayer.component.html',
  styleUrls: ['./multiplayer.component.scss']
})
export class MultiplayerComponent {

  constructor(public multiplayer: MultiplayerService) {}

}
