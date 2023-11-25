import { Component, Input } from '@angular/core';

// an "i" tooltip icon, that, when hovered, shows a tooltip

@Component({
  selector: 'app-tooltip-indicator',
  templateUrl: './tooltip-indicator.component.html',
  styleUrls: ['./tooltip-indicator.component.scss']
})
export class TooltipIndicatorComponent {
  @Input() dy: number = 1;
}
