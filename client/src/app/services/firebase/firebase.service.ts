import { Injectable } from '@angular/core';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { DISCORD_CLIENT_ID } from '../../scripts/environment';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  private readonly FIREBASE_CONFIG = {
    apiKey: "AIzaSyDQr3gh7e6Ig3JPGSaVoD8W1sPK5-4cjZc",
    authDomain: "tetrisfish-com.firebaseapp.com",
    projectId: "tetrisfish-com",
    storageBucket: "tetrisfish-com.appspot.com",
    messagingSenderId: "168266663566",
    appId: "1:168266663566:web:a55e7445ad0c99d4432bdf",
    measurementId: "G-VE8HJQB37S"
  };

  // Initialize Firebase
  public readonly app = initializeApp(this.FIREBASE_CONFIG);
  public readonly analytics = getAnalytics(this.app);
  public readonly auth = getAuth(this.app);

  constructor() { 
  
  }

}
