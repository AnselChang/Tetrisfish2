import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EngineMovelistNB, MoveRecommendation } from 'client/src/app/models/analysis-models/engine-movelist';

@Component({
  selector: 'app-stackrabbit-moves',
  templateUrl: './stackrabbit-moves.component.html',
  styleUrls: ['./stackrabbit-moves.component.scss']
})
export class StackrabbitMovesComponent {
  @Input() movelist!: EngineMovelistNB;
  @Output() hoveredMove = new EventEmitter<MoveRecommendation | undefined>();

  onMouseEnterRecommendation(recommendation: MoveRecommendation): void {
    this.hoveredMove.emit(recommendation);
  }

  onMouseLeaveRecommendation(): void {
    this.hoveredMove.emit(undefined);
  }

}
