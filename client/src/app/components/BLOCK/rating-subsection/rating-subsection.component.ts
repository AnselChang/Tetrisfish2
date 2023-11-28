import { Component, Input } from '@angular/core';
import { RateMoveDeep, RateMoveShallow } from 'client/src/app/models/analysis-models/rate-move';
import { RATING_TO_COLOR, RATING_TO_STRING, Rating } from 'client/src/app/models/evaluation-models/rating';
import { TagID, getTagByID } from 'client/src/app/models/tag-models/tag-types';

// Should always be inside a <subsection> for correct formatting

@Component({
  selector: 'app-rating-subsection',
  templateUrl: './rating-subsection.component.html',
  styleUrls: ['./rating-subsection.component.scss']
})
export class RatingSubsectionComponent {
  @Input() moveNotation: string | undefined = "K-391";
  @Input() rating?: RateMoveDeep;
  @Input() tags: TagID[] = [];
  @Input() feedback: string = "Feedback goes here";

  getColor(): string {
    if (!this.rating) return "grey";
    return RATING_TO_COLOR[this.rating.rating];
  }

  getRatingString(): string {
    if (!this.rating) return "-";
    return RATING_TO_STRING[this.rating.rating];
  }

  getPlayerEval(): string {
    if (!this.rating) return "-";
    if (!this.rating.playerNB) return "-";
    return this.rating.playerNB.toString();
  }

  getTagName(tagID: TagID) {
    return getTagByID(tagID)?.tagName ?? ("Unknown " + tagID);
  }

}
