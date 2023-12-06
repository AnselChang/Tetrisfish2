import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-nes-panel',
  templateUrl: './nes-panel.component.html',
  styleUrls: ['./nes-panel.component.scss']
})
export class NesPanelComponent {
  @Input() highlight: boolean = false;
}
