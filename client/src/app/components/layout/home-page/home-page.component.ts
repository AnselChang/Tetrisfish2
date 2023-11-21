import { Component, OnInit } from '@angular/core';
import { Method, fetchServer } from 'client/src/app/scripts/fetch-server';
import { UserService } from 'client/src/app/services/user.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  public value = 0;

  constructor(private userService: UserService) {}

  async ngOnInit() {
    console.log("HomePageComponent");

    // every two seconds, increment counter
    setInterval(() => {
      this.value += 1000;
    }, 200);
  }
  
  public onClick(): void {
    console.log("clicked");
  }

}
