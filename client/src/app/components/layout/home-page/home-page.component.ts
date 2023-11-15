import { Component, OnInit } from '@angular/core';
import { Method, fetchServer } from 'client/src/app/scripts/fetch-server';
import { UserService } from 'client/src/app/services/user.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  constructor(private userService: UserService) {}

  async ngOnInit() {
    
    await this.userService.updateFromServer();

  }

  public onClick(): void {
    console.log("clicked");
  }

}
