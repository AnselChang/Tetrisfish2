import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loggedIn: boolean = false;
  private username: string | null = null;

  constructor() { }

  public getUsername(): string | null {
    return this.username;
  }

  public isLoggedIn(): boolean {
    return this.loggedIn;
  }

}
