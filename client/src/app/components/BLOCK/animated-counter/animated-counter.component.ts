import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-animated-counter',
  templateUrl: './animated-counter.component.html',
  styleUrls: ['./animated-counter.component.scss']
})
export class AnimatedCounterComponent implements OnChanges, OnInit {
  @Input() value: number = 354456;

  public digitA: string = "0";
  public digitB: string = "0";
  public digitC: string = "0";
  public digitD: string = "0";
  public digitE: string = "0";

  ngOnInit(): void {
      this.setDigits();
  }

  ngOnChanges(): void {
    this.setDigits();
  }

  // if 0, get ones place. if 1, get tens place. etc.
  getDigitPlace(place: number) {
    return Math.floor(this.value / Math.pow(10, place)) % 10;
  }

  setDigits() {

    if (this.value < 1000) { // abc -> abc
      this.digitA = "";
      this.digitB = "";
      this.digitC = this.getDigitPlace(2).toString();
      this.digitD = this.getDigitPlace(1).toString();
      this.digitE = this.getDigitPlace(0).toString();
    } else if (this.value < 10000) { // abcd -> a.bcK
      this.digitA = this.getDigitPlace(3).toString();
      this.digitB = ".";
      this.digitC = this.getDigitPlace(2).toString();
      this.digitD = this.getDigitPlace(1).toString();
      this.digitE = "K";
    } else if (this.value < 100000) { // abcde -> ab.cK
      this.digitA = this.getDigitPlace(4).toString();
      this.digitB = this.getDigitPlace(3).toString();
      this.digitC = ".";
      this.digitD = this.getDigitPlace(2).toString();
      this.digitE = "K";
    } else if (this.value < 1000000) { // abcdef -> abcK
      this.digitA = "";
      this.digitB = this.getDigitPlace(5).toString();
      this.digitC = this.getDigitPlace(4).toString();
      this.digitD = this.getDigitPlace(3).toString();
      this.digitE = "K";
    } else if (this.value < 10000000) { // a,bcd,efg -> a.bcM
      this.digitA = this.getDigitPlace(6).toString();
      this.digitB = ".";
      this.digitC = this.getDigitPlace(5).toString();
      this.digitD = this.getDigitPlace(4).toString();
      this.digitE = "M";
    }
    console.log(this.digitA, this.digitB, this.digitC, this.digitD, this.digitE);
  }

}
