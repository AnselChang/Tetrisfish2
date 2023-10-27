import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-page-button',
  templateUrl: './page-button.component.html',
  styleUrls: ['./page-button.component.scss']
})
export class PageButtonComponent implements OnInit {
  @Input() icon!: string;
  @Input() title!: string;
  @Input() subtitle: string = "";
  @Input() routerLink!: string;

  ngOnInit(): void {
      //console.log("component", this.icon);
  }

}
