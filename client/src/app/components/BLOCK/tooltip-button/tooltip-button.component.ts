import { Component, Input } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-tooltip-button',
  templateUrl: './tooltip-button.component.html',
  styleUrls: ['./tooltip-button.component.scss']
})
export class TooltipButtonComponent extends ButtonComponent {
  @Input() label: string = "Lorem Ipsum";
  @Input() tooltipText: string = "Lorem Ipsum";
}
