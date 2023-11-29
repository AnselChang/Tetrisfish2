import { Injectable } from '@angular/core';
import { Method, fetchServer } from '../scripts/fetch-server';
import { BehaviorSubject } from 'rxjs';
import { UserInfo } from 'shared/models/user-info';

export enum LoginStatus {
  LOGGED_IN,
  NOT_LOGGED_IN,
  LIMBO
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private loggedIn: boolean = false;
  private username: string | null = null;
  private userID: string | null = null;
  private isProUser: boolean | null = null;

  public loginStatus$ = new BehaviorSubject<LoginStatus>(LoginStatus.LIMBO);

  constructor() { 

  }

  public async updateFromServer() {
    this.loginStatus$.next(LoginStatus.LIMBO);
    const {status, content} = await fetchServer(Method.GET, "/api/username");
    console.log("Response from /api/username:", status, content);

    if (status >= 400) {
      console.log("Error getting username:", content);
      this.loggedIn = false;
      this.loginStatus$.next(LoginStatus.NOT_LOGGED_IN);
      return;
    }

    const userInfo = content as UserInfo;

    this.username = userInfo.username;
    this.userID = userInfo.userID;
    this.isProUser = userInfo.isProUser;

    this.loggedIn = true;
    this.loginStatus$.next(LoginStatus.LOGGED_IN);
  }

  public getUsername(): string | null {
    return this.username;
  }

  public getUserID(): string | null {
    return this.userID;
  }

  public getProUser(): boolean | null {
    return this.isProUser;
  }

  public isLoggedIn(): boolean {
    return this.loggedIn;
  }

}
