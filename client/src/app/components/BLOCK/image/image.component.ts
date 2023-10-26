import { Component, ElementRef, Input, OnChanges, OnInit, Renderer2, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageComponent implements OnInit, OnChanges {
  @Input() src!: string;
  @Input() widthPx: number = 50;
  @Input() aspectRatio: number = 1;

  public fullSrc: string = '';

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    this.updateCSS();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateCSS();
  }

  private updateCSS(): void {
    this.fullSrc = `./assets/img/${this.src}`;
    console.log(this.fullSrc);
    this.el.nativeElement.style.setProperty('--widthPx', this.widthPx + 'px');
    this.el.nativeElement.style.setProperty('--widthProportional', (this.widthPx / 10) + 'vw');
    this.el.nativeElement.style.setProperty('--aspectRatio', this.aspectRatio + '');
  }

}