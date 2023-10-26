import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-button',
  templateUrl: './page-button.component.html',
  styleUrls: ['./page-button.component.scss']
})
export class PageButtonComponent {
  @Input() icon!: string;
  @Input() title!: string;
  @Input() subtitle: string = "";
  @Input() routerLink!: string;

}
