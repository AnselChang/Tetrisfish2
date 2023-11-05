import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-eval-bar',
  templateUrl: './eval-bar.component.html',
  styleUrls: ['./eval-bar.component.scss']
})
export class EvalBarComponent {
  @Input() playerEval: number = 0;
  @Input() bestEval: number = 20;
  @Input() color: string = '#5865F2';

  // 1 is full height, 0 is no height
  public get playerPercent(): number {
    return 0.7; // TODO: calculate this
  }

  // 1 is full height, 0 is no height
  public get bestPercent(): number {
    return 0.9; // TODO: calculate this
  }

}
