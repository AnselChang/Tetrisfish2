import { Component, OnDestroy, OnInit } from '@angular/core';
import { MultiplayerService } from 'client/src/app/services/multiplayer.service';

@Component({
  selector: 'app-multiplayer',
  templateUrl: './multiplayer.component.html',
  styleUrls: ['./multiplayer.component.scss']
})
export class MultiplayerComponent implements OnInit, OnDestroy {

  constructor(public multiplayer: MultiplayerService) {}

  ngOnInit(): void {
    this.multiplayer.onEnterPage();
  }

  ngOnDestroy(): void {
    this.multiplayer.onLeavePage();
  }

}
