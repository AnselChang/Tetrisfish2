import { ChangeDetectorRef, Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

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

  public isFilled(): boolean {
    return this.firstDigit !== undefined
      && this.secondDigit !== undefined
      && this.thirdDigit !== undefined
      && this.fourthDigit !== undefined;
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
  @Output() onSubmit = new EventEmitter<number>();

  public code = new FourDigitCode();
  public selectedDigitIndex?: number;
  public isCodeValid: boolean = true;

  readonly ZERO_TO_THREE = [0, 1, 2, 3];

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  onClickDigit(index: number): void {
    if (this.code.isBlank()) this.selectedDigitIndex = 0;
    else this.selectedDigitIndex = index;
    this.changeDetectorRef.detectChanges(); // Manually triggering change detection
  }

  onClickedOutside(event: Event): void {
    this.selectedDigitIndex = undefined;
    this.changeDetectorRef.detectChanges(); // Manually triggering change detection
  }

  setSelectedDigitIndex(index: number): void {
    this.selectedDigitIndex = index;
    this.changeDetectorRef.detectChanges(); // Manually triggering change detection
  }

  // listen for digit key presses
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.selectedDigitIndex === undefined) return;

    const digit = parseInt(event.key);
    if (isNaN(digit)) return;

    this.isCodeValid = true;

    if (this.selectedDigitIndex === 0) { // reset
      this.code.firstDigit = digit;
      this.code.secondDigit = undefined;
      this.code.thirdDigit = undefined;
      this.code.fourthDigit = undefined;
    }
    else if (this.selectedDigitIndex === 1) this.code.secondDigit = digit;
    else if (this.selectedDigitIndex === 2) this.code.thirdDigit = digit;
    else if (this.selectedDigitIndex === 3) this.code.fourthDigit = digit;
    
    
    if (this.selectedDigitIndex < 3) this.selectedDigitIndex++;
    else this.selectedDigitIndex = undefined;

    if (this.code.isFilled()) this.onSubmit.emit(parseInt(this.code.getCode()));
    this.changeDetectorRef.detectChanges(); // Manually triggering change detection
  }

  onInvalidCode(): void {
    this.isCodeValid = false;
    this.changeDetectorRef.detectChanges(); // Manually triggering change detection
  }

}
