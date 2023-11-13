import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-eligibility-item',
  templateUrl: './eligibility-item.component.html',
  styleUrls: ['./eligibility-item.component.scss']
})
export class EligibilityItemComponent {
  @Input() isEligible: boolean = true;
  @Input() text: string = "Eligibility Item";
}
