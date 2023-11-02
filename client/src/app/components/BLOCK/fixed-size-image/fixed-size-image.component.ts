import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-fixed-size-image',
  templateUrl: './fixed-size-image.component.html',
  styleUrls: ['./fixed-size-image.component.scss']
})
export class FixedSizeImageComponent {
  @Input() src!: string;
  @Input() width: number = 50;
  @Input() aspectRatio: number = 1;
}
