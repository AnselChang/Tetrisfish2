import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, Renderer2 } from '@angular/core';
import { ColorService } from 'client/src/app/services/color.service';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements AfterViewInit, OnChanges {
  @Input() color: string = '#5865F2';
  @Input() expandToFitWidth: boolean = false;
  @Output() click = new EventEmitter<Event>();
  @Input() buttonDisabled: boolean = false;


  constructor(private colorService: ColorService, private el: ElementRef) {
  }

  private updateCSS() {
    this.el.nativeElement.style.setProperty('--buttonColor', this.color);

    const colorHovered = this.colorService.darken(this.color, 7);
    this.el.nativeElement.style.setProperty('--buttonColorHovered', colorHovered);

    const colorPressed = this.colorService.darken(this.color, 15);
    this.el.nativeElement.style.setProperty('--buttonColorPressed', colorPressed);
  }

  ngAfterViewInit(): void {
    this.updateCSS();
  }

  ngOnChanges(): void {
    this.updateCSS();
  }
}
