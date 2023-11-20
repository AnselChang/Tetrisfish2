import { Component, Input } from '@angular/core';
import { ALL_VALID_RATINGS, RATING_TO_COLOR, RATING_TO_STRING, Rating } from 'client/src/app/models/evaluation-models/rating';
import { RatingAggregator } from 'client/src/app/models/game-models/game-analysis-stats';

@Component({
  selector: 'app-rating-totals',
  templateUrl: './rating-totals.component.html',
  styleUrls: ['./rating-totals.component.scss']
})
export class RatingTotalsComponent {
  @Input() ratings?: RatingAggregator;

  public readonly ALL_RATINGS = ALL_VALID_RATINGS;
  
  public getColorForRating(rating: Rating): string {
    return RATING_TO_COLOR[rating];
  }

  public getNameForRating(rating: Rating): string {
    return RATING_TO_STRING[rating];
  }

  public getRatingCount(rating: Rating): number {
    if (!this.ratings) return 0;
    return this.ratings.getRatingTotal(rating);
  }
}
