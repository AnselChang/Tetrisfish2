import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { TooltipService } from '../services/tooltip.service';

@Directive({
  selector: '[tooltip]'
})
export class TooltipDirective {

  @Input('tooltip') tooltipText: string = '';

  constructor(private el: ElementRef, private tooltipManager: TooltipService) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.tooltipManager.setText(this.tooltipText);
    this.tooltipManager.show();
  }

  @HostListener('mousemove', ['$event']) onMouseMove(event: MouseEvent) {
    this.tooltipManager.setPosition(event.clientX, event.clientY);
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.tooltipManager.hide();
  }

}
