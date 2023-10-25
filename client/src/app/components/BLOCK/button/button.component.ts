import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, Renderer2 } from '@angular/core';
import { ColorService } from 'client/src/app/services/color.service';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements AfterViewInit, OnChanges {
  @Input() onClick: any = null;
  @Input() color: string = '#5865F2';

  constructor(private colorService: ColorService, private el: ElementRef) {
  }

  public _onClick(): void {
    if (this.onClick !== null) this.onClick();
  }

  private updateCSS() {
    this.el.nativeElement.style.setProperty('--buttonColor', this.color);

    const colorHovered = this.colorService.darken(this.color, 7);
    this.el.nativeElement.style.setProperty('--buttonColorHovered', colorHovered);

    const colorPressed = this.colorService.darken(this.color, 15);
    this.el.nativeElement.style.setProperty('--buttonColorPressed', colorPressed);
    console.log("colors:", this.color, colorHovered, colorPressed);
  }

  ngAfterViewInit(): void {
    this.updateCSS();
  }

  ngOnChanges(): void {
    this.updateCSS();
  }

}
