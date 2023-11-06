import { Component, Input } from '@angular/core';
import { ThresholdType } from 'client/src/app/models/capture-models/capture-settings';
import { CaptureSettingsService } from 'client/src/app/services/capture/capture-settings.service';

@Component({
  selector: 'app-threshold-input',
  templateUrl: './threshold-input.component.html',
  styleUrls: ['./threshold-input.component.scss']
})
export class ThresholdInputComponent {
@Input() type!: ThresholdType;
@Input() label!: string;

constructor(private captureSettingsService: CaptureSettingsService) { }

public get threshold() {
  return this.captureSettingsService.get().thresholds[this.type];
}

}
