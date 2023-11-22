import { Component, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-animated-digit',
  templateUrl: './animated-digit.component.html',
  styleUrls: ['./animated-digit.component.scss']
})
export class AnimatedDigitComponent implements OnChanges {
  @Input() digit: number | string = 0;

  public currentDigit: string = "0";
  public nextDigit: string = "0";
  public animate: boolean = true;

  constructor(private renderer: Renderer2, private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.setDigit(this.digit);
  }

  setDigit(digit: number | string) {
    let digitStr = digit.toString();

    if (digitStr.length > 1) {
      throw new Error("digit must be empty or length 1");
    }

    this.currentDigit = this.nextDigit;
    if (this.currentDigit === '') {
      this.currentDigit = '0';
      const elements = this.el.nativeElement.querySelectorAll('.moveNumberOut');
      elements.forEach((element: HTMLElement) => {
        this.renderer.setStyle(element, 'opacity', '0');
      });
    } else {
      const elements = this.el.nativeElement.querySelectorAll('.moveNumberOut');
      elements.forEach((element: HTMLElement) => {
        this.renderer.setStyle(element, 'opacity', '1');
      });
    }

    this.nextDigit = digitStr;
    this.animate = false;

    // this.resetOpacity();


    setTimeout(() => {
      this.animate = true;
    }, 0);
  }


  public getWidth(): string {
    if (this.nextDigit === '') return "0px";
    else if (this.nextDigit === '.') return "15px";
    else if (this.nextDigit ===  '1') return "20px";
    else return "auto";
    // else if (this.nextDigit === '.') return 15;
    // else if (this.nextDigit === 'K' || this.nextDigit === 'M') return 35;
    // else return 27;
  }

}
