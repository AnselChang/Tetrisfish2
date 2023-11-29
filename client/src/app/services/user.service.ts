import { Injectable } from '@angular/core';
import { Method, fetchServer } from '../scripts/fetch-server';
import { BehaviorSubject } from 'rxjs';
import { UserInfo } from 'shared/models/user-info';
import { CaptureSettingsService } from './capture/capture-settings.service';
import { UserSettings } from 'shared/models/user-settings';
import { Playstyle } from '../misc/playstyle';
import { InputSpeed } from '../scripts/evaluation/input-frame-timeline';
import { Threshold, ThresholdType } from '../models/capture-models/capture-settings';

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

  constructor(private captureSettings: CaptureSettingsService) { 

  }

  private async updateCaptureSettings() {
    const {status, content} = await fetchServer(Method.GET, "/api/get-user-settings", {userID: this.userID});
    const userSettings = content as UserSettings;
    console.log("fetching user settings", userSettings);

    if (userSettings.playstyle && (<any>Object).values(Playstyle).includes(userSettings.playstyle)) {
      console.log("Setting playstyle to", userSettings.playstyle);
      this.captureSettings.get().playstyle = userSettings.playstyle as Playstyle;
    }

    if (userSettings.inputSpeed && (<any>Object).values(InputSpeed).includes(userSettings.inputSpeed)) {
      console.log("Setting input speed to", userSettings.inputSpeed);
      this.captureSettings.get().inputSpeed = userSettings.inputSpeed as InputSpeed;
    }

    if (userSettings.minoThreshold) {
      console.log("Setting mino threshold to", userSettings.minoThreshold);
      this.captureSettings.get().thresholds[ThresholdType.MINO].value = userSettings.minoThreshold;
    }
    
    if (userSettings.textThreshold) {
      console.log("Setting text threshold to", userSettings.textThreshold);
      this.captureSettings.get().thresholds[ThresholdType.TEXT].value = userSettings.textThreshold;
    }

  }

  public async postUserSettings() {
    const userSettings: UserSettings = {
      userID: this.userID!,
      playstyle: this.captureSettings.get().playstyle,
      inputSpeed: this.captureSettings.get().inputSpeed,
      minoThreshold: this.captureSettings.get().thresholds[ThresholdType.MINO].value,
      textThreshold: this.captureSettings.get().thresholds[ThresholdType.TEXT].value
    };

    console.log("Posting user settings:", userSettings);

    await fetchServer(Method.POST, "/api/set-user-settings", userSettings);
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

    await this.updateCaptureSettings();

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
