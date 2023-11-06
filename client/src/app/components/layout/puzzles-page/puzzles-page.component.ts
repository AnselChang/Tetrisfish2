import { Component } from '@angular/core';
import { EvaluationRating } from 'client/src/app/misc/colors';

@Component({
  selector: 'app-puzzles-page',
  templateUrl: './puzzles-page.component.html',
  styleUrls: ['./puzzles-page.component.scss']
})
export class PuzzlesPageComponent {

  public leftValue: EvaluationRating = EvaluationRating.BEST;
  public rightValue: EvaluationRating = EvaluationRating.MISTAKE;

}
