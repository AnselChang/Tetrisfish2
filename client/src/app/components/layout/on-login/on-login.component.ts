import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'client/src/app/services/user.service';

@Component({
  selector: 'app-on-login',
  templateUrl: './on-login.component.html',
  styleUrls: ['./on-login.component.scss']
})
export class OnLoginComponent {

  constructor(private route: ActivatedRoute, private router: Router, private user: UserService) {
  }

  ngOnInit() {

    console.log("OnLoginComponent");

    this.route.queryParams.subscribe(params => {
      const redirect = params['redirect'] as string | undefined;
      const newUser = params['new-user'] as boolean | undefined;

      console.log("Redirect:", redirect);
      console.log("New User:", newUser);

      this.user.updateFromServer().then(() => {
        if (redirect) this.router.navigateByUrl('/' + redirect);
      });

    });
  }

}
