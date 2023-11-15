import { Component } from '@angular/core';
import { getBaseURL } from 'client/src/app/scripts/fetch-server';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {

  // redirects to discord login page
  async login() {
    const baseURL = getBaseURL();
    const url = `${baseURL}/api/auth`;
    window.location.href = url;
  }

}
