import { Component, Input } from '@angular/core';
import { TooltipService } from 'client/src/app/services/tooltip.service';

// SHOULD NOT BE CONSTRUCTED DIRECTLY. GLOBAL COMPONENT CONTROLLED BY TOOLTIP SERVICE
// TO USE, ADD [tooltip] DIRECTIVE TO HTML ELEMENT

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent {
 
  constructor(public tooltip: TooltipService) {}
  
}
