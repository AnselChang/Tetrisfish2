import { Component, Input } from '@angular/core';
import { TetrominoType } from 'client/src/app/models/tetronimo-models/tetromino';

// pass in EITHER piece OR name to be displayed on tag

@Component({
  selector: 'app-tag',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.scss']
})
export class TagComponent {
  @Input() piece?: TetrominoType;
  @Input() name?: string;
}
