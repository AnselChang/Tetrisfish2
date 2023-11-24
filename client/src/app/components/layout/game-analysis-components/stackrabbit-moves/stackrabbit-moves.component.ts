import { Component, Input } from '@angular/core';
import { EngineMovelistNB } from 'client/src/app/models/analysis-models/engine-movelist';

@Component({
  selector: 'app-stackrabbit-moves',
  templateUrl: './stackrabbit-moves.component.html',
  styleUrls: ['./stackrabbit-moves.component.scss']
})
export class StackrabbitMovesComponent {
  @Input() movelist!: EngineMovelistNB;

  

}
