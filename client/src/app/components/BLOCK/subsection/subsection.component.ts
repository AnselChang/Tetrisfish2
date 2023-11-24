import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-subsection',
  templateUrl: './subsection.component.html',
  styleUrls: ['./subsection.component.scss']
})
export class SubsectionComponent {
  @Input() shadow: boolean = false;
}
