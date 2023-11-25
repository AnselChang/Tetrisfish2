import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TooltipService {

  private text: string = '';
  private position: { x: number, y: number } = { x: 0, y: 0 };
  private isVisible: boolean = false;

  setText(text: string) {
    this.text = text;
  }

  setPosition(x: number, y: number) {
    this.position = { x, y };
  }

  show() {
    this.isVisible = true;
  }

  hide() {
    this.isVisible = false;
  }

  getTooltipInfo() : { text: string, position: { x: number, y: number } } | undefined {
    
    if (!this.isVisible) return undefined;
    return {
      text: this.text,
      position: this.position,
    };
  }
}
