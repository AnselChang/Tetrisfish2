import { Injectable } from '@angular/core';
import { Method, fetchServer } from '../scripts/fetch-server';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private loggedIn: boolean = false;
  private username: string | null = null;

  constructor() { 

  }

  public async updateFromServer() {
    const {status, content} = await fetchServer(Method.GET, "/api/username");
    console.log("Response from /api/username:", status, content);

    if (status !== 200) {
      console.log("Error getting username:", content);
      this.loggedIn = false;
      return;
    }

    this.username = content["username"];
    this.loggedIn = true;
  }

  public getUsername(): string | null {
    return this.username;
  }

  public isLoggedIn(): boolean {
    return this.loggedIn;
  }

  public loginWithUsername(username: string): void {
    this.loggedIn = true;
    this.username = username;
  }

}
