import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-on-login',
  templateUrl: './on-login.component.html',
  styleUrls: ['./on-login.component.scss']
})
export class OnLoginComponent {

  constructor(private route: ActivatedRoute, private router: Router) {
  }

  ngOnInit() {

    console.log("OnLoginComponent");

    this.route.queryParams.subscribe(params => {
      const redirect = params['redirect'] as string | undefined;
      const newUser = params['newUser'] as boolean | undefined;

      console.log("Redirect:", redirect);
      console.log("New User:", newUser);

      if (redirect) this.router.navigateByUrl('/' + redirect);

    });
  }

}
