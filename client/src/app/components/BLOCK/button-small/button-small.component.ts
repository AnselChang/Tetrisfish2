import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ColorService } from 'client/src/app/services/color.service';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-button-small',
  templateUrl: './button-small.component.html',
  styleUrls: ['./button-small.component.scss']
})
export class ButtonSmallComponent extends ButtonComponent {
  @Input() icon?: string;
  @Input() label: string = "Lorem Ipsum";
}
