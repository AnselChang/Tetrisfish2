import { Component, Input } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-button-big',
  templateUrl: './button-big.component.html',
  styleUrls: ['./button-big.component.scss']
})
export class ButtonBigComponent extends ButtonComponent {
  @Input() icon?: string;
  @Input() label: string = "Lorem Ipsum";
  @Input() description?: string;
}
