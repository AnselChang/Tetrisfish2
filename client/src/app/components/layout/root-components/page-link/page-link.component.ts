import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-link',
  templateUrl: './page-link.component.html',
  styleUrls: ['./page-link.component.scss']
})
export class PageLinkComponent {
  @Input() routerLink!: string;
  @Input() displayText!: string;

}
