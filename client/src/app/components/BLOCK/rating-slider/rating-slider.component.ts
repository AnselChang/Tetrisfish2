import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { EVALUATION_RATING_TO_COLOR, EVALUATION_RATING_TO_STRING, EvaluationRating } from 'client/src/app/misc/colors';

@Component({
  selector: 'app-rating-slider',
  templateUrl: './rating-slider.component.html',
  styleUrls: ['./rating-slider.component.scss']
})
export class RatingSliderComponent implements AfterViewInit, OnChanges {
  @Input() leftValue!: EvaluationRating;
  @Output() leftValueChange = new EventEmitter<EvaluationRating>();
  @Input() rightValue!: EvaluationRating;
  @Output() rightValueChange = new EventEmitter<EvaluationRating>();

  public MIN_VALUE = 0;
  public MAX_VALUE = 5;

  constructor(private el: ElementRef) {
  }

  public ngAfterViewInit(): void {
    this.updateCSS();
  }

  public ngOnChanges(): void {
    this.updateCSS();
  }


  public setLeftValue(event: Event) {
    this.leftValue = parseInt((event.target as HTMLInputElement).value);
    this.leftValueChange.emit(this.rightValue);
    this.updateCSS();
  }

  public setRightValue(event: Event) {
    this.rightValue = parseInt((event.target as HTMLInputElement).value);
    this.rightValueChange.emit(this.rightValue);
    this.updateCSS();
  }


  private updateCSS() {

    // set left slider thumb
    const leftColor = EVALUATION_RATING_TO_COLOR[this.leftValue];
    this.el.nativeElement.style.setProperty('--leftColor', leftColor);

    // set right slider thumb
    const rightColor = EVALUATION_RATING_TO_COLOR[this.rightValue];
    this.el.nativeElement.style.setProperty('--rightColor', rightColor);

    // set active gradient to be colors between left and right colors
    let gradient = "linear-gradient(to right, ";
    for (let i = this.leftValue; i <= this.rightValue; i++) {
      gradient += EVALUATION_RATING_TO_COLOR[i] + ",";
    }
    gradient = gradient.slice(0, -1); // remove last comma
    gradient += ")";

    this.el.nativeElement.style.setProperty('--activeSliderGradient', gradient);
  }

  public displayValueAsString(value: number): string {
    const rating = value as EvaluationRating;
    return EVALUATION_RATING_TO_STRING[rating];
  }
}

