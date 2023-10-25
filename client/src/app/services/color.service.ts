import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ColorService {

  constructor() { }

  // takes in a color in the format "#RRGGBB" and returns a string in the format "#RRGGBB"
  public darken(color: string, percent: number): string {
    const factor = (100 - percent) / 100;

    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = Math.round(R * factor);
    G = Math.round(G * factor);
    B = Math.round(B * factor);

    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1).toUpperCase()}`;
}

}
