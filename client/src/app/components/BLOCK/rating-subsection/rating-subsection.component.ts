import { Component, Input } from '@angular/core';
import { RATING_TO_COLOR, RATING_TO_STRING, Rating } from 'client/src/app/models/evaluation-models/rating';

// Should always be inside a <subsection> for correct formatting

@Component({
  selector: 'app-rating-subsection',
  templateUrl: './rating-subsection.component.html',
  styleUrls: ['./rating-subsection.component.scss']
})
export class RatingSubsectionComponent {
  @Input() playerEval!: number;
  @Input() moveNotation: string = "K-391";
  @Input() rating!: Rating;
  @Input() feedback: string = "Feedback goes here";

  getColor(): string {
    return RATING_TO_COLOR[this.rating];
  }

  getRatingString(): string {
    return RATING_TO_STRING[this.rating];
  }
}
