import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss']
})
export class CheckboxComponent {
  @Input() label: string = "";

  // two way binding for checkbox
  @Input() isChecked: boolean = false;
  @Output() isCheckedChange = new EventEmitter<boolean>();

  toggleCheck() {
    this.isChecked = !this.isChecked;
    this.isCheckedChange.emit(this.isChecked);
  }

}
