import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

export class FourDigitCode {
  constructor(
    public firstDigit?: number,
    public secondDigit?: number,
    public thirdDigit?: number,
    public fourthDigit?: number,
  ) {}

  public getCode(): string {
    return `${this.firstDigit}${this.secondDigit}${this.thirdDigit}${this.fourthDigit}`;
  }

  public isBlank(): boolean {
    return this.firstDigit === undefined
      && this.secondDigit === undefined
      && this.thirdDigit === undefined
      && this.fourthDigit === undefined;
  }

  public getDigit(index: number): number | string {
    if (index === 0) return this.firstDigit ?? '';
    if (index === 1) return this.secondDigit ?? '';
    if (index === 2) return this.thirdDigit ?? '';
    if (index === 3) return this.fourthDigit ?? '';
    return '';
  }

}

@Component({
  selector: 'app-four-digit-code',
  templateUrl: './four-digit-code.component.html',
  styleUrls: ['./four-digit-code.component.scss']
})
export class FourDigitCodeComponent {
  @Input() code!: FourDigitCode;
  @Output() codeChange = new EventEmitter<FourDigitCode>();

  public selectedDigitIndex?: number;

  readonly ZERO_TO_THREE = [0, 1, 2, 3];

  onClickDigit(index: number): void {
    if (this.code.isBlank()) index = 0;
    else this.selectedDigitIndex = index;
  }

  onClickedOutside(event: Event): void {
    this.selectedDigitIndex = undefined;
  }

  setSelectedDigitIndex(index: number): void {
    this.selectedDigitIndex = index;
  }

  // listen for digit key presses
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.selectedDigitIndex === undefined) return;

    const digit = parseInt(event.key);
    if (isNaN(digit)) return;

    if (this.selectedDigitIndex === 0) this.code.firstDigit = digit;
    if (this.selectedDigitIndex === 1) this.code.secondDigit = digit;
    if (this.selectedDigitIndex === 2) this.code.thirdDigit = digit;
    if (this.selectedDigitIndex === 3) this.code.fourthDigit = digit;
    this.codeChange.emit(this.code);

    if (this.selectedDigitIndex < 3) this.selectedDigitIndex++;
    else this.selectedDigitIndex = undefined;
  }

}
