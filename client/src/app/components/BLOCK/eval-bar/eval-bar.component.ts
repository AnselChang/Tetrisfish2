import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { RATING_TO_COLOR, Rating, absoluteEvaluationToPercent } from 'client/src/app/models/evaluation-models/rating';

@Component({
  selector: 'app-eval-bar',
  templateUrl: './eval-bar.component.html',
  styleUrls: ['./eval-bar.component.scss']
})
export class EvalBarComponent implements OnInit, OnChanges {
  @Input() playerEval?: number;
  @Input() bestEval?: number;
  @Input() rating?: Rating;

  public playerHeight = "50%";
  public srHeight = "50%";
  public color = "grey";

  ngOnInit(): void {
      this.recalculateEvalBar();
  }

  ngOnChanges(changes: SimpleChanges): void {
      this.recalculateEvalBar();
  }

  recalculateEvalBar() {
    if (this.playerEval) this.playerHeight = this.evalToPercentString(this.playerEval);
    if (this.bestEval) this.srHeight = this.evalToPercentString(this.bestEval);
    if (this.rating) this.color = RATING_TO_COLOR[this.rating];
  }

  private evalToPercentString(evaluation: number): string {
    const percent = absoluteEvaluationToPercent(evaluation);
    return `${percent * 100}%`;
  }
}
