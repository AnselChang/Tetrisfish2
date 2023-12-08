import { Component } from '@angular/core';

class PageInfo {

  constructor(
    public icon: string,
    public title: string,
    public subtitle: string,
    public routerLink: string,
  ) {}

}

@Component({
  selector: 'app-more-page',
  templateUrl: './more-page.component.html',
  styleUrls: ['./more-page.component.scss']
})
export class MorePageComponent {

  public pages: PageInfo[] = [
    new PageInfo("board_creation.svg", "Board Creation", "Export into analysis or share as a puzzle!", "/board-creation"),
    new PageInfo("machine_learning.png", "ML Dataset", "Generate a dataset of placements for Ansel's ML class", "/ml-dataset"),
  ]

}
