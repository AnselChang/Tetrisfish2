import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-level-container',
  templateUrl: './level-container.component.html',
  styleUrls: ['./level-container.component.scss']
})
export class LevelContainerComponent {
  @Input() r! : number;
  @Input() g! : number;
  @Input() b! : number;
  @Input() level!: number | string;
  @Input() labels!: string[];
  @Input() averages?: number[];
  @Input() medians?: number[];
  @Input() bests?: number[];
  @Input() worsts?: number[];

  // opacity from 0 to 1
  getColor(opacity: number): string {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${opacity})`;
  }

}
