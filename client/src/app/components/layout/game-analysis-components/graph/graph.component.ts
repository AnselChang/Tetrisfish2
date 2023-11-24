import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Game } from 'client/src/app/models/game-models/game';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent {
  @ViewChild('svgElement') svgElement!: ElementRef<SVGElement>;
  @Input() game!: Game;
  @Input() currentPlacement!: number;
  @Output() setHoveredPlacement = new EventEmitter<number>();
  @Output() isTemporaryPlacement = new EventEmitter<boolean>();
  

  hoveredPlacement: number | null = null; // Column currently being hovered
  lastPermanentPlacement: number = 0;

  private afterClickPlacement = false;

  constructor() {
  }

  get numPlacements(): number {
    return this.game.numPlacements;
  }


  onMouseMove(event: MouseEvent): void {
    const svgRect = this.svgElement.nativeElement.getBoundingClientRect();
    const x = event.clientX - svgRect.left; // x position within the element.
    this.hoveredPlacement = Math.floor(x / svgRect.width * this.numPlacements);

    if (this.hoveredPlacement && !this.afterClickPlacement) this.setHoveredPlacement.emit(this.hoveredPlacement);
  }

  onMouseEnter(): void {
    this.afterClickPlacement = false;
    this.lastPermanentPlacement = this.currentPlacement;
    this.isTemporaryPlacement.emit(true);
  }

  onMouseLeave(): void {
    this.hoveredPlacement = null;
    this.setHoveredPlacement.emit(this.lastPermanentPlacement);
    this.isTemporaryPlacement.emit(false);
  }

  onClickPlacement() {
    if (this.hoveredPlacement) {
      this.afterClickPlacement = true;
      this.setHoveredPlacement.emit(this.hoveredPlacement);
      this.isTemporaryPlacement.emit(false);
      this.lastPermanentPlacement = this.hoveredPlacement;
    }
  }

  getSVGDisplayPlacementWidth(): number {
    return Math.ceil(this.numPlacements / 200);
  }
}
